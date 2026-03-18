import { NextRequest, NextResponse } from 'next/server';
import { comprehendPattern } from '@/lib/comprehension/pipeline';

export const maxDuration = 300; // 5 minutes for complex patterns

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Check configuration
    const missingConfig: string[] = [];
    if (!process.env.GOOGLE_AI_API_KEY) {
      missingConfig.push('extraction (set GOOGLE_AI_API_KEY)');
    }
    if (!process.env.OPENAI_API_KEY) {
      missingConfig.push('comprehension (set OPENAI_API_KEY)');
    }

    if (missingConfig.length > 0) {
      return NextResponse.json(
        {
          error: 'Comprehension engine not configured',
          details: `Missing: ${missingConfig.join(', ')}`,
          help: 'Set GOOGLE_AI_API_KEY and OPENAI_API_KEY environment variables'
        },
        { status: 503 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Run comprehension pipeline
    const result = await comprehendPattern(buffer, {
      fileName: file.name,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Comprehension error:', error);
    return NextResponse.json(
      {
        error: 'Pattern comprehension failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
