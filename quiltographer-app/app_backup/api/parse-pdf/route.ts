// API route for PDF parsing
import { NextRequest, NextResponse } from 'next/server';

// pdf-parse has a bug where it tries to load test files when required
// directly, so we import from the lib subdirectory to avoid this
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse/lib/pdf-parse');

// Quilt abbreviation expansions
const ABBREVIATIONS: Record<string, string> = {
  'RST': 'Right Sides Together (RST)',
  'WST': 'Wrong Sides Together (WST)',
  'HST': 'Half Square Triangle (HST)',
  'HSTs': 'Half Square Triangles (HSTs)',
  'QST': 'Quarter Square Triangle (QST)',
  'WOF': 'Width of Fabric (WOF)',
  'LOF': 'Length of Fabric (LOF)',
  'FQ': 'Fat Quarter (FQ)',
  'SA': 'Seam Allowance (SA)',
};

function expandAbbreviations(text: string): string {
  let expanded = text;
  for (const [abbr, full] of Object.entries(ABBREVIATIONS)) {
    // Only expand if not already expanded (not followed by opening paren)
    const regex = new RegExp(`\\b${abbr}\\b(?!\\s*\\()`, 'g');
    expanded = expanded.replace(regex, full);
  }
  return expanded;
}

function extractSteps(text: string): Array<{
  id: string;
  number: number;
  title: string;
  instruction: string;
  clarifiedInstruction?: string;
  techniques: string[];
  warnings: Array<{ type: string; message: string }>;
  tips: Array<{ text: string }>;
}> {
  const steps: Array<{
    id: string;
    number: number;
    title: string;
    instruction: string;
    clarifiedInstruction?: string;
    techniques: string[];
    warnings: Array<{ type: string; message: string }>;
    tips: Array<{ text: string }>;
  }> = [];

  // Match "Step X:" or "Step X." patterns
  const stepRegex = /Step\s+(\d+)[:\.]?\s*([^]*?)(?=Step\s+\d+[:\.]|$)/gi;
  let match;

  while ((match = stepRegex.exec(text)) !== null) {
    const stepNum = parseInt(match[1]);
    const rawInstruction = match[2].trim()
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/page\s+\d+/gi, '')
      .trim();

    if (rawInstruction.length < 10) continue; // Skip empty steps

    // Detect techniques
    const techniques: string[] = [];
    const lower = rawInstruction.toLowerCase();
    if (lower.includes('hst') || lower.includes('half-square')) techniques.push('HST');
    if (lower.includes('press')) techniques.push('pressing');
    if (lower.includes('sew')) techniques.push('piecing');
    if (lower.includes('cut') || lower.includes('subcut')) techniques.push('cutting');
    if (lower.includes('trim')) techniques.push('trimming');
    if (lower.includes('nest')) techniques.push('nesting seams');

    // Generate warnings
    const warnings: Array<{ type: string; message: string }> = [];
    if (lower.includes('1/4"') || lower.includes('quarter inch')) {
      warnings.push({ type: 'important', message: 'Use accurate ¼" seam allowance' });
    }
    if (lower.includes('nest')) {
      warnings.push({ type: 'tip', message: 'Nesting seams helps points match perfectly' });
    }
    if (lower.includes('fussy cut')) {
      warnings.push({ type: 'important', message: 'Fussy cutting requires extra fabric for positioning' });
    }

    // Extract section headers
    let title = `Step ${stepNum}`;
    if (stepNum === 1 || stepNum === 2) title = `Step ${stepNum}: Make HSTs`;
    else if (stepNum >= 3 && stepNum <= 8) title = `Step ${stepNum}: Assemble Blocks`;
    else if (stepNum >= 9) title = `Step ${stepNum}: Quilt Assembly`;

    steps.push({
      id: `step-${stepNum}`,
      number: stepNum,
      title,
      instruction: rawInstruction,
      clarifiedInstruction: expandAbbreviations(rawInstruction),
      techniques,
      warnings,
      tips: [],
    });
  }

  return steps;
}

