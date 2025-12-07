// Quilting Glossary - Terms that auto-highlight in instructions
// Each term has a definition, visual hint, and common mistakes

export interface GlossaryTerm {
  definition: string;
  visualHint?: string;
  commonMistake?: string;
  tip?: string;
  warning?: string;
  relatedTerms?: string[];
  type: 'abbreviation' | 'technique' | 'tool' | 'measurement';
}

export const QUILTING_GLOSSARY: Record<string, GlossaryTerm> = {
  // === ABBREVIATIONS ===
  'RST': {
    definition: 'Right Sides Together - place fabric pieces with the printed/pretty sides facing each other',
    visualHint: 'Like closing a book - the covers face each other',
    commonMistake: 'If your seams show on the outside, you sewed WST by accident',
    relatedTerms: ['WST', 'seam allowance'],
    type: 'abbreviation',
  },
  'WST': {
    definition: 'Wrong Sides Together - printed sides face outward, wrong/back sides touch',
    visualHint: 'Like opening a book flat - you see both covers',
    commonMistake: 'Usually only used for binding or specialty techniques',
    relatedTerms: ['RST'],
    type: 'abbreviation',
  },
  'HST': {
    definition: 'Half Square Triangle - a square made of two triangles sewn on the diagonal',
    visualHint: 'A square split corner to corner into two colors',
    tip: 'Make them slightly oversized, then trim to exact size for accuracy',
    relatedTerms: ['QST', 'flying geese'],
    type: 'abbreviation',
  },
  'QST': {
    definition: 'Quarter Square Triangle - a square made of four triangles meeting in the center',
    visualHint: 'Like an hourglass or bowtie shape',
    tip: 'Grain line runs along the outer edges for stability',
    relatedTerms: ['HST'],
    type: 'abbreviation',
  },
  'WOF': {
    definition: 'Width of Fabric - selvage to selvage, usually 42-44 inches',
    visualHint: 'The short direction when fabric is folded on the bolt',
    tip: 'Actual usable width is about 40" after removing selvages',
    relatedTerms: ['LOF', 'selvage'],
    type: 'abbreviation',
  },
  'LOF': {
    definition: 'Length of Fabric - parallel to selvage, the direction you buy by the yard',
    visualHint: 'The long direction running the length of the bolt',
    relatedTerms: ['WOF', 'grain'],
    type: 'abbreviation',
  },
  'FQ': {
    definition: 'Fat Quarter - an 18" x 22" cut, not a regular quarter yard',
    visualHint: 'A half yard cut in half again - more square than a regular quarter',
    tip: 'Better for larger cuts than a regular 9" x 44" quarter yard',
    type: 'abbreviation',
  },
  'FE': {
    definition: 'Fat Eighth - a 9" x 22" cut, half of a fat quarter',
    visualHint: 'Like cutting a fat quarter in half lengthwise',
    type: 'abbreviation',
  },
  'UFO': {
    definition: 'UnFinished Object - a project started but not yet completed',
    visualHint: 'That stack in your sewing room calling to you',
    tip: 'We all have them! No judgment here.',
    type: 'abbreviation',
  },
  'WIP': {
    definition: 'Work In Progress - a project you\'re actively working on',
    relatedTerms: ['UFO'],
    type: 'abbreviation',
  },

  // === TECHNIQUES ===
  'chain piecing': {
    definition: 'Sewing pairs of pieces continuously without cutting thread between them',
    visualHint: 'Like a string of paper dolls connected by thread',
    tip: 'Saves thread and keeps pairs organized - clip apart when done',
    type: 'technique',
  },
  'nesting seams': {
    definition: 'Pressing opposing seams in opposite directions so they lock together perfectly',
    visualHint: 'Like puzzle pieces clicking into place',
    commonMistake: 'If seams won\'t nest, one row was pressed the wrong direction',
    tip: 'You\'ll feel them click when they\'re nested correctly',
    type: 'technique',
  },
  'pressing': {
    definition: 'Setting seams with an iron - lift and press down, don\'t slide',
    commonMistake: 'Sliding the iron can stretch bias edges and distort your block',
    tip: 'Press from the right side when possible to avoid pleats',
    relatedTerms: ['ironing'],
    type: 'technique',
  },
  'ironing': {
    definition: 'Moving the iron back and forth - different from pressing',
    warning: 'Ironing can stretch quilting fabric - use pressing motion instead',
    relatedTerms: ['pressing'],
    type: 'technique',
  },
  'squaring up': {
    definition: 'Trimming a block or unit to exact size with perfect 90-degree corners',
    tip: 'Always square up before joining blocks - it prevents compounding errors',
    type: 'technique',
  },
  'strip piecing': {
    definition: 'Sewing long strips together, then cutting into segments',
    visualHint: 'Like making a loaf of bread, then slicing it',
    tip: 'Great for nine-patch and rail fence blocks',
    type: 'technique',
  },
  'paper piecing': {
    definition: 'Foundation piecing where you sew on paper templates for perfect points',
    tip: 'Sew with paper on top, fabric underneath. Stitch on the printed lines.',
    warning: 'Remember to remove paper before quilting!',
    type: 'technique',
  },
  'foundation piecing': {
    definition: 'Sewing fabric onto a foundation (paper or fabric) for stability and accuracy',
    relatedTerms: ['paper piecing'],
    type: 'technique',
  },
  'fussy cutting': {
    definition: 'Carefully cutting fabric to feature a specific part of the print',
    visualHint: 'Like centering a flower or motif perfectly in your template',
    tip: 'Use clear templates to preview your cut',
    type: 'technique',
  },
  'applique': {
    definition: 'Sewing fabric shapes onto a background fabric',
    tip: 'Can be done by hand (needle turn) or machine (raw edge or satin stitch)',
    type: 'technique',
  },
  'quilting': {
    definition: 'Stitching through all three layers (top, batting, backing) to hold them together',
    tip: 'Can be done by hand, domestic machine, or longarm',
    type: 'technique',
  },
  'basting': {
    definition: 'Temporarily securing quilt layers together before quilting',
    tip: 'Can use pins, spray, or long stitches - remove after quilting',
    type: 'technique',
  },
  'binding': {
    definition: 'Finishing the raw edges of a quilt with a fabric strip',
    tip: 'Double-fold binding (2.5" strips) is most durable',
    type: 'technique',
  },

  // === MEASUREMENTS & SEAMS ===
  'seam allowance': {
    definition: 'The fabric between the cut edge and stitch line - usually 1/4" in quilting',
    commonMistake: 'Using 1/2" (garment sewing standard) will make blocks too small',
    tip: 'A scant 1/4" (just under) is sometimes recommended',
    type: 'measurement',
  },
  'scant quarter inch': {
    definition: 'Slightly less than 1/4" - accounts for the thread taking up space',
    tip: 'About the width of two threads less than 1/4"',
    relatedTerms: ['seam allowance'],
    type: 'measurement',
  },
  'bias': {
    definition: 'The diagonal grain of fabric - stretchy and unstable',
    warning: 'Handle bias edges gently to prevent distortion',
    tip: 'Starch can help stabilize bias edges',
    relatedTerms: ['grain', 'selvage'],
    type: 'measurement',
  },
  'grain': {
    definition: 'The direction of threads in fabric - lengthwise, crosswise, or bias',
    tip: 'Lengthwise grain (parallel to selvage) has the least stretch',
    relatedTerms: ['bias', 'selvage'],
    type: 'measurement',
  },
  'selvage': {
    definition: 'The tightly woven finished edge of fabric - don\'t include in quilt pieces',
    tip: 'Selvages have manufacturer info - save them for reference!',
    warning: 'Selvage edges don\'t stretch the same as regular fabric',
    type: 'measurement',
  },

  // === TOOLS ===
  'rotary cutter': {
    definition: 'A circular blade tool for cutting fabric quickly and accurately',
    warning: 'Always close the blade when not actively cutting',
    tip: 'Replace blades when cuts aren\'t clean - dull blades skip threads',
    type: 'tool',
  },
  'cutting mat': {
    definition: 'Self-healing surface for rotary cutting - protects your table and blade',
    tip: 'Store flat, away from heat - warped mats affect cutting accuracy',
    type: 'tool',
  },
  'ruler': {
    definition: 'Clear acrylic ruler with measurement lines for accurate cutting',
    tip: 'Use ruler with rotary cutter, not scissors. Add sandpaper dots to prevent slipping.',
    type: 'tool',
  },
  'walking foot': {
    definition: 'A presser foot with feed dogs that moves all layers evenly',
    tip: 'Essential for straight-line quilting and binding attachment',
    relatedTerms: ['free motion foot'],
    type: 'tool',
  },
  'free motion foot': {
    definition: 'A special foot that allows you to move fabric freely for quilting designs',
    tip: 'Lower feed dogs when using - you control the stitch length',
    warning: 'Takes practice! Start with simple meandering designs.',
    type: 'tool',
  },
  'design wall': {
    definition: 'A vertical surface for arranging quilt blocks before sewing',
    visualHint: 'Flannel or batting on a wall - fabric sticks without pins',
    tip: 'Step back frequently to see the overall design',
    type: 'tool',
  },
  'seam ripper': {
    definition: 'A small tool for removing stitches - every quilter\'s friend',
    tip: 'Also called a "reverse sewing tool" - no shame in using it!',
    type: 'tool',
  },
  'spray starch': {
    definition: 'Starch spray that adds body to fabric for easier handling',
    tip: 'Light to medium starch helps with cutting accuracy and pressing',
    type: 'tool',
  },

  // === BLOCK & QUILT TERMS ===
  'block': {
    definition: 'A single unit that will be joined with others to make a quilt top',
    tip: 'Most blocks are square, but half-blocks and setting triangles are common',
    type: 'technique',
  },
  'sashing': {
    definition: 'Strips of fabric between blocks that frame them',
    tip: 'Can be plain or pieced, with or without cornerstones',
    type: 'technique',
  },
  'cornerstone': {
    definition: 'Small squares where sashing strips meet',
    tip: 'Add visual interest - can match background or be accent fabric',
    relatedTerms: ['sashing'],
    type: 'technique',
  },
  'border': {
    definition: 'Strips of fabric framing the quilt center',
    tip: 'Measure through the center of the quilt for accurate border lengths',
    type: 'technique',
  },
  'batting': {
    definition: 'The middle layer of a quilt that provides warmth and loft',
    tip: 'Cotton, bamboo, wool, and polyester all have different properties',
    type: 'technique',
  },
  'backing': {
    definition: 'The fabric on the back of a quilt',
    tip: 'Should be 4-6 inches larger than quilt top on all sides for quilting',
    type: 'technique',
  },
  'quilt sandwich': {
    definition: 'The three layers together: top, batting, backing',
    tip: 'Baste layers together before quilting to prevent shifting',
    type: 'technique',
  },
  'flying geese': {
    definition: 'Rectangular units with a triangle pointing up, like geese in flight',
    visualHint: 'A triangle on a rectangle background, usually 2:1 ratio',
    tip: 'The "no waste" method makes 4 at a time',
    type: 'technique',
  },
  'set aside': {
    definition: 'A good stopping point - these pieces are done for now',
    tip: 'Label your pieces! Future you will thank present you.',
    type: 'technique',
  },
};

