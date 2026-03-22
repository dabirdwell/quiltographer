import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

// Reuse the same API key loading strategy as /api/clarify
function getApiKey(): string | undefined {
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }
  try {
    const envPath = join(process.cwd(), '.env.local');
    const content = readFileSync(envPath, 'utf-8');
    const match = content.match(/ANTHROPIC_API_KEY=(.+)/);
    return match?.[1]?.trim();
  } catch {
    return undefined;
  }
}

// Rate limiting — 20 messages per session per hour (free tier)
const SESSION_LIMIT = 20;
const sessionCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(sessionId: string, isPro: boolean): { allowed: boolean; remaining: number } {
  if (isPro) return { allowed: true, remaining: Infinity };

  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  let session = sessionCounts.get(sessionId);

  if (!session || now > session.resetAt) {
    session = { count: 0, resetAt: now + hourMs };
    sessionCounts.set(sessionId, session);
  }

  if (session.count >= SESSION_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  session.count++;
  return { allowed: true, remaining: SESSION_LIMIT - session.count };
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * POST /api/pattern-chat
 *
 * AI Pattern Assistant — conversational Q&A about a parsed pattern.
 *
 * Request body:
 * - message: The user's question
 * - history: Previous chat messages for context
 * - pattern: The parsed ReaderPattern JSON
 *
 * Response:
 * - reply: The assistant's answer
 * - remaining: Rate limit remaining
 */
export async function POST(request: NextRequest) {
  try {
    const { message, history, pattern } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!pattern) {
      return NextResponse.json(
        { error: 'Pattern data is required' },
        { status: 400 }
      );
    }

    // Rate limiting
    const sessionId = request.headers.get('x-session-id') || request.headers.get('x-forwarded-for') || 'anonymous';
    const isPro = request.headers.get('x-pro-user') === 'true';
    const rateCheck = checkRateLimit(sessionId, isPro);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Free tier limit reached (20 messages per hour). Upgrade to Pro for unlimited.' },
        { status: 429 }
      );
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      console.warn('ANTHROPIC_API_KEY not set, using mock response');
      return NextResponse.json({
        reply: generateMockReply(message, pattern),
        remaining: rateCheck.remaining,
      });
    }

    // Build the system prompt with full pattern context
    const systemPrompt = buildSystemPrompt(pattern);

    // Build conversation history for multi-turn context
    const messages: ChatMessage[] = [
      ...(Array.isArray(history) ? history.slice(-10) : []),
      { role: 'user', content: message },
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const reply = data.content[0]?.text || 'Sorry, I couldn\'t generate a response.';

    return NextResponse.json({ reply, remaining: rateCheck.remaining });
  } catch (error) {
    console.error('Pattern chat error:', error);
    return NextResponse.json(
      { error: 'Failed to get response from assistant' },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(pattern: Record<string, unknown>): string {
  const p = pattern;
  const materials = Array.isArray(p.materials)
    ? p.materials.map((m: Record<string, string>) =>
        `- ${m.name} (${m.type}): ${m.amount || m.quantity || 'see pattern'}${m.notes ? ` — ${m.notes}` : ''}`
      ).join('\n')
    : 'No materials listed';

  const steps = Array.isArray(p.steps)
    ? p.steps.map((s: Record<string, unknown>) =>
        `Step ${s.number}: ${s.title || ''}\n  ${s.instruction}${Array.isArray(s.techniques) && s.techniques.length ? `\n  Techniques: ${s.techniques.join(', ')}` : ''}`
      ).join('\n\n')
    : 'No steps listed';

  const cutting = Array.isArray(p.cuttingInstructions)
    ? p.cuttingInstructions.map((c: Record<string, unknown>) => {
        const pieces = Array.isArray(c.pieces)
          ? c.pieces.map((pc: Record<string, unknown>) => `    ${pc.quantity}x ${pc.shape} ${pc.dimensions}${pc.notes ? ` (${pc.notes})` : ''}`).join('\n')
          : '';
        return `- ${c.fabric}:\n${pieces}`;
      }).join('\n')
    : 'No cutting instructions';

  const finishedSize = p.finishedSize && typeof p.finishedSize === 'object'
    ? `${(p.finishedSize as Record<string, unknown>).width}" × ${(p.finishedSize as Record<string, unknown>).height}" ${(p.finishedSize as Record<string, unknown>).unit}`
    : 'Not specified';

  return `You are a friendly, knowledgeable quilting assistant helping someone work through a quilt pattern. You have the complete pattern loaded and can answer any questions about it.

## Pattern: ${p.name || 'Untitled'}
${p.description || ''}

- Difficulty: ${p.difficulty}/5
- Estimated Time: ${p.estimatedTime || '?'} hours
- Finished Size: ${finishedSize}
- Designer: ${(p.source as Record<string, string>)?.designer || 'Unknown'}

## Materials
${materials}

## Cutting Instructions
${cutting}

## Construction Steps
${steps}

${p.summary ? `## Summary\n${p.summary}` : ''}

## Your Role
- Answer questions about this specific pattern — materials, steps, techniques, difficulty
- Explain quilting terminology in plain English (RST = Right Sides Together, HST = Half Square Triangle, WOF = Width of Fabric, FPP = Foundation Paper Piecing, etc.)
- Help with fabric calculations and yardage questions based on the pattern data
- Offer beginner-friendly tips and warn about common mistakes
- If asked about something not in the pattern, say so honestly
- Keep answers concise but helpful (2-5 sentences for simple questions, more for complex ones)
- Be warm, encouraging, and patient — quilting should be fun!`;
}

function generateMockReply(message: string, pattern: Record<string, unknown>): string {
  const lower = message.toLowerCase();

  if (lower.includes('beginner') || lower.includes('difficulty')) {
    const d = pattern.difficulty as number;
    if (d <= 2) return `This pattern is rated ${d}/5 difficulty — great for beginners! It uses straightforward techniques and should be very approachable for someone new to quilting.`;
    if (d <= 3) return `This pattern is rated ${d}/5 — it's intermediate level. If you've made a few quilts before, you should be comfortable. Take your time with any new techniques.`;
    return `This pattern is rated ${d}/5 — it's on the advanced side. I'd recommend having some quilting experience before tackling this one, especially with the more complex assembly steps.`;
  }

  if (lower.includes('tool') || lower.includes('need')) {
    return 'For this pattern you\'ll need: a rotary cutter, cutting mat, acrylic ruler, sewing machine, iron, and pins or clips. A seam ripper is always handy to have nearby!';
  }

  if (lower.includes('fabric') || lower.includes('much')) {
    const materials = Array.isArray(pattern.materials) ? pattern.materials : [];
    const fabrics = materials.filter((m: Record<string, string>) => m.type === 'fabric');
    if (fabrics.length > 0) {
      return `This pattern calls for ${fabrics.length} different fabrics. Check the materials list for exact yardage — I\'d recommend buying an extra 10% to account for mistakes or shrinkage.`;
    }
    return 'Check the materials list in the pattern for fabric requirements. As a general tip, buy a little extra to allow for mistakes!';
  }

  if (lower.includes('step')) {
    const stepMatch = message.match(/step\s*(\d+)/i);
    if (stepMatch) {
      const stepNum = parseInt(stepMatch[1]);
      const steps = Array.isArray(pattern.steps) ? pattern.steps : [];
      const step = steps.find((s: Record<string, number>) => s.number === stepNum);
      if (step) {
        return `Step ${stepNum}: ${(step as Record<string, string>).instruction} — Take your time with this step and double-check your measurements before cutting or sewing.`;
      }
    }
  }

  return `That's a great question about "${(pattern as Record<string, string>).name || 'this pattern'}"! (Note: AI assistant is running in demo mode — set ANTHROPIC_API_KEY for full responses.)`;
}
