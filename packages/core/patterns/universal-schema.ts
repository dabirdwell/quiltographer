// Universal Pattern Schema for Quiltographer
// Works across all features: Pattern Reader, AI Chat, Canvas, Sharing, Export

export interface UniversalPattern {
  // Core identification
  id: string;
  version: '1.0.0'; // Schema version for migrations
  created: Date;
  updated: Date;
  
  // Source tracking
  source: {
    type: 'pdf' | 'ai-generated' | 'user-created' | 'imported' | 'community';
    originalRef?: string; // PDF filename, chat session, etc.
    creator?: Creator;
    importedFrom?: string; // EQ8, other apps
  };
  
  // Basic metadata
  metadata: {
    name: string;
    description?: string;
    difficulty: 1 | 2 | 3 | 4 | 5;
    estimatedTime: number; // hours
    size: {
      finished: Dimensions;
      unfinished?: Dimensions; // before binding
    };
    tags: string[];
    images: ImageRef[];
    category: PatternCategory;
  };
  
  // What you need to make it
  materials: {
    fabrics: FabricRequirement[];
    notions: Notion[];
    tools: Tool[];
    thread?: ThreadRequirement[];
  };
  
  // How to make it (the core value)
  construction: {
    cuttingInstructions: CuttingInstruction[];
    steps: ConstructionStep[];
    techniques: Technique[];
    tips?: Tip[];
  };
  
  // Visual representation
  visuals: {
    blocks?: Block[];
    layout?: QuiltLayout;
    colorways?: Colorway[];
    quilting?: QuiltingDesign[]; // Longarm patterns reference
  };
  
  // Business & sharing
  sharing: {
    license: 'personal' | 'share' | 'commercial';
    attribution?: Attribution;
    price?: number;
    downloadCount?: number;
    rating?: number;
  };
  
  // Extensible for future features
  extensions?: {
    machineEmbroidery?: EmbroideryData;
    longarmQuilting?: LongarmData;
    calculations?: CalculationData;
    ai?: AIMetadata;
  };
}

// For Pattern Reader - parsing PDFs into steps
export interface ConstructionStep {
  id: string;
  number: number;
  title?: string;
  
  // The instruction itself
  instruction: string;          // Original text
  clarifiedInstruction?: string; // Plain English version
  
  // Visual aids
  diagrams: Diagram[];
  photos?: PhotoRef[];
  
  // What you're working with
  pieces: StepPiece[];
  
  // Helpful additions
  techniques: string[];        // References to technique library
  warnings?: Warning[];        // Common mistakes
  tips?: Tip[];               // Helpful hints
  checkpoints?: Checkpoint[]; // "Your piece should look like..."
  
  // Organization
  section?: string;           // "Making the blocks", "Assembly", etc.
  estimatedTime?: number;     // minutes
  skillsRequired?: string[];
}

// What pieces you need to cut
export interface CuttingInstruction {
  id: string;
  fabric: string;             // References material
  
  // Traditional format: "Cut 4 squares 2½" x 2½""
  pieces: {
    shape: 'square' | 'rectangle' | 'triangle' | 'strip' | 'custom';
    quantity: number;
    dimensions: Dimensions | string; // "2½" or {width: 2.5, height: 2.5}
    subcut?: SubcutInstruction[];   // Further cutting instructions
  }[];
  
  // Modern additions
  layout?: CuttingLayout;     // Efficient fabric layout
  grainline?: 'straight' | 'bias' | 'any';
  fussyCutting?: boolean;
  tips?: string[];
}

// Technique definitions for reference
export interface Technique {
  id: string;
  name: string;                // "Half Square Triangle"
  abbreviation?: string;       // "HST"
  difficulty: 1 | 2 | 3 | 4 | 5;
  
  description: string;
  steps: string[];            // Simplified steps
  visualGuide?: VisualGuide;
  videoRef?: string;          // Future: video tutorials
  
  commonIn: string[];         // Pattern categories that use this
  tools?: string[];           // Special tools needed
}

// Visual components
export interface Block {
  id: string;
  name: string;
  size: Dimensions;
  
  // Construction
  pieces: BlockPiece[];
  assembly: AssemblyStep[];
  
  // Variations
  rotations?: number[];       // Allowed rotations
  variations?: BlockVariation[];
}

export interface QuiltLayout {
  type: 'blocks' | 'rows' | 'custom' | 'medallion' | 'sampler';
  
  size: {
    blocks?: { rows: number; columns: number };
    finished: Dimensions;
  };
  
  arrangement: LayoutElement[];
  sashing?: Sashing;
  borders?: Border[];
  cornerStones?: boolean;
}

// Pattern Reader specific helpers
export interface StepPiece {
  id: string;
  description: string;        // "2½" blue square"
  quantity: number;
  orientation?: Orientation;
  placement?: Placement;
}