// Terms that should be highlighted but case-insensitively matched
export const CASE_INSENSITIVE_TERMS = [
  'chain piecing',
  'nesting seams',
  'pressing',
  'squaring up',
  'strip piecing',
  'paper piecing',
  'fussy cutting',
  'seam allowance',
  'bias',
  'grain',
  'selvage',
  'walking foot',
  'design wall',
  'flying geese',
  'set aside',
];

// Build a regex pattern for finding terms in text
export function buildTermRegex(): RegExp {
  const allTerms = Object.keys(QUILTING_GLOSSARY);
  // Sort by length descending to match longer terms first
  const sortedTerms = allTerms.sort((a, b) => b.length - a.length);
  // Escape special regex characters and join with |
  const pattern = sortedTerms
    .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  return new RegExp(`\\b(${pattern})\\b`, 'gi');
}

// Find all glossary terms in a piece of text
export function findTermsInText(text: string): Array<{term: string; start: number; end: number}> {
  const regex = buildTermRegex();
  const matches: Array<{term: string; start: number; end: number}> = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const matchedTerm = match[1];
    // Find the canonical form of the term
    const canonicalTerm = Object.keys(QUILTING_GLOSSARY).find(
      t => t.toLowerCase() === matchedTerm.toLowerCase()
    );

    if (canonicalTerm) {
      matches.push({
        term: canonicalTerm,
        start: match.index,
        end: match.index + matchedTerm.length,
      });
    }
  }

  return matches;
}

// Get term info by any case variation
export function getTermInfo(term: string): GlossaryTerm | undefined {
  const canonical = Object.keys(QUILTING_GLOSSARY).find(
    t => t.toLowerCase() === term.toLowerCase()
  );
  return canonical ? QUILTING_GLOSSARY[canonical] : undefined;
}
