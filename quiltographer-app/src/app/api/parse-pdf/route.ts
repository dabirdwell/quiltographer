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

  // --- Issue 2: Section-scoped step numbering ---
  // Detect section headers in the text (lines ending with ":" or matching assembly/cutting/piecing)
  const sectionHeaderPatterns = [
    /^(block\s+assembly)\s*[:\-]?\s*$/im,
    /^(quilt\s+(?:top\s+)?assembly)\s*[:\-]?\s*$/im,
    /^(finishing)\s*[:\-]?\s*$/im,
    /^(borders?)\s*[:\-]?\s*$/im,
    /^(sashing)\s*[:\-]?\s*$/im,
    /^(binding)\s*[:\-]?\s*$/im,
    /^(piecing)\s*[:\-]?\s*$/im,
    /^(cutting\s+instructions?)\s*[:\-]?\s*$/im,
    /^(construction)\s*[:\-]?\s*$/im,
    /^(make\s+the\s+blocks?)\s*[:\-]?\s*$/im,
    /^(assemble\s+the\s+quilt)\s*[:\-]?\s*$/im,
    /^(add\s+borders?)\s*[:\-]?\s*$/im,
  ];

  // Also detect section headers inline — lines containing these keywords near step definitions
  const sectionKeywords = [
    'block assembly', 'quilt assembly', 'quilt top assembly', 'finishing',
    'border', 'borders', 'sashing', 'binding', 'piecing',
    'cutting instructions', 'construction', 'assembly',
    'make the blocks', 'assemble the quilt', 'add borders',
  ];

  // Find section boundaries by scanning text
  const sections: Array<{ name: string; startIdx: number }> = [];
  const lowerText = text.toLowerCase();
  for (const keyword of sectionKeywords) {
    let searchFrom = 0;
    while (true) {
      const idx = lowerText.indexOf(keyword, searchFrom);
      if (idx === -1) break;
      const lineStart = text.lastIndexOf('\n', idx);
      const prefix = text.slice(Math.max(0, lineStart), idx).trim();
      if (prefix.length < 5) {
        // Capitalize section name for display
        const displayName = keyword.replace(/\b\w/g, c => c.toUpperCase());
        sections.push({ name: displayName, startIdx: idx });
      }
      searchFrom = idx + keyword.length;
    }
  }
  sections.sort((a, b) => a.startIdx - b.startIdx);
  // Deduplicate overlapping sections (e.g., "assembly" inside "block assembly")
  const dedupedSections: Array<{ name: string; startIdx: number }> = [];
  for (const sec of sections) {
    const isDuplicate = dedupedSections.some(
      existing => Math.abs(existing.startIdx - sec.startIdx) < 20
    );
    if (!isDuplicate) {
      dedupedSections.push(sec);
    } else {
      // Keep the longer (more specific) name
      const existingIdx = dedupedSections.findIndex(
        existing => Math.abs(existing.startIdx - sec.startIdx) < 20
      );
      if (existingIdx >= 0 && sec.name.length > dedupedSections[existingIdx].name.length) {
        dedupedSections[existingIdx] = sec;
      }
    }
  }

  function getSectionName(pos: number): string {
    let sectionName = 'General';
    for (const sec of dedupedSections) {
      if (sec.startIdx <= pos) sectionName = sec.name;
      else break;
    }
    return sectionName;
  }

  // --- Issue 3: Track original step numbers to detect mid-count starts ---
  let firstOriginalStepNum = Infinity;
  let lastOriginalStepNum = 0;

  // Collect raw steps with their original numbers and positions
  const rawSteps: Array<{
    originalNum: number;
    position: number;
    instruction: string;
    section: string;
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

    if (rawInstruction.length < 10) continue;

    const section = getSectionName(match.index);

    if (stepNum < firstOriginalStepNum) firstOriginalStepNum = stepNum;
    if (stepNum > lastOriginalStepNum) lastOriginalStepNum = stepNum;

    rawSteps.push({
      originalNum: stepNum,
      position: match.index,
      instruction: rawInstruction,
      section,
    });
  }

  // --- Issue 2: Section-scope step numbering ---
  // If we have duplicate original step numbers across different sections, prefix with section
  const stepNumCounts = new Map<number, number>();
  for (const rs of rawSteps) {
    stepNumCounts.set(rs.originalNum, (stepNumCounts.get(rs.originalNum) || 0) + 1);
  }
  const hasDuplicateNums = Array.from(stepNumCounts.values()).some(count => count > 1);

  // --- Issue 3: If first step > 1, note that earlier steps are in images ---
  let imageStepsNote = '';
  if (firstOriginalStepNum > 1 && rawSteps.length > 0) {
    imageStepsNote = `Note: Steps 1-${firstOriginalStepNum - 1} are in diagram images in the pattern PDF.`;
  }

  // Build final steps with section-scoped numbering
  let globalStepCounter = 1;

  // If steps start mid-count, add the image note as an info step
  if (imageStepsNote) {
    steps.push({
      id: 'step-image-note',
      number: globalStepCounter++,
      title: 'Visual Steps (in pattern images)',
      section: rawSteps[0]?.section || 'General',
      instruction: imageStepsNote,
      clarifiedInstruction: imageStepsNote,
      techniques: [],
      warnings: [{ type: 'important', message: imageStepsNote }],
      tips: [{ text: 'Refer to the printed pattern PDF for the diagram-based steps' }],
    });
  }

  for (const rs of rawSteps) {
    const rawInstruction = rs.instruction;

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

    // Extract title — include section prefix if duplicates exist
    let title = `Step ${rs.originalNum}`;
    const titleExtract = rawInstruction.match(/^([A-Z][a-zA-Z\s]{2,40}?)(?:[.\-\u2013:,;]|\s{2}|\sUsing|\sWith|\sSew(?:ing)?|\sCut(?:ting)?|\sPlace|\sTake|\sPress)/);
    if (titleExtract) {
      title = titleExtract[1].trim();
    } else {
      const verbPhrase = rawInstruction.match(/^((?:Sew|Cut|Make|Assemble|Attach|Join|Press|Trim|Add|Create|Lay|Arrange|Complete|Finish|Prepare|Iron|Pin|Fold|Gather|Place|Draw|Mark)\s+[A-Za-z\s]{2,30}?)(?:[.\-\u2013:,;]|\s{2})/);
      if (verbPhrase) {
        title = verbPhrase[1].trim();
      }
    }

    // Section-scope the title if there are duplicate step numbers
    const sectionDisplay = rs.section !== 'General' ? rs.section : '';
    if (hasDuplicateNums && sectionDisplay) {
      title = `${sectionDisplay}: ${title}`;
    }

    // Annotate with original step number if renumbered
    const originalAnnotation = (firstOriginalStepNum > 1)
      ? ` (originally Step ${rs.originalNum})`
      : '';

    steps.push({
      id: `step-${globalStepCounter}`,
      number: globalStepCounter,
      title: title + originalAnnotation,
      section: rs.section,
      instruction: rawInstruction,
      clarifiedInstruction: expandAbbreviations(rawInstruction),
      techniques,
      warnings,
      tips,
    });
    globalStepCounter++;
  }

  // If no "Step N:" found, try numbered list patterns "1." "2." etc.
  if (steps.length === 0) {
    const numberedRegex = /(?:^|\n)\s*(\d+)\.\s+([^\n]+(?:\n(?!\s*\d+\.).*)*)/g;
    while ((match = numberedRegex.exec(text)) !== null) {
      const rawInstruction = match[2].trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
      if (rawInstruction.length < 15) continue;
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

  // --- Issue 4: Better fabric name extraction ---
  // Common color names to help identify fabric descriptions
  const colorNames = /\b(white|black|cream|ivory|red|blue|green|yellow|orange|purple|pink|gray|grey|brown|navy|teal|coral|burgundy|charcoal|aqua|gold|silver|tan|beige|rose|lavender|sage|indigo|mauve|plum|olive|mint|peach|rust|wine|cranberry|sky|ocean|forest|dark|light|medium|pale|deep|bright|soft|warm|cool)\b/i;
  const skuPattern = /\b[A-Z]{2,5}[-\s]?\d{3,6}\b/;

  // Look for "Fabric A" / "Fabric B" type labels with amounts
  const fabricLabelRegex = /(?:Fabric\s+)?([A-H])\s*[-–:]\s*(.+?)(?:\n|$)/gi;
  let match;
  const searchText = materialsSection || text;
  while ((match = fabricLabelRegex.exec(searchText)) !== null) {
    const label = `Fabric ${match[1].toUpperCase()}`;
    const detail = match[2].trim();
    const yardMatch = detail.match(/(\d+(?:[-\/]\d+)?)\s*yards?/i);
    if (yardMatch) {
      // Try multiple strategies to find a meaningful name
      let fabricDesc = '';
      // Look for quoted name: "Artisan Batiks"
      const quotedName = detail.match(/["'\u201c\u201d]([^"'\u201c\u201d]+)["'\u201c\u201d]/);
      if (quotedName) {
        fabricDesc = quotedName[1].trim();
      }
      // Look for color name in the detail
      if (!fabricDesc) {
        const colorMatch = detail.match(colorNames);
        if (colorMatch) {
          // Get more context around the color
          const colorIdx = detail.toLowerCase().indexOf(colorMatch[0].toLowerCase());
          const surrounding = detail.slice(Math.max(0, colorIdx - 15), colorIdx + colorMatch[0].length + 15).trim();
          const cleanSurrounding = surrounding.replace(/\d+(?:[-\/]\d+)?\s*yards?/i, '').replace(/[,\-–:]+\s*$/, '').replace(/^\s*[,\-–:]+/, '').trim();
          if (cleanSurrounding.length > 2 && cleanSurrounding.length < 30) {
            fabricDesc = cleanSurrounding;
          } else {
            fabricDesc = colorMatch[0].charAt(0).toUpperCase() + colorMatch[0].slice(1);
          }
        }
      }
      // Look for SKU number
      if (!fabricDesc) {
        const skuMatch = detail.match(skuPattern);
        if (skuMatch) {
          fabricDesc = skuMatch[0];
        }
      }
      // Look for descriptive text before the yardage
      if (!fabricDesc) {
        const descMatch = detail.match(/^([^,\d]+)/);
        fabricDesc = descMatch ? descMatch[1].trim() : '';
      }
      const displayName = fabricDesc && fabricDesc.length > 2 && fabricDesc.length < 30
        ? `${label} — ${fabricDesc}`
        : label;
      addMaterial(displayName, yardMatch[1] + ' yards', 'fabric');
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
    // Strategy 1: "Color Name - X yards" or "Description: X yards"
    const labelMatch = context.match(/([A-Z][A-Za-z\s/&]+?)\s*[:–\-]\s*$/);
    if (labelMatch && labelMatch[1].length < 30) {
      fabricName = labelMatch[1].trim();
    } else {
      // Strategy 2: Quoted name nearby
      const quotedMatch = context.match(/["'\u201c\u201d]([^"'\u201c\u201d]+)["'\u201c\u201d]/);
      if (quotedMatch && quotedMatch[1].length > 2 && quotedMatch[1].length < 30) {
        fabricName = quotedMatch[1].trim();
      } else {
        // Strategy 3: Color name in context
        const colorMatch = context.match(colorNames);
        if (colorMatch) {
          const beforeColor = context.slice(0, context.toLowerCase().lastIndexOf(colorMatch[0].toLowerCase()) + colorMatch[0].length);
          const nameCandidate = beforeColor.replace(/^.*?([A-Z][A-Za-z\s']{0,25})$/, '$1').trim();
          if (nameCandidate.length > 2 && nameCandidate.length < 30) {
            fabricName = nameCandidate;
          }
        } else {
          // Strategy 4: SKU number
          const skuMatch = context.match(skuPattern);
          if (skuMatch) {
            fabricName = `Fabric (${skuMatch[0]})`;
          } else {
            // Strategy 5: Context before the number
            const beforeMatch = context.match(/(?:#\d+\s+)?([A-Z][A-Za-z\s']+?)\s*$/);
            if (beforeMatch && beforeMatch[1].length > 2 && beforeMatch[1].length < 30) {
              fabricName = beforeMatch[1].trim();
            } else {
              // Strategy 6: "X yards FabricName" after the match
              const afterMatch = text.slice(match.index + match[0].length, match.index + match[0].length + 50);
              const afterLabel = afterMatch.match(/^\s+(?:of\s+)?([A-Z][A-Za-z\s']{2,25}?)(?:\s*[\n(,;]|$)/);
              if (afterLabel) {
                fabricName = afterLabel[1].trim();
              }
            }
          }
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
  // --- Issue 1: Robust name extraction ---
  // Start with filename as fallback (cleaned up)
  let name = fileName
    .replace(/\.pdf$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase split
    .trim();

  // Try explicit "Project Name: X" pattern (Robert Kaufman style)
  const projectNameMatch = text.match(/Project\s*Name[:\s]+([^\n]+)/i);
  if (projectNameMatch) {
    name = projectNameMatch[1].trim();
  } else {
    // Try to find the actual pattern name from the top of the document
    // Strategy: scan top lines, skip ALL metadata-like lines, pick the best candidate
    const lines = text.split('\n').slice(0, 40);
    const candidates: Array<{ text: string; score: number }> = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length < 3 || trimmed.length > 60) continue;
      // Skip known metadata patterns
      if (SKIP_NAME_PATTERNS.some(pattern => pattern.test(trimmed))) continue;
      if (trimmed.includes('www.') || trimmed.includes('@') || trimmed.includes('©')) continue;
      if (/^\d/.test(trimmed)) continue;
      if (trimmed.replace(/[^a-zA-Z]/g, '').length < 3) continue;
      if (/^[A-Z]{2,5}-\d+/.test(trimmed)) continue;
      // Skip lines that look like "Difficulty Rating: X" even partially
      if (/difficulty|rating|beginner|intermediate|advanced|skill\s*level/i.test(trimmed)) continue;
      // Skip lines that look like dimensions
      if (/^\d+["\u201d]?\s*x\s*\d+/i.test(trimmed)) continue;
      // Skip "Designed by" and similar attribution lines
      if (/^(?:designed|pattern|created|made)\s+by/i.test(trimmed)) continue;
      // Skip lines that are just a URL or publisher
      if (/^(?:robert\s+kaufman|free\s*spirit|moda|riley\s+blake)/i.test(trimmed)) continue;

      // Score candidates — prefer title-like lines
      let score = 10;
      // Shorter lines that are title-like get higher scores
      if (trimmed.length >= 5 && trimmed.length <= 35) score += 5;
      // Lines with mixed case (title case) get bonus
      if (/^[A-Z][a-z]/.test(trimmed)) score += 3;
      // ALL CAPS lines are likely headings (pattern names)
      if (trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) score += 4;
      // Lines that don't contain common metadata words
      if (!/fabric|yard|inch|size|quilt|free|pattern|page/i.test(trimmed)) score += 2;
      // Lines with evocative/pattern-like names get bonus
      if (/bloom|rose|flight|cascade|cobblestone|aurora|garden|star|diamond|wave|storm|sunset|meadow/i.test(trimmed)) score += 5;

      candidates.push({ text: trimmed, score });
    }

    // Pick the highest-scoring candidate
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      name = candidates[0].text;
    }
    // else: falls through to filename-based name (already set)
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
