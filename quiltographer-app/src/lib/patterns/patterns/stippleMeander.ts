import { PatternDefinition } from '../schema';

// Stipple Meander - Most popular edge-to-edge pattern for longarm quilting
export const stippleMeander: PatternDefinition = {
  id: 'pattern_stipple_meander_001',
  name: 'Stipple Meander',
  category: 'edge-to-edge',
  tags: ['stipple', 'meander', 'continuous', 'allover', 'beginner', 'popular'],
  
  geometry: {
    type: 'svg',
    // Classic stipple/meander shape - puzzle piece like
    svgPath: `
      M 25,0
      C 40,0 50,10 50,25
      C 50,30 48,35 45,38
      C 42,35 38,33 33,33
      C 38,33 42,35 45,38
      C 48,41 50,45 50,50
      C 50,50 40,50 25,50
      C 20,50 15,48 12,45
      C 15,42 17,38 17,33
      C 17,38 15,42 12,45
      C 9,48 5,50 0,50
      C 0,50 0,40 0,25
      C 0,10 10,0 25,0
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
      x: 50,
      y: 50
    },
    overlap: 0,
    rotationIncrement: 90,
    nesting: {
      optimal: true,
      efficiency: 0.98 // Very efficient pattern
    }
  },
  
  variants: [
    {
      id: 'var_micro',
      name: 'Micro Stipple',
      type: 'density',
      stitchDensity: 16,
      scale: 0.5,
      thumbnail: '/patterns/stipple-micro.png',
      popularityScore: 0.8
    },
    {
      id: 'var_small',
      name: 'Small Stipple',
      type: 'density',
      stitchDensity: 12,
      scale: 0.75,
      thumbnail: '/patterns/stipple-small.png',
      popularityScore: 0.95
    },
    {
      id: 'var_medium',
      name: 'Medium Stipple',
      type: 'density',
      stitchDensity: 10,
      scale: 1.0,
      thumbnail: '/patterns/stipple-medium.png',
      popularityScore: 1.0 // Most popular!
    },
    {
      id: 'var_large',
      name: 'Large Stipple',
      type: 'density',
      stitchDensity: 8,
      scale: 1.5,
      thumbnail: '/patterns/stipple-large.png',
      popularityScore: 0.7
    }
  ],
  
  constraints: {
    size: {
      minWidth: 25,
      minHeight: 25,
      maintainAspectRatio: false
    },
    thread: {
      weight: ['40wt', '50wt', '60wt'],
      type: ['cotton', 'polyester', 'rayon', 'monofilament']
    }
  },
  
  longarmProperties: {
    stitchPath: {
      continuous: true,
      entryPoint: 'any', // Can start anywhere
      exitPoint: 'any',
      preferredDirection: 'horizontal'
    },
    compatibility: {
      minStitchLength: 0.5,
      maxStitchLength: 5.0, // Can handle longer stitches
      tensionSettings: {
        default: 'medium',
        cotton: 'medium',
        polyester: 'medium-low',
        monofilament: 'low'
      }
    },
    density: {
      default: 10,
      minimum: 6,
      maximum: 18,
      variable: true
    },
    estimates: {
      timePerRepeat: 12, // Faster than feathers
      threadPerRepeat: 0.7,
      formula: 'area * density * 1.1' // Less thread than feathers
    }
  },
  
  culturalContext: {
    origin: {
      culture: 'Modern Quilting',
      period: '1980s',
      region: 'International',
      designer: 'Unknown'
    },
    significance: 'Most versatile all-over pattern, works with any quilt style',
    traditionalName: 'Stippling',
    attribution: {
      required: false,
      text: 'Common quilting pattern'
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