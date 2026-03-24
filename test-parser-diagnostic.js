#!/usr/bin/env node
// Ground Truth Diagnostic: Run real PDFs through the Quiltographer parser
// Mirrors the parsing logic from /api/parse-pdf/route.ts

const fs = require('fs');
const path = require('path');
const pdfParse = require('./quiltographer-app/node_modules/pdf-parse/lib/pdf-parse');

// ─── Written-number-to-digit conversion ───────────────────────────────────

const WORD_NUMBERS = {
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
  'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
  'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
  'eighty': 80, 'ninety': 90, 'hundred': 100,
};

function wordToNumber(text) {
  const cleaned = text.toLowerCase().trim().replace(/[-\s]+/g, ' ');
  if (/^\d+$/.test(cleaned)) return parseInt(cleaned);
  if (WORD_NUMBERS[cleaned] !== undefined) return WORD_NUMBERS[cleaned];
  const parts = cleaned.split(/[\s-]+/);
  let total = 0;
  let current = 0;
  for (const part of parts) {
    const val = WORD_NUMBERS[part];
    if (val === undefined) return null;
    if (val === 100) {
      current = (current || 1) * 100;
    } else {
      current += val;
    }
  }
  total += current;
  return total > 0 ? total : null;
}

function parseQuantity(s) {
  const trimmed = s.trim();
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed);
  return wordToNumber(trimmed);
}

// ─── Parser logic (extracted from route.ts) ───────────────────────────────