export interface Warning {
  type: 'critical' | 'important' | 'tip';
  message: string;
  icon?: string;
}

export interface Checkpoint {
  description: string;
  image?: ImageRef;
  measurements?: string[];
}

// AI Chat specific
export interface AIMetadata {
  prompt?: string;           // What user asked for
  sessionId?: string;
  confidence?: number;
  alternatives?: string[];   // Other pattern IDs considered
}

// Supporting types
export interface Creator {
  name: string;
  id?: string;
  website?: string;
  attribution?: string;
}

export interface Dimensions {
  width: number;
  height: number;
  unit: 'inches' | 'cm' | 'mm';
}

export interface FabricRequirement {
  id: string;
  name: string;              // "Background", "Feature", "Fabric A"
  amount: number;
  unit: 'yards' | 'meters' | 'fat quarters' | 'strips';
  
  color?: string;
  notes?: string;            // "Directional print OK"
  alternatives?: string[];
}

export interface ImageRef {
  url: string;
  caption?: string;
  type: 'photo' | 'diagram' | 'illustration';
  credit?: string;
}

export type PatternCategory = 
  | 'traditional-pieced'
  | 'modern'
  | 'applique'
  | 'paper-pieced'
  | 'art-quilt'
  | 'wholecloth'
  | 'sampler'
  | 'mystery'
  | 'baby'
  | 'lap'
  | 'throw'
  | 'twin'
  | 'queen'
  | 'king';