function extractMaterials(text: string): Array<{
  id: string;
  name: string;
  amount: string;
  type: string;
}> {
  const materials: Array<{
    id: string;
    name: string;
    amount: string;
    type: string;
  }> = [];

  // Look for yardage amounts
  const yardRegex = /(\d+(?:[-\/]\d+)?)\s*yards?\b/gi;
  const fabricLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  let idx = 0;
  let match;

  while ((match = yardRegex.exec(text)) !== null && idx < 10) {
    materials.push({
      id: `mat-${idx + 1}`,
      name: idx < fabricLetters.length ? `Fabric ${fabricLetters[idx]}` : `Fabric ${idx + 1}`,
      amount: match[0],
      type: 'fabric',
    });
    idx++;
  }

  // Check for backing
  if (text.toLowerCase().includes('backing')) {
    const backingMatch = text.match(/(\d+(?:[-\/]\d+)?)\s*yards?\s*(?:for\s+)?backing/i);
    if (backingMatch) {
      materials.push({
        id: 'mat-backing',
        name: 'Backing',
        amount: backingMatch[1] + ' yards',
        type: 'fabric',
      });
    }
  }

  // Check for binding
  if (text.toLowerCase().includes('binding')) {
    materials.push({
      id: 'mat-binding',
      name: 'Binding',
      amount: '6 strips 2½" x WOF',
      type: 'fabric',
    });
  }

  return materials;
}

function extractMetadata(text: string, fileName: string) {
  // Pattern name - look for title patterns
  let name = fileName.replace('.pdf', '').replace(/-/g, ' ');
  const titleMatch = text.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,4}$/m);
  if (titleMatch) {
    name = titleMatch[0];
  }
  // Try to find pattern name near the top
  const lines = text.split('\n').slice(0, 20);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 3 && trimmed.length < 40 &&
        !trimmed.includes('www.') &&
        !trimmed.includes('@') &&
        !trimmed.match(/^\d/) &&
        !trimmed.toLowerCase().includes('difficulty')) {
      name = trimmed;
      break;
    }
  }

  // Difficulty
  let difficulty = 3;
  const diffMatch = text.match(/difficulty.*?(beginner|easy|intermediate|advanced|expert)/i);
  if (diffMatch) {
    const level = diffMatch[1].toLowerCase();
    if (level === 'beginner' || level === 'easy') difficulty = 1;
    else if (level === 'intermediate') difficulty = 3;
    else if (level === 'advanced') difficulty = 4;
    else if (level === 'expert') difficulty = 5;
  }

  // Finished size - handles "measures: 54" x 54"" with inch marks
  let finishedSize = { width: 0, height: 0, unit: 'inches' as const };
  // Match patterns like "measures: 54" x 54"" or "finished size: 54 x 54"
  const sizeMatch = text.match(/(?:measures|finished|size)[:\s]+(\d+)["\u201d]?\s*x\s*(\d+)["\u201d]?/i);
  if (sizeMatch) {
    finishedSize = {
      width: parseInt(sizeMatch[1]),
      height: parseInt(sizeMatch[2]),
      unit: 'inches',
    };
  }

  // Designer
  let designer = '';
  const designerMatch = text.match(/designed\s+by\s+([A-Za-z\s]+?)(?:\s+for|\n|$)/i);
  if (designerMatch) {
    designer = designerMatch[1].trim();
  }

  return { name, difficulty, finishedSize, designer };
}

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

    // Convert File to Buffer for pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the PDF
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    // Extract pattern data
    const metadata = extractMetadata(text, file.name);
    const materials = extractMaterials(text);
    const steps = extractSteps(text);

    // Generate summary
    const summary = `A ${metadata.finishedSize.width}"x${metadata.finishedSize.height}" quilt pattern ` +
      `${metadata.designer ? `designed by ${metadata.designer}` : ''} ` +
      `with ${steps.length} construction steps. ` +
      `Techniques include: ${[...new Set(steps.flatMap(s => s.techniques))].slice(0, 4).join(', ')}.`;

    const readerPattern = {
      id: `pattern-${Date.now()}`,
      name: metadata.name,
      difficulty: metadata.difficulty,
      estimatedTime: Math.ceil(steps.length * 0.5), // rough estimate
      finishedSize: metadata.finishedSize,
      summary: summary.trim(),
      materials,
      cuttingInstructions: [], // TODO: extract cutting
      steps,
      source: {
        fileName: file.name,
        parsedAt: new Date(),
        pages: pdfData.numpages,
        designer: metadata.designer,
      }
    };

    return NextResponse.json(readerPattern);

  } catch (error) {
    console.error('PDF parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
