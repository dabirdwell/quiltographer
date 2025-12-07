import { PatternDefinition } from '../schema';

// Feather Meander - Classic edge-to-edge pattern for longarm quilting
export const featherMeander: PatternDefinition = {
  id: 'pattern_feather_meander_001',
  name: 'Feather Meander',
  category: 'edge-to-edge',
  tags: ['feathers', 'continuous', 'traditional', 'allover', 'beginner-friendly'],
  
  geometry: {
    type: 'svg',
    // Simpler, more typical feather curl for edge-to-edge
    svgPath: `
      M 0,25
      C 0,11 11,0 25,0
      C 39,0 50,11 50,25
      C 50,39 39,50 25,50
      C 20,50 15,48 11,45
      C 15,48 20,50 25,50
      C 32,50 38,46 41,40
      C 38,46 32,50 25,50
      C 11,50 0,39 0,25
      Z
    `,
    bounds: {
      width: 50,
      height: 50
    },
    origin: {
      x: 25,
      y: 25
    }
  },
  
  repeat: {
    type: 'continuous',
    spacing: {
      x: 50, // Base spacing - will be modified by density
      y: 50
    },
    overlap: 0, // No overlap needed with proper spacing
    rotationIncrement: 90,
    nesting: {
      optimal: true,
      efficiency: 0.95
    }
  },
  
  variants: [
    {
      id: 'var_dense',
      name: 'Dense',
      type: 'density',
      stitchDensity: 12, // stitches per inch
      scale: 0.8, // Smaller patterns = denser coverage
      thumbnail: '/patterns/feather-meander-dense.png',
      popularityScore: 0.9
    },
    {
      id: 'var_medium',
      name: 'Medium',
      type: 'density',
      stitchDensity: 10,
      scale: 1.0, // Normal size
      thumbnail: '/patterns/feather-meander-medium.png',
      popularityScore: 0.8
    },
    {
      id: 'var_loose',
      name: 'Loose', 
      type: 'density',
      stitchDensity: 8,
      scale: 1.2, // Larger patterns = looser coverage
      thumbnail: '/patterns/feather-meander-loose.png',
      popularityScore: 0.7
    },
    {
      id: 'var_extra_loose',
      name: 'Extra Loose',
      type: 'density',
      stitchDensity: 6,
      scale: 1.5, // Much larger = very loose
      thumbnail: '/patterns/feather-meander-extra-loose.png',
      popularityScore: 0.5
    }
  ],
  
  constraints: {
    size: {
      minWidth: 25,
      minHeight: 25,
      maintainAspectRatio: false
    },
    thread: {
      weight: ['40wt', '50wt'],
      type: ['cotton', 'polyester', 'rayon']
    }
  },
  
  longarmProperties: {
    stitchPath: {
      continuous: true,
      entryPoint: 'corner',
      exitPoint: 'corner',
      preferredDirection: 'horizontal'
    },
    compatibility: {
      minStitchLength: 0.5, // mm
      maxStitchLength: 4.0,
      tensionSettings: {
        default: 'medium',
        cotton: 'medium-high',
        polyester: 'medium-low'
      }
    },
    density: {
      default: 10, // stitches per inch
      minimum: 6,
      maximum: 16,
      variable: true
    },
    estimates: {
      timePerRepeat: 15, // seconds per pattern repeat
      threadPerRepeat: 0.8, // meters per pattern
      formula: 'area * density * 1.2' // 20% extra for curves
    }
  },
  
  culturalContext: {
    origin: {
      culture: 'American Traditional',
      period: '1930s',
      region: 'Midwest',
      designer: 'Traditional'
    },
    significance: 'Feather patterns symbolize comfort and protection',
    traditionalName: 'Feather Wreath Variation',
    attribution: {
      required: false,
      text: 'Traditional American Quilting Pattern'
    },
    appropriateness: {
      commercialUse: true,
      modifications: true
    }
  },
  
  pricing: {
    license: 'free',
    commercialUse: 'free'
  }
};