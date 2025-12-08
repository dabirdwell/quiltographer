import { NextRequest, NextResponse } from 'next/server';
import { comprehendPattern } from '@/lib/comprehension/pipeline';
import { providerRegistry } from '@/lib/providers/registry';

export const maxDuration = 300; // 5 minutes for complex patterns
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Check provider availability
    const availability = await providerRegistry.checkAvailability();
    if (!availability.ready) {
      return NextResponse.json(
        {
          error: 'Comprehension engine not configured',
          details: `Missing: ${availability.missing.join(', ')}`,
          help: 'Set GOOGLE_AI_API_KEY and OPENAI_API_KEY environment variables',
        },
        { status: 503 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Optional: Get provider preferences from query params
    const { searchParams } = new URL(request.url);
    const extractionProvider = searchParams.get('extraction') || undefined;
    const comprehensionProvider = searchParams.get('comprehension') || undefined;
    const skipDiagrams = searchParams.get('skipDiagrams') === 'true';

    console.log(`[API] Processing ${file.name} (${buffer.length} bytes)`);

    // Run comprehension pipeline
    const pattern = await comprehendPattern(buffer, {
      extractionProvider,
      comprehensionProvider,
      skipDiagrams,
    });

    console.log(`[API] Comprehension complete: ${pattern.metadata.name} (${pattern.processingTime}ms)`);

    return NextResponse.json(pattern);

  } catch (error) {
    console.error('[API] Comprehension error:', error);

    return NextResponse.json(
      {
        error: 'Pattern comprehension failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check status
export async function GET() {
  try {
    await providerRegistry.initialize();
    const availability = await providerRegistry.checkAvailability();
    const providers = providerRegistry.listProviders();

    return NextResponse.json({
      status: availability.ready ? 'ready' : 'not_configured',
      providers,
      missing: availability.missing,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