// Validation
export function validateUniversalPattern(pattern: UniversalPattern): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields
  if (!pattern.id) errors.push('Pattern ID required');
  if (!pattern.metadata?.name) errors.push('Pattern name required');
  if (!pattern.source?.type) errors.push('Source type required');
  
  // Pattern Reader specifics
  if (pattern.source.type === 'pdf') {
    if (!pattern.construction?.steps?.length) {
      errors.push('PDF patterns must have construction steps');
    }
    if (!pattern.materials?.fabrics?.length) {
      warnings.push('PDF patterns should include fabric requirements');
    }
  }
  
  // AI generated specifics
  if (pattern.source.type === 'ai-generated') {
    if (!pattern.extensions?.ai?.prompt) {
      warnings.push('AI patterns should include the original prompt');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Pattern Reader parsing helpers
export interface ParsedSection {
  type: 'materials' | 'cutting' | 'construction' | 'finishing';
  title: string;
  content: string;
  parsed?: any; // Section-specific parsed data
}

// Common abbreviations to expand
export const QUILT_ABBREVIATIONS: Record<string, string> = {
  'RST': 'Right Sides Together',
  'WST': 'Wrong Sides Together',
  'HST': 'Half Square Triangle',
  'QST': 'Quarter Square Triangle',
  'WOF': 'Width of Fabric',
  'LOF': 'Length of Fabric',
  'FQ': 'Fat Quarter',
  'FE': 'Fat Eighth',
  'SA': 'Seam Allowance',
  'BOM': 'Block of the Month',
  'UFO': 'UnFinished Object',
  'WIP': 'Work In Progress',
  'FMQ': 'Free Motion Quilting',
  'EPP': 'English Paper Piecing',
  'Y2Y': 'Yard to Yard',
};// Additional type definitions for Universal Pattern Schema

export interface Notion {
  type: 'batting' | 'binding' | 'backing' | 'interfacing' | 'other';
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface Tool {
  name: string;
  required: boolean;
  alternatives?: string[];
  size?: string; // "6.5 inch square ruler"
}

export interface ThreadRequirement {
  type: 'piecing' | 'quilting' | 'applique' | 'decorative';
  color: string;
  weight?: string;
  brand?: string;
  amount?: string;
}

export interface Diagram {
  id: string;
  type: 'assembly' | 'cutting' | 'pressing' | 'placement';
  svg?: string; // Inline SVG
  imageUrl?: string;
  caption: string;
  annotations?: Annotation[];
}

export interface PhotoRef {
  url: string;
  caption: string;
  stage: 'before' | 'during' | 'after' | 'detail';
}

export interface SubcutInstruction {
  from: string; // "From strips"
  cut: string;  // "Cut into 2½ inch squares"
  quantity: number;
}

export interface CuttingLayout {
  fabricWidth: number;
  efficiency: number; // percentage
  diagram?: string; // SVG showing optimal layout
}

export interface VisualGuide {
  steps: Array<{
    image: string;
    caption: string;
  }>;
}

export interface BlockPiece {
  id: string;
  shape: PieceShape;
  fabric: string; // References material
  quantity: number;
}

export interface AssemblyStep {
  pieces: string[]; // Piece IDs
  technique: string;
  result: string; // ID of resulting unit
}

export interface BlockVariation {
  name: string;
  changes: Record<string, string>; // pieceId -> new fabric
}

export interface LayoutElement {
  blockId: string;
  position: { row: number; col: number };
  rotation?: number;
}

export interface Sashing {
  width: number;
  fabric: string;
  cornerstones?: {
    size: number;
    fabric: string;
  };
}

export interface Border {
  width: number;
  fabric: string;
  sides: ('top' | 'right' | 'bottom' | 'left')[];
  mitered?: boolean;
}

export interface Orientation {
  rotation: number;
  flip?: 'horizontal' | 'vertical';
}

export interface Placement {
  align: 'left' | 'right' | 'center' | 'top' | 'bottom';
  offset?: { x: number; y: number };
}

export interface Tip {
  text: string;
  type: 'beginner' | 'pro' | 'timesaver' | 'accuracy';
}

export interface Colorway {
  id: string;
  name: string;
  fabrics: Record<string, string>; // fabricId -> color/pattern
  preview?: string;
}

export interface QuiltingDesign {
  type: 'edge-to-edge' | 'custom' | 'motif' | 'ruler-work';
  patternRef?: string; // ID of longarm pattern
  density?: number;
  thread?: string;
}

export interface Attribution {
  required: boolean;
  text: string;
  url?: string;
}

export interface EmbroideryData {
  format: string[];
  stitchCount: number;
  colors: string[];
  size: Dimensions;
}

export interface LongarmData {
  patternId: string; // Reference to longarm pattern
  repeatType: string;
  density: number;
}

export interface CalculationData {
  fabricUsage: Record<string, number>;
  pieceCount: Record<string, number>;
  seamLength: number;
  quiltingArea: number;
}

export interface Annotation {
  x: number;
  y: number;
  text: string;
  arrow?: boolean;
}

export type PieceShape = 
  | 'square'
  | 'rectangle' 
  | 'half-square-triangle'
  | 'quarter-square-triangle'
  | 'triangle'
  | 'hexagon'
  | 'diamond'
  | 'custom';

// Helper functions for Pattern Reader
export function expandAbbreviation(text: string): string {
  let expanded = text;
  Object.entries(QUILT_ABBREVIATIONS).forEach(([abbr, full]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'g');
    expanded = expanded.replace(regex, `${full} (${abbr})`);
  });
  return expanded;
}

export function parseImperialMeasurement(text: string): number | null {
  // Handles "2½", "2 1/2", "2.5" inches
  const match = text.match(/(\d+)(?:\s*(\d+)\/(\d+)|\.(\d+)|½)?/);
  if (!match) return null;
  
  const whole = parseInt(match[1]);
  let fraction = 0;
  
  if (match[2] && match[3]) {
    fraction = parseInt(match[2]) / parseInt(match[3]);
  } else if (match[4]) {
    fraction = parseInt(match[4]) / Math.pow(10, match[4].length);
  } else if (text.includes('½')) {
    fraction = 0.5;
  }
  
  return whole + fraction;
}

// Pattern transformation utilities
export function convertToMetric(pattern: UniversalPattern): UniversalPattern {
  // Deep clone and convert all measurements
  const metricPattern = JSON.parse(JSON.stringify(pattern));
  
  // Convert dimensions throughout
  // ... implementation
  
  return metricPattern;
}

// Export utilities for different platforms
export function toEQ8Format(pattern: UniversalPattern): any {
  // Convert to Electric Quilt 8 format
  // ... implementation
}

export function toPrintableHTML(pattern: UniversalPattern): string {
  // Generate printer-friendly HTML
  // ... implementation
  return '';
}

// Pattern complexity analyzer
export function analyzeComplexity(pattern: UniversalPattern): {
  score: number;
  factors: string[];
} {
  let score = 1; // Base difficulty
  const factors: string[] = [];
  
  // Check number of different fabrics
  if (pattern.materials.fabrics.length > 5) {
    score += 1;
    factors.push('Many fabrics');
  }
  
  // Check techniques used
  const advancedTechniques = ['paper-piecing', 'curved-piecing', 'y-seams'];
  const usedTechniques = pattern.construction.techniques.map(t => t.id);
  if (usedTechniques.some(t => advancedTechniques.includes(t))) {
    score += 2;
    factors.push('Advanced techniques');
  }
  
  // Check piece count
  const totalPieces = pattern.construction.cuttingInstructions
    .reduce((sum, cut) => sum + cut.pieces.reduce((s, p) => s + p.quantity, 0), 0);
  if (totalPieces > 100) {
    score += 1;
    factors.push('Many pieces');
  }
  
  return { score: Math.min(score, 5), factors };
}

// Migration utilities for future schema changes
export function migratePattern(pattern: any, fromVersion: string): UniversalPattern {
  // Handle migrations as schema evolves
  switch (fromVersion) {
    case '0.9.0':
      // Migrate from beta schema
      // ... implementation
      break;
  }
  
  return pattern as UniversalPattern;
}