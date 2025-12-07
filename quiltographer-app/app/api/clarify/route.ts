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
export async function POST(request: NextRequest) {
  try {
    const { instruction, context } = await request.json();

    if (!instruction) {
      return NextResponse.json(
        { error: 'Instruction is required' },
        { status: 400 }
      );
    }

    // Check for API key (using workaround for Turbopack)
    const apiKey = getApiKey();
    console.log('API Key present:', !!apiKey, 'Key prefix:', apiKey?.substring(0, 15));
    if (!apiKey) {
      // Fallback to mock response in development
      console.warn('ANTHROPIC_API_KEY not set, using mock response');
      return NextResponse.json({
        clarification: generateMockClarification(instruction),
      });
    }

    // Call Claude Haiku 4.5
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
      throw new Error('Failed to get AI clarification');
    }

    const data = await response.json();
    const clarification = data.content[0]?.text || 'Unable to generate clarification';

    return NextResponse.json({ clarification });
  } catch (error) {
    console.error('Clarification error:', error);
    return NextResponse.json(
      { error: 'Failed to get clarification' },
      { status: 500 }
    );
  }
}

/**
 * Mock clarification for development without API key
 */
function generateMockClarification(instruction: string): string {
  const upperInstruction = instruction.toUpperCase();
  
  if (upperInstruction.includes('RST')) {
    return 'Place the two fabric pieces with their printed/colored sides facing each other. This hides the seam on the inside of your finished quilt.';
  }
  if (upperInstruction.includes('HST')) {
    return 'A Half Square Triangle is made by sewing two squares diagonally, then cutting them apart. You\'ll get two identical triangle-square units.';
  }
  if (upperInstruction.includes('WOF')) {
    return 'Cut across the full width of your fabric (about 42-44 inches from edge to edge). Your strip will be as long as your fabric is wide.';
  }
  if (upperInstruction.includes('PRESS')) {
    return 'Use your iron to flatten the seam. "Press" means lift and set down the iron—don\'t slide it, which can stretch the fabric.';
  }
  if (upperInstruction.includes('CHAIN')) {
    return 'Feed pieces through your sewing machine one after another without cutting the thread between them. This saves time and thread!';
  }
  
  return `This step asks you to: ${instruction.toLowerCase()}. Take your time and double-check your measurements before cutting or sewing.`;
}