const ABBREVIATIONS = {
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

function expandAbbreviations(text) {
  let expanded = text;
  for (const [abbr, full] of Object.entries(ABBREVIATIONS)) {
    // Don't expand if already inside parentheses or preceded by its expansion
    const regex = new RegExp(`(?<!\\()\\b${abbr}\\b(?!\\s*\\()(?![^(]*\\))`, 'g');
    expanded = expanded.replace(regex, full);
  }
  return expanded;
}

const SKIP_NAME_PATTERNS = [
  /^difficulty/i, /^rating/i, /^beginner/i, /^intermediate/i,
  /^advanced/i, /^expert/i, /^easy/i, /^free\s*pattern/i,
  /^quilt\s*size/i, /^finished\s*size/i, /^fabric\s*requirements/i,
  /^materials/i, /^cutting/i, /^instructions/i, /^designed\s*by/i,
  /^copyright/i, /^\d+["\u201d]\s*x\s*\d+/, /^page\s+\d/i, /^\s*$/,
];

function findSection(text, headers) {
  const lower = text.toLowerCase();
  for (const header of headers) {
    const idx = lower.indexOf(header);
    if (idx === -1) continue;
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

function extractSteps(text) {
  const steps = [];
  const sectionKeywords = [
    'block assembly', 'quilt assembly', 'quilt top assembly', 'finishing',
    'border', 'borders', 'sashing', 'binding', 'piecing',
    'cutting instructions', 'construction', 'assembly',
    'make the blocks', 'assemble the quilt', 'add borders',
  ];
  const sections = [];
  const lowerText = text.toLowerCase();
  for (const keyword of sectionKeywords) {
    let searchFrom = 0;
    while (true) {
      const idx = lowerText.indexOf(keyword, searchFrom);
      if (idx === -1) break;
      const lineStart = text.lastIndexOf('\n', idx);
      const prefix = text.slice(Math.max(0, lineStart), idx).trim();
      if (prefix.length < 5) {
        const displayName = keyword.replace(/\b\w/g, c => c.toUpperCase());
        sections.push({ name: displayName, startIdx: idx });
      }
      searchFrom = idx + keyword.length;
    }
  }
  sections.sort((a, b) => a.startIdx - b.startIdx);
  const dedupedSections = [];
  for (const sec of sections) {
    const isDuplicate = dedupedSections.some(existing => Math.abs(existing.startIdx - sec.startIdx) < 20);
    if (!isDuplicate) {
      dedupedSections.push(sec);
    } else {
      const existingIdx = dedupedSections.findIndex(existing => Math.abs(existing.startIdx - sec.startIdx) < 20);
      if (existingIdx >= 0 && sec.name.length > dedupedSections[existingIdx].name.length) {
        dedupedSections[existingIdx] = sec;
      }
    }
  }

  function getSectionName(pos) {
    let sectionName = 'General';
    for (const sec of dedupedSections) {
      if (sec.startIdx <= pos) sectionName = sec.name;
      else break;
    }
    return sectionName;
  }

  let firstOriginalStepNum = Infinity;
  const rawSteps = [];
  const stepRegex = /Step\s+(\d+)[:\.]?\s*([^]*?)(?=Step\s+\d+[:\.]|$)/gi;
  let match;

  while ((match = stepRegex.exec(text)) !== null) {
    const stepNum = parseInt(match[1]);
    const rawInstruction = match[2].trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ').replace(/page\s+\d+/gi, '').trim();
    if (rawInstruction.length < 10) continue;
    const section = getSectionName(match.index);
    if (stepNum < firstOriginalStepNum) firstOriginalStepNum = stepNum;
    rawSteps.push({ originalNum: stepNum, position: match.index, instruction: rawInstruction, section });
  }

  let imageStepsNote = '';
  if (firstOriginalStepNum > 1 && rawSteps.length > 0) {
    imageStepsNote = `Note: Steps 1-${firstOriginalStepNum - 1} are in diagram images in the pattern PDF.`;
  }

  let globalStepCounter = 1;
  if (imageStepsNote) {
    steps.push({
      id: 'step-image-note', number: globalStepCounter++,
      title: 'Visual Steps (in pattern images)', section: rawSteps[0]?.section || 'General',
      instruction: imageStepsNote, techniques: [], warnings: [{ type: 'important', message: imageStepsNote }], tips: [],
    });
  }

  for (const rs of rawSteps) {
    const rawInstruction = rs.instruction;
    const techniques = [];
    const lower = rawInstruction.toLowerCase();
    if (lower.includes('hst') || lower.includes('half-square') || lower.includes('half square')) techniques.push('HST');
    if (lower.includes('flying geese')) techniques.push('Flying Geese');
    if (lower.includes('press')) techniques.push('pressing');
    if (lower.includes('sew') || lower.includes('stitch')) techniques.push('piecing');
    if (lower.includes('cut') || lower.includes('subcut')) techniques.push('cutting');
    if (lower.includes('trim') || lower.includes('square up')) techniques.push('trimming');
    if (lower.includes('chain piec')) techniques.push('chain piecing');
    if (lower.includes('strip set')) techniques.push('strip piecing');
    if (lower.includes('appliq')) techniques.push('applique');

    const warnings = [];
    if (lower.includes('1/4"') || lower.includes('quarter inch') || lower.includes('\u00bc')) {
      warnings.push({ type: 'important', message: 'Use accurate \u00bc" seam allowance' });
    }

    steps.push({
      id: `step-${globalStepCounter}`, number: globalStepCounter,
      title: `Step ${rs.originalNum}`, section: rs.section,
      instruction: rawInstruction, clarifiedInstruction: expandAbbreviations(rawInstruction),
      techniques, warnings, tips: [],
    });
    globalStepCounter++;
  }

  // Fallback: numbered list
  if (steps.length === 0) {
    const numberedRegex = /(?:^|\n)\s*(\d+)\.\s+([^\n]+(?:\n(?!\s*\d+\.).*)*)/g;
    while ((match = numberedRegex.exec(text)) !== null) {
      const rawInstruction = match[2].trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
      if (rawInstruction.length < 15) continue;
      const lower = rawInstruction.toLowerCase();
      const isInstruction = ['sew', 'cut', 'press', 'place', 'trim', 'join', 'attach', 'arrange', 'fold', 'pin', 'gather', 'make', 'assemble']
        .some(verb => lower.includes(verb));
      if (!isInstruction) continue;
      steps.push({
        id: `step-${steps.length + 1}`, number: steps.length + 1,
        title: `Step ${steps.length + 1}`, section: 'General',
        instruction: rawInstruction, clarifiedInstruction: expandAbbreviations(rawInstruction),
        techniques: [], warnings: [], tips: [],
      });
    }
  }
  return steps;
}

function extractMaterials(text) {
  const materials = [];
  const seen = new Set();
  function addMaterial(name, amount, type) {
    const key = `${name.toLowerCase()}::${amount.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    materials.push({ id: `mat-${materials.length + 1}`, name, amount, type });
  }

  const yardRegex = /(.{0,80}?)(\d+(?:[-\/]\d+)?)\s*yards?\b/gi;
  let match;
  let idx = 0;
  while ((match = yardRegex.exec(text)) !== null && idx < 15) {
    const context = match[1].trim();
    const amount = match[2];
    let fabricName = `Fabric ${idx + 1}`;
    const labelMatch = context.match(/([A-Z][A-Za-z\s/&]+?)\s*[:–\-]\s*$/);
    if (labelMatch && labelMatch[1].length < 30) {
      fabricName = labelMatch[1].trim();
    }
    addMaterial(fabricName, amount + ' yards', 'fabric');
    idx++;
  }

  const backingMatch = text.match(/(\d+(?:[-\/]\d+)?)\s*yards?\s*(?:of\s+)?(?:for\s+)?backing/i)
    || text.match(/backing[:\s]+(\d+(?:[-\/]\d+)?)\s*yards?/i);
  if (backingMatch) addMaterial('Backing Fabric', backingMatch[1] + ' yards', 'fabric');

  const bindingMatch = text.match(/(\d+(?:[-\/]\d+)?)\s*yards?\s*(?:of\s+)?(?:for\s+)?binding/i)
    || text.match(/binding[:\s]+(\d+(?:[-\/]\d+)?)\s*yards?/i);
  if (bindingMatch) addMaterial('Binding', bindingMatch[1] + ' yards', 'fabric');

  if (text.toLowerCase().includes('batting')) addMaterial('Batting', 'As needed', 'notion');
  if (text.toLowerCase().includes('thread')) addMaterial('Thread', 'Coordinating', 'notion');

  return materials;
}

function extractMetadata(text, fileName) {
  let name = fileName.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim();

  const projectNameMatch = text.match(/Project\s*Name[:\s]+([^\n]+)/i);
  if (projectNameMatch) {
    name = projectNameMatch[1].trim();
  } else {
    const lines = text.split('\n').slice(0, 40);
    const candidates = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length < 3 || trimmed.length > 60) continue;
      if (SKIP_NAME_PATTERNS.some(pattern => pattern.test(trimmed))) continue;
      if (trimmed.includes('www.') || trimmed.includes('@') || trimmed.includes('\u00a9')) continue;
      if (/^\d/.test(trimmed)) continue;
      if (trimmed.replace(/[^a-zA-Z]/g, '').length < 3) continue;
      if (/^[A-Z]{2,5}-\d+/.test(trimmed)) continue;
      if (/difficulty|rating|beginner|intermediate|advanced|skill\s*level/i.test(trimmed)) continue;
      if (/^\d+["\u201d]?\s*x\s*\d+/i.test(trimmed)) continue;
      if (/^(?:designed|pattern|created|made)\s+by/i.test(trimmed)) continue;
      if (/^(?:robert\s+kaufman|free\s*spirit|moda|riley\s+blake)/i.test(trimmed)) continue;

      let score = 10;
      if (trimmed.length >= 5 && trimmed.length <= 35) score += 5;
      if (/^[A-Z][a-z]/.test(trimmed)) score += 3;
      if (trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) score += 4;
      if (!/fabric|yard|inch|size|quilt|free|pattern|page/i.test(trimmed)) score += 2;
      if (/bloom|rose|flight|cascade|cobblestone|aurora|garden|star|diamond|wave|storm|sunset|meadow/i.test(trimmed)) score += 5;
      candidates.push({ text: trimmed, score });
    }
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      name = candidates[0].text;
    }
  }

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

  let finishedSize = { width: 0, height: 0, unit: 'inches' };
  const sizePatterns = [
    /(?:measures|finished|size|dimensions|quilt\s*size)[:\s]+(\d+)["\u201d]?\s*x\s*(\d+)["\u201d]?/i,
    /(\d+)["\u201d]\s*x\s*(\d+)["\u201d]\s*(?:finished|quilt)/i,
    /approximately\s+(\d+)["\u201d]?\s*x\s*(\d+)["\u201d]?/i,
  ];
  for (const pattern of sizePatterns) {
    const sizeMatch = text.match(pattern);
    if (sizeMatch) {
      finishedSize = { width: parseInt(sizeMatch[1]), height: parseInt(sizeMatch[2]), unit: 'inches' };
      break;
    }
  }

  let designer = '';
  const designerPatterns = [
    /designed\s+by\s+([A-Za-z\s.]+?)(?:\s+for|\s+of|\n|$)/i,
    /designer[:\s]+([A-Za-z\s.]+?)(?:\n|$)/i,
    /pattern\s+by\s+([A-Za-z\s.]+?)(?:\n|$)/i,
  ];
  for (const pattern of designerPatterns) {
    const designerMatch = text.match(pattern);
    if (designerMatch) { designer = designerMatch[1].trim(); break; }
  }

  return { name, difficulty, finishedSize, designer };
}

function extractCuttingInstructions(text) {
  const cuttingInstructions = [];

  const qtyWord = `(?:\\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|(?:(?:one|two|three|four|five|six|seven|eight|nine)\\s+hundred(?:\\s+(?:and\\s+)?(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[\\s-]+(?:one|two|three|four|five|six|seven|eight|nine))?)?))`;
  const dimNum = `\\d+(?:[\\s-]*\\d+\\/\\d+|[½¼¾]|\\.\\d+)?`;

  const fromFabricRegex = /From\s+(?:each\s+of\s+)?(?:the\s+)?(?:Fabric(?:s)?\s+)?([A-Za-z][A-Za-z\s,]*?)(?:,\s*)?(?:fussy\s+)?(?:cut|trim)[:\s]/gi;

  const fromMatches = [];
  let fmMatch;
  while ((fmMatch = fromFabricRegex.exec(text)) !== null) {
    const rawLabel = fmMatch[1].trim();
    const fabrics = [];
    if (/and/i.test(rawLabel)) {
      const letterMatches = rawLabel.match(/\b([A-H])\b/g);
      if (letterMatches) {
        letterMatches.forEach(l => fabrics.push(`Fabric ${l.toUpperCase()}`));
      }
    } else if (/binding/i.test(rawLabel)) {
      fabrics.push('Binding Fabric');
    } else {
      const letter = rawLabel.match(/\b([A-H])\b/i);
      if (letter) {
        fabrics.push(`Fabric ${letter[1].toUpperCase()}`);
      } else {
        fabrics.push(rawLabel);
      }
    }
    fromMatches.push({ fabrics, startIdx: fmMatch.index + fmMatch[0].length });
  }

  for (let i = 0; i < fromMatches.length; i++) {
    const startIdx = fromMatches[i].startIdx;
    const endIdx = i + 1 < fromMatches.length ? fromMatches[i + 1].startIdx - 50 : text.length;
    const block = text.slice(startIdx, Math.min(endIdx, startIdx + 2000));

    const pieces = [];
    const lines = block.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length < 3) continue;

      // Square: "N X" squares" or "N squares X""
      const sqMatch = trimmed.match(new RegExp(`(${qtyWord})\\s+(?:${dimNum})["\u201d]?\\s+squares?|(${qtyWord})\\s+squares?\\s+(${dimNum})["\u201d]?`, 'i'));
      if (sqMatch) {
        const qtyStr = sqMatch[1] || sqMatch[2];
        const qty = parseQuantity(qtyStr);
        const dimMatch = trimmed.match(new RegExp(`(${dimNum})["\u201d]?\\s*(?:x\\s*(${dimNum})["\u201d]?)?\\s*squares?|squares?\\s+(${dimNum})["\u201d]?`, 'i'));
        if (qty && dimMatch) {
          const dim = dimMatch[1] || dimMatch[3] || '';
          pieces.push({ shape: 'square', quantity: qty, dimensions: `${dim}" x ${dim}"` });
          continue;
        }
      }

      // Rectangle: "N W" x H" rectangles" or "N rectangles W" x H""
      const rectMatch = trimmed.match(new RegExp(`(${qtyWord})\\s+(?:(${dimNum})["\u201d]?\\s*x\\s*(${dimNum})["\u201d]?\\s+rectangles?|rectangles?\\s+(${dimNum})["\u201d]?\\s*x\\s*(${dimNum})["\u201d]?)`, 'i'));
      if (rectMatch) {
        const qty = parseQuantity(rectMatch[1]);
        const w = rectMatch[2] || rectMatch[4] || '';
        const h = rectMatch[3] || rectMatch[5] || '';
        if (qty && w && h) {
          pieces.push({ shape: 'rectangle', quantity: qty, dimensions: `${w}" x ${h}"` });
          continue;
        }
      }

      // Unlabeled piece: "N W" x H""
      const unlabeledMatch = trimmed.match(new RegExp(`(${qtyWord})\\s+(${dimNum})["\u201d]?\\s*x\\s*(${dimNum})["\u201d]?(?:\\s+(?:rectangles?|pieces?))?`, 'i'));
      if (unlabeledMatch) {
        const qty = parseQuantity(unlabeledMatch[1]);
        const w = unlabeledMatch[2];
        const h = unlabeledMatch[3];
        if (qty && w && h) {
          const shape = w === h ? 'square' : 'rectangle';
          pieces.push({ shape, quantity: qty, dimensions: `${w}" x ${h}"` });
          continue;
        }
      }

      // Strip: "N strips X" x WOF" or "N X" x WOF strips"
      const stripMatch = trimmed.match(new RegExp(`(${qtyWord})\\s+(${dimNum})["\u201d]?\\s*x\\s*(?:WOF|LOF)\\s*strips?|(${qtyWord})\\s+strips?\\s+(${dimNum})["\u201d]?\\s*x\\s*(?:WOF|LOF)`, 'i'));
      if (stripMatch) {
        const qtyStr = stripMatch[1] || stripMatch[3];
        const dim = stripMatch[2] || stripMatch[4];
        const qty = parseQuantity(qtyStr);
        if (qty && dim) {
          pieces.push({ shape: 'strip', quantity: qty, dimensions: `${dim}" x WOF` });
          continue;
        }
      }

      // Standalone WOF strips
      const wofMatch = trimmed.match(new RegExp(`(${qtyWord})\\s+(${dimNum})["\u201d]?\\s*x\\s*WOF\\s+strips?`, 'i'));
      if (wofMatch) {
        const qty = parseQuantity(wofMatch[1]);
        const dim = wofMatch[2];
        if (qty && dim) {
          pieces.push({ shape: 'strip', quantity: qty, dimensions: `${dim}" x WOF` });
          continue;
        }
      }
    }

    if (pieces.length > 0) {
      for (const fabric of fromMatches[i].fabrics) {
        cuttingInstructions.push({
          id: `cut-${cuttingInstructions.length + 1}`,
          fabric,
          pieces: [...pieces],
        });
      }
    }
  }

  return cuttingInstructions;
}

// ─── Main diagnostic ──────────────────────────────────────────────────────

async function runDiagnostic() {
  const testDir = path.join(__dirname, 'test-patterns');
  const files = fs.readdirSync(testDir).filter(f => f.endsWith('.pdf'));

  console.log('═══════════════════════════════════════════════════════════════');
  console.log(' QUILTOGRAPHER GROUND TRUTH DIAGNOSTIC (v2 — with fixes)');
  console.log(' Testing', files.length, 'PDFs through the production parser');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const results = [];

  for (const file of files) {
    const filePath = path.join(testDir, file);
    console.log(`\n━━━ ${file} ━━━`);
    console.log(`Size: ${(fs.statSync(filePath).size / 1024).toFixed(0)} KB`);

    try {
      const buffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(buffer);
      const text = pdfData.text;

      const rawDir = path.join(__dirname, 'diagnostic-output');
      fs.mkdirSync(rawDir, { recursive: true });
      fs.writeFileSync(path.join(rawDir, file.replace('.pdf', '.raw.txt')), text);

      const textLen = text.length;
      console.log(`  PDF pages: ${pdfData.numpages}, text: ${textLen} chars`);

      const metadata = extractMetadata(text, file);
      const materials = extractMaterials(text);
      const steps = extractSteps(text);
      const cutting = extractCuttingInstructions(text);

      const isPattern = steps.length >= 2 || materials.length >= 2;

      console.log(`  Name: "${metadata.name}" | Size: ${metadata.finishedSize.width > 0 ? `${metadata.finishedSize.width}" x ${metadata.finishedSize.height}"` : '(none)'}`);
      console.log(`  Steps: ${steps.length} | Materials: ${materials.length} | Cutting: ${cutting.length} | Pattern: ${isPattern ? 'YES' : 'NO'}`);

      if (cutting.length > 0) {
        console.log(`  Cutting details:`);
        cutting.forEach(c => {
          console.log(`    ${c.fabric}: ${c.pieces.length} piece types`);
          c.pieces.slice(0, 3).forEach(p => console.log(`      - ${p.quantity} ${p.shape}(s) ${p.dimensions}`));
          if (c.pieces.length > 3) console.log(`      ... and ${c.pieces.length - 3} more`);
        });
      }

      const parsed = { metadata, materials, steps, cutting, isPattern, textLength: textLen, pages: pdfData.numpages };
      fs.writeFileSync(path.join(rawDir, file.replace('.pdf', '.parsed.json')), JSON.stringify(parsed, null, 2));

      results.push({
        file, success: true, isPattern,
        stepsCount: steps.length, materialsCount: materials.length,
        cuttingCount: cutting.length,
        totalPieces: cutting.reduce((sum, c) => sum + c.pieces.length, 0),
        name: metadata.name,
      });

    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
      results.push({ file, success: false, error: err.message });
    }
  }

  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log(' SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');

  const succeeded = results.filter(r => r.success);
  const patterns = results.filter(r => r.isPattern);
  const nonPatterns = results.filter(r => r.success && !r.isPattern);
  const failed = results.filter(r => !r.success);

  console.log(`\nPDF extraction: ${succeeded.length}/${results.length}`);
  console.log(`Patterns: ${patterns.length} | Non-patterns: ${nonPatterns.length} | Errors: ${failed.length}`);

  console.log('\n--- Results ---');
  for (const r of results) {
    if (!r.success) {
      console.log(`  ❌ ${r.file}: ERROR - ${r.error}`);
    } else if (!r.isPattern) {
      console.log(`  ⚠️  ${r.file}: Non-pattern`);
    } else {
      const cutInfo = r.cuttingCount > 0 ? `${r.cuttingCount} fabrics / ${r.totalPieces} piece types` : '0 cutting';
      console.log(`  ✅ ${r.file}: ${r.stepsCount} steps, ${r.materialsCount} materials, ${cutInfo}`);
    }
  }

  const withCutting = patterns.filter(r => r.cuttingCount > 0);
  console.log(`\nCutting extraction: ${withCutting.length}/${patterns.length} patterns have cutting instructions`);

  fs.writeFileSync(path.join(__dirname, 'diagnostic-output', 'summary-v2.json'), JSON.stringify({ results }, null, 2));
}

runDiagnostic().catch(console.error);
