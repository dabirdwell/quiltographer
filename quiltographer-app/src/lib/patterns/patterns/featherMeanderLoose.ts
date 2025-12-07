import { PatternDefinition } from '../schema';

// Extra Loose variant - fewer stitches per inch
export const featherMeanderExtraLoose: PatternDefinition = {
  id: 'pattern_feather_meander_extra_loose',
  name: 'Feather Meander - Extra Loose',
  category: 'edge-to-edge',
  tags: ['feathers', 'continuous', 'traditional', 'allover', 'fast-quilting'],
  
  geometry: {
    type: 'svg',
    // Larger, simpler feather pattern for loose quilting
    svgPath: `
      M 0,50 
      C 20,20 40,10 60,20
      C 80,30 90,50 80,70
      C 70,90 50,100 30,90
      C 10,80 0,60 0,50
    `,
    bounds: {
      width: 100,
      height: 100
    },
    origin: {
      x: 50,
      y: 50
    }
  },
  
  repeat: {
    type: 'continuous',
    spacing: {
      x: 100, // Wider spacing for loose density
      y: 100
    },
    overlap: 0,
    rotationIncrement: 90,
    nesting: {
      optimal: true,
      efficiency: 0.85
    }
  },
  
  variants: [
    {
      id: 'var_extra_loose',
      name: 'Extra Loose',
      type: 'density',
      stitchDensity: 6,
      thumbnail: '/patterns/feather-meander-extra-loose.png',
      popularityScore: 0.8
    }
  ],
  
  constraints: {
    size: {
      minWidth: 100,
      minHeight: 100,
      maintainAspectRatio: false
    },
    thread: {
      weight: ['40wt', '50wt'],
      type: ['cotton', 'polyester']
    }
  },
  
  longarmProperties: {
    stitchPath: {
      continuous: true,
      entryPoint: 'any',
      exitPoint: 'any',
      preferredDirection: 'horizontal'
    },
    compatibility: {
      minStitchLength: 1.0,
      maxStitchLength: 5.0,
      tensionSettings: {
        default: 'medium-low'
      }
    },
    density: {
      default: 6,
      minimum: 4,
      maximum: 8,
      variable: false
    },
    estimates: {
      timePerRepeat: 20, // Faster due to fewer stitches
      threadPerRepeat: 1.2, // Less thread needed
      formula: 'area * density * 0.8'
    }
  },
  
  culturalContext: {
    origin: {
      culture: 'American Traditional',
      period: '1930s',
      region: 'Midwest'
    },
    significance: 'Loose feather patterns for utility quilts',
    traditionalName: 'Quick Feather',
    attribution: {
      required: false,
      text: 'Traditional Pattern'
    },
    appropriateness: {
      commercialUse: true,
      modifications: true
    }
  }
};