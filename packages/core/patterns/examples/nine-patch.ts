// Example: Simple Nine Patch Pattern
// This shows how a PDF pattern would be parsed into our Universal Schema

import { UniversalPattern } from '../universal-schema';

export const ninePatchExample: UniversalPattern = {
  // Core identification
  id: 'pattern-001-nine-patch',
  version: '1.0.0',
  created: new Date('2024-07-29'),
  updated: new Date('2024-07-29'),
  
  // Source tracking
  source: {
    type: 'pdf',
    originalRef: 'Simple_Nine_Patch_Pattern.pdf',
    creator: {
      name: 'Traditional Pattern',
      attribution: 'Public Domain'
    }
  },
  
  // Basic metadata  
  metadata: {
    name: 'Simple Nine Patch Block',
    description: 'A classic beginner-friendly quilt block perfect for using scraps',
    difficulty: 1,
    estimatedTime: 2, // hours
    size: {
      finished: { width: 9, height: 9, unit: 'inches' },
      unfinished: { width: 9.5, height: 9.5, unit: 'inches' }
    },
    tags: ['beginner', 'traditional', 'scrap-friendly', 'nine-patch'],
    images: [
      {
        url: '/images/nine-patch-complete.jpg',
        type: 'photo',
        caption: 'Completed Nine Patch block'
      }
    ],
    category: 'traditional-pieced'
  },
  
  // Materials needed
  materials: {
    fabrics: [
      {
        id: 'fabric-a',
        name: 'Light fabric (background)',
        amount: 0.25,
        unit: 'yards',
        notes: 'Can use scraps - need five 3½" squares total'
      },
      {
        id: 'fabric-b', 
        name: 'Dark fabric (contrast)',
        amount: 0.25,
        unit: 'yards',
        notes: 'Can use scraps - need four 3½" squares total'
      }
    ],
    notions: [
      {
        type: 'other',
        name: 'Thread',
        amount: 1,
        unit: 'spool',
        notes: 'Neutral color to blend with both fabrics'
      }
    ],
    tools: [
      {
        name: 'Rotary cutter',
        required: true
      },
      {
        name: 'Cutting mat',
        required: true
      },
      {
        name: 'Quilting ruler',
        required: true,
        size: 'At least 3½" square'
      },
      {
        name: 'Sewing machine',
        required: true
      },
      {
        name: 'Iron and ironing board',
        required: true
      }
    ]
  },  
  // Construction instructions
  construction: {
    cuttingInstructions: [
      {
        id: 'cut-1',
        fabric: 'fabric-a',
        pieces: [{
          shape: 'square',
          quantity: 5,
          dimensions: { width: 3.5, height: 3.5, unit: 'inches' }
        }],
        tips: ['Check fabric grain line', 'Stack fabrics for faster cutting']
      },
      {
        id: 'cut-2',
        fabric: 'fabric-b',
        pieces: [{
          shape: 'square',
          quantity: 4,
          dimensions: { width: 3.5, height: 3.5, unit: 'inches' }
        }]
      }
    ],
    
    steps: [
      {
        id: 'step-1',
        number: 1,
        title: 'Arrange your squares',
        instruction: 'Lay out squares in a 3x3 grid, alternating colors. Dark squares in corners and center, light squares on sides.',
        clarifiedInstruction: 'Arrange your nine squares in three rows of three squares each. Place dark fabric squares in all four corners and the center position. Place light fabric squares in the middle of each side (top, right, bottom, left positions).',
        diagrams: [{
          id: 'diagram-1',
          type: 'placement',
          caption: 'Nine Patch layout - D=Dark, L=Light',
          svg: `<svg viewBox="0 0 300 300">
            <rect x="0" y="0" width="100" height="100" fill="#333" />
            <text x="50" y="50" text-anchor="middle" fill="white">D</text>
            <rect x="100" y="0" width="100" height="100" fill="#f0f0f0" />
            <text x="150" y="50" text-anchor="middle">L</text>
            <rect x="200" y="0" width="100" height="100" fill="#333" />
            <text x="250" y="50" text-anchor="middle" fill="white">D</text>
            <!-- Row 2 -->
            <rect x="0" y="100" width="100" height="100" fill="#f0f0f0" />
            <text x="50" y="150" text-anchor="middle">L</text>
            <rect x="100" y="100" width="100" height="100" fill="#333" />
            <text x="150" y="150" text-anchor="middle" fill="white">D</text>
            <rect x="200" y="100" width="100" height="100" fill="#f0f0f0" />
            <text x="250" y="150" text-anchor="middle">L</text>
            <!-- Row 3 -->
            <rect x="0" y="200" width="100" height="100" fill="#333" />
            <text x="50" y="250" text-anchor="middle" fill="white">D</text>
            <rect x="100" y="200" width="100" height="100" fill="#f0f0f0" />
            <text x="150" y="250" text-anchor="middle">L</text>
            <rect x="200" y="200" width="100" height="100" fill="#333" />
            <text x="250" y="250" text-anchor="middle" fill="white">D</text>
          </svg>`
        }],
        pieces: [
          {
            id: 'piece-1',
            description: '3½" dark squares',
            quantity: 4,
            placement: { align: 'center' }
          },
          {
            id: 'piece-2',
            description: '3½" light squares',
            quantity: 5,
            placement: { align: 'center' }
          }
        ],
        tips: [{
          text: 'Take a photo of your layout before sewing!',
          type: 'beginner'
        }],
        estimatedTime: 5
      },      
      {
        id: 'step-2',
        number: 2,
        title: 'Sew Row 1',
        instruction: 'Sew squares RST with ¼" SA. Press to dark.',
        clarifiedInstruction: 'Take the first row of three squares. Place the first two squares Right Sides Together (pretty sides facing each other). Sew along the right edge with a ¼ inch seam allowance. Then add the third square to complete the row. Press seam allowances toward the dark fabric squares.',
        diagrams: [{
          id: 'diagram-2',
          type: 'assembly',
          caption: 'Sewing squares together with ¼" seam',
          svg: '<!-- Assembly diagram would go here -->'
        }],
        pieces: [
          {
            id: 'row-1-squares',
            description: 'Top row: Dark-Light-Dark squares',
            quantity: 3
          }
        ],
        techniques: ['basic-piecing', 'chain-piecing'],
        warnings: [{
          type: 'important',
          message: 'Maintain consistent ¼" seam allowance for blocks to fit together properly',
          icon: 'alert'
        }],
        checkpoints: [{
          description: 'Row should measure 9½" wide by 3½" tall',
          measurements: ['9½" x 3½"']
        }],
        estimatedTime: 10
      },
      
      {
        id: 'step-3',
        number: 3,
        title: 'Sew Rows 2 and 3',
        instruction: 'Repeat for remaining rows. Press Row 2 to light, Row 3 to dark.',
        clarifiedInstruction: 'Sew Row 2 (Light-Dark-Light) in the same manner as Row 1, but press the seam allowances toward the light squares. For Row 3 (Dark-Light-Dark), press toward the dark squares. This alternating pressing creates nesting seams when joining rows.',
        pieces: [
          {
            id: 'row-2-squares',
            description: 'Middle row: Light-Dark-Light squares',
            quantity: 3
          },
          {
            id: 'row-3-squares',
            description: 'Bottom row: Dark-Light-Dark squares',
            quantity: 3
          }
        ],
        techniques: ['basic-piecing', 'nesting-seams'],
        tips: [{
          text: 'Pressing in opposite directions helps seams nest together perfectly',
          type: 'accuracy'
        }],
        estimatedTime: 20
      },      
      {
        id: 'step-4',
        number: 4,
        title: 'Join the rows',
        instruction: 'Sew rows together, matching seams. Press.',
        clarifiedInstruction: 'Place Row 1 and Row 2 right sides together, carefully aligning the seam intersections. The seams should nest together due to opposite pressing. Pin at intersections if needed. Sew with ¼" seam allowance. Add Row 3 in the same manner. Press final seams open or to one side.',
        diagrams: [{
          id: 'diagram-4',
          type: 'assembly',
          caption: 'Nesting seams at intersections',
          svg: '<!-- Nesting seams diagram -->'
        }],
        techniques: ['joining-rows', 'matching-points'],
        warnings: [{
          type: 'critical',
          message: 'Take time to match seam intersections - this is what makes your points sharp!',
          icon: 'star'
        }],
        checkpoints: [{
          description: 'Completed block should measure 9½" square',
          measurements: ['9½" x 9½"'],
          image: {
            url: '/images/nine-patch-complete-unfinished.jpg',
            caption: 'Your block should look like this',
            type: 'photo'
          }
        }],
        estimatedTime: 15
      },
      
      {
        id: 'step-5',
        number: 5,
        title: 'Square up if needed',
        instruction: 'Trim to 9½" square.',
        clarifiedInstruction: 'Place your quilting ruler over the block, aligning the 9½" markings with the edges. Check that your block is square and measures exactly 9½" x 9½". If needed, trim excess fabric from edges with rotary cutter, being careful not to cut into your ¼" seam allowances.',
        techniques: ['squaring-up'],
        tips: [{
          text: 'Always square up blocks before assembling into a quilt top',
          type: 'pro'
        }],
        estimatedTime: 5
      }
    ],
    
    techniques: [
      {
        id: 'basic-piecing',
        name: 'Basic Piecing',
        abbreviation: 'BP',
        difficulty: 1,
        description: 'Sewing two pieces of fabric together with a straight seam',
        steps: [
          'Place fabrics right sides together',
          'Align edges to be sewn',
          'Sew with ¼" seam allowance',
          'Press as directed'
        ],
        commonIn: ['traditional-pieced'],
        tools: ['sewing-machine', 'pins']
      },
      {
        id: 'chain-piecing',
        name: 'Chain Piecing',
        difficulty: 1,
        description: 'Sewing multiple units without cutting thread between them',
        steps: [
          'Sew first unit',
          'Without lifting presser foot, feed next unit',
          'Continue until all units sewn',
          'Cut apart and press'
        ],
        commonIn: ['traditional-pieced'],
        tools: ['sewing-machine']
      },
      {
        id: 'nesting-seams',
        name: 'Nesting Seams',
        difficulty: 2,
        description: 'Pressing seams in opposite directions so they lock together',
        steps: [
          'Press adjoining seams in opposite directions',
          'When joining, seams will nest together',
          'Pin through the nested seams',
          'Sew carefully to maintain alignment'
        ],
        commonIn: ['traditional-pieced']
      },
      {
        id: 'squaring-up',
        name: 'Squaring Up',
        difficulty: 1,
        description: 'Trimming a block to exact size',
        steps: [
          'Place ruler over block',
          'Align desired measurements with block edges',
          'Check all corners are 90 degrees',
          'Trim excess with rotary cutter'
        ],
        commonIn: ['traditional-pieced'],
        tools: ['quilting-ruler', 'rotary-cutter', 'cutting-mat']
      }
    ],
    
    tips: [
      {
        text: 'Make multiple blocks for a full quilt - try different color combinations!',
        type: 'beginner'
      },
      {
        text: 'This block is perfect for beginners to practice accurate cutting and seaming',
        type: 'beginner'
      }
    ]
  },
  
  // Visual representation
  visuals: {
    blocks: [{
      id: 'nine-patch-block',
      name: 'Nine Patch',
      size: { width: 9, height: 9, unit: 'inches' },
      pieces: [
        {
          id: 'tl-corner',
          shape: 'square',
          fabric: 'fabric-b',
          quantity: 1
        },
        {
          id: 'top-side',
          shape: 'square',
          fabric: 'fabric-a',
          quantity: 1
        },
        {
          id: 'tr-corner',
          shape: 'square',
          fabric: 'fabric-b',
          quantity: 1
        },
        {
          id: 'left-side',
          shape: 'square',
          fabric: 'fabric-a',
          quantity: 1
        },
        {
          id: 'center',
          shape: 'square',
          fabric: 'fabric-b',
          quantity: 1
        },
        {
          id: 'right-side',
          shape: 'square',
          fabric: 'fabric-a',
          quantity: 1
        },
        {
          id: 'bl-corner',
          shape: 'square',
          fabric: 'fabric-b',
          quantity: 1
        },
        {
          id: 'bottom-side',
          shape: 'square',
          fabric: 'fabric-a',
          quantity: 1
        },
        {
          id: 'br-corner',
          shape: 'square',
          fabric: 'fabric-b',
          quantity: 1
        }
      ],
      assembly: [
        {
          pieces: ['tl-corner', 'top-side', 'tr-corner'],
          technique: 'basic-piecing',
          result: 'row-1'
        },
        {
          pieces: ['left-side', 'center', 'right-side'],
          technique: 'basic-piecing',
          result: 'row-2'
        },
        {
          pieces: ['bl-corner', 'bottom-side', 'br-corner'],
          technique: 'basic-piecing',
          result: 'row-3'
        },
        {
          pieces: ['row-1', 'row-2', 'row-3'],
          technique: 'joining-rows',
          result: 'complete-block'
        }
      ],
      rotations: [0, 90, 180, 270] // Can rotate in 90° increments
    }],
    
    colorways: [
      {
        id: 'traditional',
        name: 'Traditional',
        fabrics: {
          'fabric-a': '#f8f8f8',
          'fabric-b': '#2c3e50'
        }
      },
      {
        id: 'modern',
        name: 'Modern Brights',
        fabrics: {
          'fabric-a': '#ffffff',
          'fabric-b': '#e74c3c'
        }
      },
      {
        id: 'scrappy',
        name: 'Scrappy',
        fabrics: {
          'fabric-a': 'various-lights',
          'fabric-b': 'various-darks'
        }
      }
    ]
  },
  
  // Sharing information
  sharing: {
    license: 'share',
    attribution: {
      required: false,
      text: 'Traditional Nine Patch Pattern'
    }
  }
};