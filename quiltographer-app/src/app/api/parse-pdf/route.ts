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
  'FPP': 'Foundation Paper Piecing (FPP)',
  'EPP': 'English Paper Piecing (EPP)',
  'FMQ': 'Free Motion Quilting (FMQ)',
  'BOM': 'Block of the Month (BOM)',
};

function expandAbbreviations(text: string): string {
  let expanded = text;
  for (const [abbr, full] of Object.entries(ABBREVIATIONS)) {
    const regex = new RegExp(`\\b${abbr}\\b(?!\\s*\\()`, 'g');
    expanded = expanded.replace(regex, full);
  }
  return expanded;
}

// Lines to skip when extracting pattern name
const SKIP_NAME_PATTERNS = [
  /^difficulty/i,
  /^rating/i,
  /^beginner/i,
  /^intermediate/i,
  /^advanced/i,
  /^expert/i,
  /^easy/i,
  /^free\s*pattern/i,
  /^quilt\s*size/i,
  /^finished\s*size/i,
  /^fabric\s*requirements/i,
  /^materials/i,
  /^cutting/i,
  /^instructions/i,
  /^designed\s*by/i,
  /^copyright/i,
  /^\d+["\u201d]\s*x\s*\d+/,
  /^page\s+\d/i,
  /^\s*$/,
];

function extractSteps(text: string): Array<{
  id: string;
  number: number;
  title: string;
  section: string;
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
    section: string;
    instruction: string;
    clarifiedInstruction?: string;
    techniques: string[];
    warnings: Array<{ type: string; message: string }>;
    tips: Array<{ text: string }>;
  }> = [];

  // First, identify sections in the pattern (Block Assembly, Quilt Assembly, etc.)
  const sectionHeaders = [
    'block assembly', 'quilt assembly', 'quilt top assembly', 'finishing',
    'border', 'borders', 'sashing', 'binding', 'piecing',
    'cutting instructions', 'construction', 'assembly',
    'make the blocks', 'assemble the quilt', 'add borders',
  ];

  // Find section boundaries
  const sections: Array<{ name: string; startIdx: number }> = [];
  const lowerText = text.toLowerCase();
  for (const header of sectionHeaders) {
    let searchFrom = 0;
    while (true) {
      const idx = lowerText.indexOf(header, searchFrom);
      if (idx === -1) break;
      // Check it's at the start of a line (or near it)
      const lineStart = text.lastIndexOf('\n', idx);
      const prefix = text.slice(Math.max(0, lineStart), idx).trim();
      if (prefix.length < 5) {
        sections.push({ name: header, startIdx: idx });
      }
      searchFrom = idx + header.length;
    }
  }
  sections.sort((a, b) => a.startIdx - b.startIdx);

  // Find which section a text position belongs to
  function getSectionName(pos: number): string {
    let sectionName = 'General';
    for (const sec of sections) {
      if (sec.startIdx <= pos) sectionName = sec.name;
      else break;
    }
    return sectionName;
  }

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

    if (rawInstruction.length < 10) continue;

    const section = getSectionName(match.index);

    // Detect techniques
    const techniques: string[] = [];
    const lower = rawInstruction.toLowerCase();
    if (lower.includes('hst') || lower.includes('half-square') || lower.includes('half square')) techniques.push('HST');
    if (lower.includes('flying geese') || lower.includes('flying-geese')) techniques.push('Flying Geese');
    if (lower.includes('press')) techniques.push('pressing');
    if (lower.includes('sew') || lower.includes('stitch')) techniques.push('piecing');
    if (lower.includes('cut') || lower.includes('subcut')) techniques.push('cutting');
    if (lower.includes('trim') || lower.includes('square up')) techniques.push('trimming');
    if (lower.includes('nest')) techniques.push('nesting seams');
    if (lower.includes('chain piec')) techniques.push('chain piecing');
    if (lower.includes('strip set') || lower.includes('strip-set')) techniques.push('strip piecing');
    if (lower.includes('appliq')) techniques.push('applique');
    if (lower.includes('paper piec')) techniques.push('paper piecing');

    // Generate warnings
    const warnings: Array<{ type: string; message: string }> = [];
    if (lower.includes('1/4"') || lower.includes('quarter inch') || lower.includes('¼')) {
      warnings.push({ type: 'important', message: 'Use accurate ¼" seam allowance' });
    }
    if (lower.includes('nest')) {
      warnings.push({ type: 'tip', message: 'Nesting seams helps points match perfectly' });
    }
    if (lower.includes('fussy cut')) {
      warnings.push({ type: 'important', message: 'Fussy cutting requires extra fabric for positioning' });
    }
    if (lower.includes('bias') && (lower.includes('stretch') || lower.includes('edge'))) {
      warnings.push({ type: 'important', message: 'Handle bias edges carefully to avoid stretching' });
    }
    if (lower.includes('right sides together') || lower.includes('rst')) {
      warnings.push({ type: 'tip', message: 'Check that right sides are facing before sewing' });
    }

    // Generate tips
    const tips: Array<{ text: string }> = [];
    if (lower.includes('press') && !lower.includes('press toward') && !lower.includes('press open')) {
      tips.push({ text: 'Press seams to one side (toward the darker fabric) unless otherwise specified' });
    }
    if (lower.includes('chain piec')) {
      tips.push({ text: 'Chain piecing saves thread and speeds up repetitive steps' });
    }

    // Extract title
    let title = `Step ${stepNum}`;
    const titleExtract = rawInstruction.match(/^([A-Z][a-zA-Z\s]{2,40}?)(?:[.\-\u2013:,;]|\s{2}|\sUsing|\sWith|\sSew(?:ing)?|\sCut(?:ting)?|\sPlace|\sTake|\sPress)/);
    if (titleExtract) {
      title = titleExtract[1].trim();
    } else {
      const verbPhrase = rawInstruction.match(/^((?:Sew|Cut|Make|Assemble|Attach|Join|Press|Trim|Add|Create|Lay|Arrange|Complete|Finish|Prepare|Iron|Pin|Fold|Gather|Place|Draw|Mark)\s+[A-Za-z\s]{2,30}?)(?:[.\-\u2013:,;]|\s{2})/);
      if (verbPhrase) {
        title = verbPhrase[1].trim();
      }
    }

    steps.push({
      id: `step-${steps.length + 1}`,
      number: steps.length + 1,
      title,
      section,
      instruction: rawInstruction,
      clarifiedInstruction: expandAbbreviations(rawInstruction),
      techniques,
      warnings,
      tips,
    });
  }

  // If no "Step N:" found, try numbered list patterns "1." "2." etc.
  if (steps.length === 0) {
    const numberedRegex = /(?:^|\n)\s*(\d+)\.\s+([^\n]+(?:\n(?!\s*\d+\.).*)*)/g;
    while ((match = numberedRegex.exec(text)) !== null) {
      const rawInstruction = match[2].trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
      if (rawInstruction.length < 15) continue;
      // Only include if it looks like an instruction
      const lower = rawInstruction.toLowerCase();
      const isInstruction = ['sew', 'cut', 'press', 'place', 'trim', 'join', 'attach', 'arrange', 'fold', 'pin', 'gather', 'make', 'assemble']
        .some(verb => lower.includes(verb));
      if (!isInstruction) continue;

      const techniques: string[] = [];
      if (lower.includes('sew') || lower.includes('stitch')) techniques.push('piecing');
      if (lower.includes('cut')) techniques.push('cutting');
      if (lower.includes('press')) techniques.push('pressing');

      steps.push({
        id: `step-${steps.length + 1}`,
        number: steps.length + 1,
        title: `Step ${steps.length + 1}`,
        section: 'General',
        instruction: rawInstruction,
        clarifiedInstruction: expandAbbreviations(rawInstruction),
        techniques,
        warnings: [],
        tips: [],
      });
    }
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
  const seen = new Set<string>();

  function addMaterial(name: string, amount: string, type: string) {
    const key = `${name.toLowerCase()}::${amount.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    materials.push({
      id: `mat-${materials.length + 1}`,
      name,
      amount,
      type,
    });
  }

  // Look for the materials/fabric section to focus extraction
  const materialsSection = findSection(text, ['fabric requirements', 'materials needed', 'materials', 'you will need', 'fabric needed', 'supply list']);

  // Look for "Fabric A" / "Fabric B" type labels with amounts
  const fabricLabelRegex = /(?:Fabric\s+)?([A-H])\s*[-–:]\s*(.+?)(?:\n|$)/gi;
  let match;
  const searchText = materialsSection || text;
  while ((match = fabricLabelRegex.exec(searchText)) !== null) {
    const label = `Fabric ${match[1].toUpperCase()}`;
    const detail = match[2].trim();
    const yardMatch = detail.match(/(\d+(?:[-\/]\d+)?)\s*yards?/i);
    if (yardMatch) {
      // Try to get a color or description
      const descMatch = detail.match(/^([^,\d]+)/);
      const desc = descMatch ? descMatch[1].trim() : '';
      const name = desc && desc.length > 2 && desc.length < 30 ? `${label} (${desc})` : label;
      addMaterial(name, yardMatch[1] + ' yards', 'fabric');
    }
  }

  // Look for yardage amounts with context
  const yardRegex = /(.{0,80}?)(\d+(?:[-\/]\d+)?)\s*yards?\b/gi;
  const fabricLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  let idx = 0;

  while ((match = yardRegex.exec(text)) !== null && idx < 15) {
    const context = match[1].trim();
    const amount = match[2];
    let fabricName = idx < fabricLetters.length ? `Fabric ${fabricLetters[idx]}` : `Fabric ${idx + 1}`;

    // Try to extract a meaningful name from context
    // Pattern: "Color Name - X yards" or "Description: X yards"
    const labelMatch = context.match(/([A-Z][A-Za-z\s/&]+?)\s*[:–\-]\s*$/);
    if (labelMatch && labelMatch[1].length < 30) {
      fabricName = labelMatch[1].trim();
    } else {
      // Try context before the number: "1/4 yard Fabric A" or "#12345 Name"
      const beforeMatch = context.match(/(?:#\d+\s+)?([A-Z][A-Za-z\s']+?)\s*$/);
      if (beforeMatch && beforeMatch[1].length > 2 && beforeMatch[1].length < 30) {
        fabricName = beforeMatch[1].trim();
      } else {
        // Try "X yards FabricName" after the match
        const afterMatch = text.slice(match.index + match[0].length, match.index + match[0].length + 50);
        const afterLabel = afterMatch.match(/^\s+(?:of\s+)?([A-Z][A-Za-z\s']{2,25}?)(?:\s*[\n(,;]|$)/);
        if (afterLabel) {
          fabricName = afterLabel[1].trim();
        }
      }
    }

    addMaterial(fabricName, amount + ' yards', 'fabric');
    idx++;
  }

  // Match fat quarters
  const fqRegex = /(\d+)\s*(?:fat\s*quarters?|FQs?)\b/gi;
  while ((match = fqRegex.exec(text)) !== null) {
    addMaterial('Fat Quarters', `${match[1]} fat quarters`, 'precut');
  }

  // Match specific strip dimensions: "X strips 2½" x WOF"
  const dimStripRegex = /(\d+)\s*strips?\s+(\d+(?:[½¼¾]|[-\/]\d+)?["\u201d]?\s*x\s*(?:\d+(?:[½¼¾]|[-\/]\d+)?["\u201d]?|WOF|LOF))/gi;
  while ((match = dimStripRegex.exec(text)) !== null) {
    addMaterial('Strips', `${match[1]} strips ${match[2]}`, 'precut');
  }

  // Match precut packs
  const packRegex = /(\d+)\s*(?:jelly\s*rolls?|charm\s*packs?|layer\s*cakes?|honey\s*buns?|mini\s*charms?)\b/gi;
  while ((match = packRegex.exec(text)) !== null) {
    const packName = match[0].replace(/^\d+\s*/, '').trim();
    addMaterial(packName.charAt(0).toUpperCase() + packName.slice(1), match[0], 'precut');
  }

  // Check for backing with yardage
  const backingMatch = text.match(/(\d+(?:[-\/]\d+)?)\s*yards?\s*(?:of\s+)?(?:for\s+)?backing/i)
    || text.match(/backing[:\s]+(\d+(?:[-\/]\d+)?)\s*yards?/i);
  if (backingMatch) {
    addMaterial('Backing Fabric', backingMatch[1] + ' yards', 'fabric');
  } else if (text.toLowerCase().includes('backing')) {
    addMaterial('Backing Fabric', 'See pattern', 'fabric');
  }

  // Check for binding with yardage
  const bindingMatch = text.match(/(\d+(?:[-\/]\d+)?)\s*yards?\s*(?:of\s+)?(?:for\s+)?binding/i)
    || text.match(/binding[:\s]+(\d+(?:[-\/]\d+)?)\s*yards?/i);
  if (bindingMatch) {
    addMaterial('Binding', bindingMatch[1] + ' yards', 'fabric');
  } else if (text.toLowerCase().includes('binding')) {
    // Look for strip-based binding
    const bindingStrips = text.match(/(\d+)\s*(?:strips?).*?(?:for\s+)?binding/i);
    if (bindingStrips) {
      addMaterial('Binding', `${bindingStrips[1]} strips`, 'fabric');
    } else {
      addMaterial('Binding', 'See pattern', 'fabric');
    }
  }

  // Check for batting
  if (text.toLowerCase().includes('batting')) {
    const battingMatch = text.match(/batting[:\s]+(\d+["\u201d]?\s*x\s*\d+["\u201d]?)/i)
      || text.match(/(\d+["\u201d]?\s*x\s*\d+["\u201d]?)\s*(?:piece\s+of\s+)?batting/i);
    addMaterial('Batting', battingMatch ? battingMatch[1] : 'As needed', 'notion');
  }

  // Check for thread
  if (text.toLowerCase().includes('thread')) {
    addMaterial('Thread', 'Coordinating', 'notion');
  }

  return materials;
}

// Helper: find a named section of text
function findSection(text: string, headers: string[]): string | null {
  const lower = text.toLowerCase();
  for (const header of headers) {
    const idx = lower.indexOf(header);
    if (idx === -1) continue;
    // Find the end of this section (next major header or end of text)
    const afterHeader = idx + header.length;
    const nextSectionKeywords = ['cutting', 'instructions', 'construction', 'assembly', 'step 1', 'diagram'];
    let endIdx = text.length;
    for (const keyword of nextSectionKeywords) {
      const nextIdx = lower.indexOf(keyword, afterHeader + 20);
      if (nextIdx !== -1 && nextIdx < endIdx) endIdx = nextIdx;
    }
    return text.slice(idx, endIdx);
  }
  return null;
}

function extractMetadata(text: string, fileName: string) {
  // Start with filename as fallback
  let name = fileName
    .replace('.pdf', '')
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase split
    .trim();

  // Try "Project Name: X" pattern (Robert Kaufman style)
  const projectNameMatch = text.match(/Project\s*Name[:\s]+([^\n]+)/i);
  if (projectNameMatch) {
    name = projectNameMatch[1].trim();
  } else {
    // Try to find pattern name near the top — skip metadata lines
    const lines = text.split('\n').slice(0, 30);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length < 3 || trimmed.length > 50) continue;
      if (SKIP_NAME_PATTERNS.some(pattern => pattern.test(trimmed))) continue;
      if (trimmed.includes('www.') || trimmed.includes('@') || trimmed.includes('©')) continue;
      if (/^\d/.test(trimmed)) continue;
      // Skip lines that are mostly numbers/punctuation
      if (trimmed.replace(/[^a-zA-Z]/g, '').length < 3) continue;
      // Skip lines that look like fabric codes
      if (/^[A-Z]{2,5}-\d+/.test(trimmed)) continue;
      name = trimmed;
      break;
    }
  }

  // Difficulty
  let difficulty = 3;
  const diffMatch = text.match(/difficulty[:\s]*(?:rating[:\s]*)?(beginner|easy|intermediate|advanced|expert|confident)/i);
  if (diffMatch) {
    const level = diffMatch[1].toLowerCase();
    if (level === 'beginner' || level === 'easy') difficulty = 1;
    else if (level === 'confident') difficulty = 2;
    else if (level === 'intermediate') difficulty = 3;
    else if (level === 'advanced') difficulty = 4;
    else if (level === 'expert') difficulty = 5;
  }

  // Finished size
  let finishedSize = { width: 0, height: 0, unit: 'inches' as const };
  // Try multiple size patterns
  const sizePatterns = [
    /(?:measures|finished|size|dimensions|quilt\s*size)[:\s]+(\d+)["\u201d]?\s*x\s*(\d+)["\u201d]?/i,
    /(\d+)["\u201d]\s*x\s*(\d+)["\u201d]\s*(?:finished|quilt)/i,
    /approximately\s+(\d+)["\u201d]?\s*x\s*(\d+)["\u201d]?/i,
  ];
  for (const pattern of sizePatterns) {
    const sizeMatch = text.match(pattern);
    if (sizeMatch) {
      finishedSize = {
        width: parseInt(sizeMatch[1]),
        height: parseInt(sizeMatch[2]),
        unit: 'inches',
      };
      break;
    }
  }

  // Designer
  let designer = '';
  const designerPatterns = [
    /designed\s+by\s+([A-Za-z\s.]+?)(?:\s+for|\s+of|\n|$)/i,
    /designer[:\s]+([A-Za-z\s.]+?)(?:\n|$)/i,
    /pattern\s+by\s+([A-Za-z\s.]+?)(?:\n|$)/i,
  ];
  for (const pattern of designerPatterns) {
    const designerMatch = text.match(pattern);
    if (designerMatch) {
      designer = designerMatch[1].trim();
      break;
    }
  }

  return { name, difficulty, finishedSize, designer };
}

// Extract cutting instructions
function extractCuttingInstructions(text: string): Array<{
  id: string;
  fabric: string;
  pieces: Array<{
    shape: string;
    quantity: number;
    dimensions: string;
    notes?: string;
  }>;
}> {
  const cuttingInstructions: Array<{
    id: string;
    fabric: string;
    pieces: Array<{
      shape: string;
      quantity: number;
      dimensions: string;
      notes?: string;
    }>;
  }> = [];

  // Look for cutting section
  const cuttingSection = findSection(text, ['cutting instructions', 'cutting directions', 'cutting', 'from fabric']);
  if (!cuttingSection) return cuttingInstructions;

  // Match "From Fabric X, cut:" patterns
  const fabricCutRegex = /(?:From|Fabric)\s+([A-Z])[,:\s]+cut[:\s]*([\s\S]*?)(?=(?:From|Fabric)\s+[A-Z]|$)/gi;
  let match;
  while ((match = fabricCutRegex.exec(cuttingSection)) !== null) {
    const fabric = `Fabric ${match[1]}`;
    const cutText = match[2];
    const pieces: Array<{ shape: string; quantity: number; dimensions: string; notes?: string }> = [];

    // Match "N squares X"" or "N rectangles X" x Y""
    const squareRegex = /(\d+)\s*(?:squares?)\s*(\d+(?:[½¼¾]|[-\/]\d+)?)["\u201d]?/gi;
    let pieceMatch;
    while ((pieceMatch = squareRegex.exec(cutText)) !== null) {
      pieces.push({ shape: 'square', quantity: parseInt(pieceMatch[1]), dimensions: `${pieceMatch[2]}" x ${pieceMatch[2]}"` });
    }

    const rectRegex = /(\d+)\s*(?:rectangles?|pieces?)\s*(\d+(?:[½¼¾]|[-\/]\d+)?)["\u201d]?\s*x\s*(\d+(?:[½¼¾]|[-\/]\d+)?)["\u201d]?/gi;
    while ((pieceMatch = rectRegex.exec(cutText)) !== null) {
      pieces.push({ shape: 'rectangle', quantity: parseInt(pieceMatch[1]), dimensions: `${pieceMatch[2]}" x ${pieceMatch[3]}"` });
    }

    const stripRegex = /(\d+)\s*(?:strips?)\s*(\d+(?:[½¼¾]|[-\/]\d+)?)["\u201d]?\s*x\s*(?:WOF|LOF|\d+(?:[½¼¾]|[-\/]\d+)?["\u201d]?)/gi;
    while ((pieceMatch = stripRegex.exec(cutText)) !== null) {
      const dims = pieceMatch[0].replace(/^\d+\s*strips?\s*/, '');
      pieces.push({ shape: 'strip', quantity: parseInt(pieceMatch[1]), dimensions: dims });
    }

    if (pieces.length > 0) {
      cuttingInstructions.push({ id: `cut-${cuttingInstructions.length + 1}`, fabric, pieces });
    }
  }

  return cuttingInstructions;
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
    const cuttingInstructions = extractCuttingInstructions(text);

    // Non-pattern detection
    if (steps.length < 2 && materials.length < 2) {
      return NextResponse.json(
        {
          error: "This PDF doesn't appear to contain a quilt pattern with instructions",
          details: "No construction steps were found. This may be a preview card or marketing page rather than a full pattern.",
        },
        { status: 422 }
      );
    }

    // Generate summary
    const techniques = [...new Set(steps.flatMap(s => s.techniques))].slice(0, 4);
    const sizeStr = metadata.finishedSize.width > 0
      ? `${metadata.finishedSize.width}" x ${metadata.finishedSize.height}"`
      : 'Size not specified';
    const summary = [
      sizeStr !== 'Size not specified' ? `A ${sizeStr} quilt pattern` : 'A quilt pattern',
      metadata.designer ? `designed by ${metadata.designer}` : '',
      `with ${steps.length} construction steps.`,
      techniques.length > 0 ? `Techniques: ${techniques.join(', ')}.` : '',
    ].filter(Boolean).join(' ');

    const readerPattern = {
      id: `pattern-${Date.now()}`,
      name: metadata.name,
      difficulty: metadata.difficulty,
      estimatedTime: Math.ceil(steps.length * 0.5),
      finishedSize: metadata.finishedSize,
      summary: summary.trim(),
      materials,
      cuttingInstructions,
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
