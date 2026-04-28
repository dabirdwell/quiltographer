import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load API key from .env.local (Turbopack workaround for Next.js 15)
function getApiKey(): string | undefined {
  // First try process.env
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }
  // Fallback: read from file directly
  try {
    const envPath = join(process.cwd(), '.env.local');
    const content = readFileSync(envPath, 'utf-8');
    const match = content.match(/ANTHROPIC_API_KEY=(.+)/);
    return match?.[1]?.trim();
  } catch {
    return undefined;
  }
}

/**
 * POST /api/clarify
 * 
 * AI-powered step clarification using Claude Haiku 4.5
 * 
 * Request body:
 * - instruction: The quilting instruction to clarify
 * - context: Optional additional context (pattern name, previous steps, etc.)
 * 
 * Response:
 * - clarification: Plain-English explanation
 */
// Issue 5: Rate limiting — 10 clarifications per session (free tier)
const SESSION_LIMIT = 10;
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

export async function POST(request: NextRequest) {
  try {
    const { instruction, context } = await request.json();

    if (!instruction) {
      return NextResponse.json(
        { error: 'Instruction is required' },
        { status: 400 }
      );
    }

    // Rate limiting
    const sessionId = request.headers.get('x-session-id') || request.headers.get('x-forwarded-for') || 'anonymous';
    const isPro = request.headers.get('x-pro-user') === 'true';
    const rateCheck = checkRateLimit(sessionId, isPro);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Free tier limit reached (10 clarifications per session). Upgrade to Pro for unlimited.' },
        { status: 429 }
      );
    }

    // Check for API key (using workaround for Turbopack)
    const apiKey = getApiKey();
    if (!apiKey) {
      // Fallback to mock response in development
      console.warn('ANTHROPIC_API_KEY not set, using mock response');
      return NextResponse.json({
        clarification: generateMockClarification(instruction),
        remaining: rateCheck.remaining,
      });
    }

    // Call Claude Haiku 4.5 — real AI clarification
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: `You are a friendly, experienced quilting instructor helping someone understand pattern instructions.

Your job is to:
1. Explain the instruction in plain, simple English
2. Decode any quilting abbreviations (RST = Right Sides Together, HST = Half Square Triangle, WOF = Width of Fabric, etc.)
3. Describe the physical action the quilter should take
4. Mention any common mistakes to avoid

Keep your response concise (2-4 sentences) but clear. Assume the reader is a beginner. Be warm and encouraging.`,
        messages: [
          {
            role: 'user',
            content: context
              ? `Pattern context: ${context}\n\nInstruction to explain: "${instruction}"`
              : `Please explain this quilting instruction in simple terms: "${instruction}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      // Fall back to mock clarification instead of failing
      return NextResponse.json({
        clarification: generateMockClarification(instruction),
        remaining: rateCheck.remaining,
      });
    }

    const data = await response.json();
    const clarification = data.content[0]?.text || 'Unable to generate clarification';

    return NextResponse.json({ clarification, remaining: rateCheck.remaining });
  } catch (error) {
    console.error('Clarification error:', error);
    // Fall back to mock rather than failing the user experience
    const { instruction } = await request.clone().json().catch(() => ({ instruction: '' }));
    return NextResponse.json({
      clarification: generateMockClarification(instruction || 'this step'),
      remaining: null,
    });
  }
}

/**
 * Mock clarification for development without API key
 */
function generateMockClarification(instruction: string): string {
  const upper = instruction.toUpperCase();
  
  if (upper.includes('RST')) {
    return 'Place the two fabric pieces with their printed/colored sides facing each other (Right Sides Together). When you sew and flip them open, the seam will be hidden on the inside of your finished quilt.';
  }
  if (upper.includes('HST') || upper.includes('HALF SQUARE')) {
    return 'A Half Square Triangle (HST) is made by drawing a diagonal line on a light square, placing it on a dark square RST, sewing ¼" on each side of the line, then cutting on the line. You get two identical triangle-square units from each pair!';
  }
  if (upper.includes('WOF') || upper.includes('WIDTH OF FABRIC')) {
    return 'Cut across the full width of your fabric (about 42-44 inches from selvage to selvage). Your strip will be as long as your fabric is wide. This is the most common way to cut quilting strips.';
  }
  if (upper.includes('PRESS')) {
    return 'Use your iron to flatten the seam. "Press" means lift and set down the iron — don\'t slide it, which can stretch and distort your fabric. Press seams toward the darker fabric to prevent show-through.';
  }
  if (upper.includes('CHAIN')) {
    return 'Feed pieces through your sewing machine one after another without cutting the thread between them. This saves time, thread, and keeps your pieces in order. Snip them apart when you\'re done with the whole batch.';
  }
  if (upper.includes('ROTATE') || upper.includes('CLOCKWISE')) {
    return 'Turn your pieced unit 90° clockwise (a quarter turn to the right). This sets up the next strip to be added along the correct edge. The rotation creates the spiral pattern that gives log cabin blocks their distinctive look.';
  }
  if (upper.includes('TRIM') || upper.includes('SQUARE UP')) {
    return 'Use your rotary cutter and ruler to trim the edges even. After sewing, the strip will overhang slightly — trimming makes everything flush. This keeps your block accurate as you add more rounds.';
  }
  if (upper.includes('SEAM') && upper.includes('¼')) {
    return 'Sew exactly ¼ inch from the edge of your fabric. This is the standard quilting seam allowance. A consistent ¼" seam is the single most important skill in quilting — even small variations compound over many seams.';
  }
  if (upper.includes('CENTER') || upper.includes('HEART')) {
    return 'The center square is the starting point of your block — everything else builds outward from it. Cut it precisely, because any error here gets magnified with every round of strips you add.';
  }
  if (upper.includes('STRIP')) {
    return 'Strips are long, narrow pieces of fabric cut to a specific width (usually 2½" for standard log cabin blocks). You\'ll sew these around the center square in order, building outward like the logs in a cabin wall.';
  }
  if (upper.includes('ROUND') || upper.includes('REPEAT')) {
    return 'Each "round" means adding strips to all four sides of your growing block. After completing a round, your block gets bigger by one strip width on each side. Continue until you reach the desired finished size.';
  }
  if (upper.includes('SELVAGE')) {
    return 'The selvage is the tightly woven edge on each side of your fabric. Always trim off selvages before cutting pieces — they\'re denser than the rest of the fabric and can cause puckering if included in your quilt.';
  }
  if (upper.includes('BIAS')) {
    return 'The bias is the diagonal direction of fabric, at 45° to the straight grain. Fabric stretches most on the bias. Be careful not to pull or tug bias edges — they can distort your block. Handle gently and press, don\'t iron.';
  }
  
  return 'This step is about assembling your pieces carefully. Take your time with accurate cutting and consistent ¼" seam allowances — precision now saves frustration later. If anything feels unclear, re-read the step and check your measurements twice.';
}
