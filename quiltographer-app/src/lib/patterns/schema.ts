// Pattern Definition Schema for Quiltographer
// Optimized for longarm quilting machines

export interface PatternDefinition {
  // Core identification
  id: string;
  name: string;
  category: PatternCategory;
  tags: string[];
  
  // Geometry definition
  geometry: PatternGeometry;
  
  // Repeat structure (critical for edge-to-edge)
  repeat: RepeatStructure;
  
  // Variants (colorways, densities)
  variants: PatternVariant[];
  
  // Physical constraints
  constraints: PhysicalConstraints;
  
  // Longarm-specific properties
  longarmProperties: LongarmProperties;
  
  // Cultural and attribution
  culturalContext?: CulturalMetadata;
  
  // Business metadata
  pricing?: PricingInfo;
}

export interface PatternGeometry {
  type: 'svg' | 'parametric' | 'procedural';
  
  // For SVG patterns
  svgPath?: string;
  
  // For parametric patterns
  parameters?: ParameterDefinition[];
  generator?: (params: Record<string, number>) => string;
  
  // Bounding box for repeat calculations
  bounds: {
    width: number;
    height: number;
  };
  
  // Origin point for rotations
  origin: {
    x: number;
    y: number;
  };
}

export interface RepeatStructure {
  type: 'tile' | 'brick' | 'half-drop' | 'continuous' | 'radial';
  
  // Spacing between repeats
  spacing: {
    x: number;
    y: number;
  };
  
  // Overlap for continuous patterns
  overlap?: number;
  
  // Rotation options
  rotationIncrement?: number; // e.g., 45 for 8-way symmetry
  
  // Nesting information for efficient quilting
  nesting?: {
    optimal: boolean;
    efficiency: number; // 0-1
  };
}
export interface LongarmProperties {
  // Stitch path optimization
  stitchPath: {
    continuous: boolean; // Can quilt without lifting
    entryPoint: 'any' | 'corner' | 'center' | 'edge';
    exitPoint: 'any' | 'corner' | 'center' | 'edge';
    preferredDirection?: 'horizontal' | 'vertical' | 'diagonal';
  };
  
  // Machine compatibility
  compatibility: {
    minStitchLength: number; // in mm
    maxStitchLength: number;
    tensionSettings?: TensionProfile;
    speedSettings?: SpeedProfile;
  };
  
  // Pattern density for different quilt areas
  density: {
    default: number; // stitches per inch
    minimum: number;
    maximum: number;
    variable?: boolean; // Allow density changes
  };
  
  // Time and thread estimates
  estimates: {
    timePerRepeat: number; // seconds
    threadPerRepeat: number; // meters
    formula?: string; // For complex calculations
  };
}

export interface PatternVariant {
  id: string;
  name: string;
  type: 'colorway' | 'density' | 'scale' | 'style';
  
  // Visual changes
  colors?: ColorScheme;
  scale?: number;
  rotation?: number;
  
  // Stitch changes
  stitchDensity?: number;
  stitchLength?: number;
  
  // Preview
  thumbnail?: string;
  popularityScore?: number;
}

export interface PhysicalConstraints {
  // Minimum/maximum sizes
  size: {
    minWidth: number;
    minHeight: number;
    maxWidth?: number;
    maxHeight?: number;
    maintainAspectRatio: boolean;
  };
  
  // Thread and fabric considerations
  thread: {
    weight: ThreadWeight[];
    type: ThreadType[];
  };
  
  // Seam allowances if applicable
  seamAllowance?: {
    default: number;
    edges: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  };
}

export interface CulturalMetadata {
  origin: {
    culture: string;
    period: string;
    region?: string;
    designer?: string;
  };
  
  significance: string;
  traditionalName?: string;
  symbolism?: string;
  
  attribution: {
    required: boolean;
    text: string;
    link?: string;
  };
  
  appropriateness: {
    commercialUse: boolean;
    modifications: boolean;
    culturalNotes?: string;
  };
}

// Supporting types
export type PatternCategory = 
  | 'edge-to-edge'
  | 'custom'
  | 'border'
  | 'sashing'
  | 'block'
  | 'wholecloth'
  | 'pantograph'
  | 'motif';

export type ThreadWeight = '30wt' | '40wt' | '50wt' | '60wt' | '80wt' | '100wt';
export type ThreadType = 'cotton' | 'polyester' | 'rayon' | 'silk' | 'metallic' | 'monofilament';

export interface ColorScheme {
  primary: string;
  secondary?: string;
  accent?: string;
  background?: string;
  threads: {
    main: string;
    contrast?: string;
  };
}

export interface ParameterDefinition {
  name: string;
  type: 'number' | 'color' | 'boolean' | 'select';
  default: any;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{label: string; value: any}>;
  affects: 'geometry' | 'style' | 'both';
}

// Pattern validation
export function validatePattern(pattern: PatternDefinition): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required fields
  if (!pattern.id) errors.push('Pattern ID is required');
  if (!pattern.name) errors.push('Pattern name is required');
  if (!pattern.geometry) errors.push('Pattern geometry is required');
  
  // Check longarm compatibility
  if (pattern.category === 'edge-to-edge' && !pattern.longarmProperties) {
    warnings.push('Edge-to-edge patterns should include longarm properties');
  }
  
  // Check cultural attribution
  if (pattern.culturalContext && !pattern.culturalContext.attribution) {
    warnings.push('Cultural patterns should include attribution information');
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

// Additional type definitions
export interface TensionProfile {
  default: string;
  cotton?: string;
  polyester?: string;
  rayon?: string;
  silk?: string;
  monofilament?: string;
}

export interface SpeedProfile {
  default: number; // mm/s
  curves: number;
  straight: number;
  details: number;
}

export interface PricingInfo {
  license: 'free' | 'premium' | 'commercial';
  commercialUse: 'free' | 'paid' | 'restricted';
  price?: number;
  currency?: string;
}