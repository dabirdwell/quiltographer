// Mock pattern for development/testing
import type { ReaderPattern } from './schema';

export const MOCK_PATTERN: ReaderPattern = {
  id: 'mock-1',
  name: 'Simple Log Cabin Block',
  description: 'A beginner-friendly log cabin block using 2½" strips.',
  difficulty: 2,
  estimatedTime: 3,
  finishedSize: { width: 12, height: 12, unit: 'inches' },
  summary: 'This classic log cabin block builds from a center square outward, adding strips in a clockwise pattern. Perfect for beginners learning accurate seam allowances.',
  materials: [
    { id: 'm1', name: 'Light fabric', type: 'fabric', quantity: '½ yard' },
    { id: 'm2', name: 'Dark fabric', type: 'fabric', quantity: '½ yard' },
    { id: 'm3', name: 'Center square fabric', type: 'fabric', quantity: '¼ yard' },
  ],
  cuttingInstructions: [
    { id: 'c1', fabric: 'Light fabric', pieces: [{ shape: 'strip', quantity: 4, dimensions: '2½" x WOF' }] },
    { id: 'c2', fabric: 'Dark fabric', pieces: [{ shape: 'strip', quantity: 4, dimensions: '2½" x WOF' }] },
    { id: 'c3', fabric: 'Center square', pieces: [{ shape: 'square', quantity: 1, dimensions: '2½" x 2½"' }] },
  ],
  steps: [
    {
      id: 's1', number: 1, title: 'Prepare the Center', section: 'Getting Started',
      instruction: 'Cut one 2½" square from your center fabric. This will be the heart of your log cabin block.',
      techniques: [], warnings: [],
      tips: [{ text: 'Press your fabric before cutting for accurate measurements.', source: 'ai' }],
      estimatedTime: 2,
    },
    {
      id: 's2', number: 2, title: 'First Light Strip', section: 'Building the Block',
      instruction: 'Place your center square RST with a light strip. Sew with ¼" seam. Press toward the strip. Trim even.',
      techniques: ['RST', 'chain-piecing'],
      warnings: [{ type: 'important', message: 'Always press toward the darker fabric to prevent show-through.' }],
      tips: [{ text: 'Use a ¼" presser foot for accurate seams.', source: 'pattern' }],
      estimatedTime: 5,
    },
    {
      id: 's3', number: 3, title: 'Second Light Strip', section: 'Building the Block',
      instruction: 'Rotate your unit 90° clockwise. Add another light strip RST across the top. Sew, press, trim.',
      techniques: ['RST'], warnings: [], tips: [], estimatedTime: 3,
    },
    {
      id: 's4', number: 4, title: 'First Dark Strip', section: 'Building the Block',
      instruction: 'Rotate 90° clockwise again. Now add a dark strip RST. Sew with ¼" seam, press toward dark, trim.',
      techniques: ['RST'], warnings: [],
      tips: [{ text: 'The dark/light pattern creates the signature log cabin visual effect.', source: 'ai' }],
      estimatedTime: 3,
    },
    {
      id: 's5', number: 5, title: 'Second Dark Strip', section: 'Building the Block',
      instruction: 'Rotate 90° clockwise. Add the final dark strip of this round. Sew, press, trim. Round complete!',
      techniques: ['RST'], warnings: [], tips: [], estimatedTime: 3,
    },
    {
      id: 's6', number: 6, title: 'Continue Building', section: 'Building the Block',
      instruction: 'Repeat: two light strips, then two dark strips, rotating 90° after each. Continue until 12½" square.',
      techniques: ['RST'],
      warnings: [{ type: 'critical', message: 'Check your block is square after each round. Use a square ruler.' }],
      tips: [{ text: 'For a 12" block, plan for 3 complete rounds.', source: 'ai' }],
      estimatedTime: 20,
    },
    {
      id: 's7', number: 7, title: 'Final Press', section: 'Finishing',
      instruction: 'Give your completed block a final press. Square up to 12½" x 12½" if needed. Ready for assembly!',
      techniques: [], warnings: [],
      tips: [{ text: 'Starch lightly when pressing to keep your block crisp.', source: 'community' }],
      estimatedTime: 3,
    },
  ],
  source: { fileName: 'simple-log-cabin.pdf', parsedAt: new Date() },
};
