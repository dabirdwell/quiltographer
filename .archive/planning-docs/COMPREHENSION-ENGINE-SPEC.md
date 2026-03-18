# Pattern Comprehension Engine - Technical Specification
## For Claude Code Implementation

**Project:** Quiltographer Pattern Reader
**Location:** `/Users/david/Documents/Claude_Technical/quiltographer/quiltographer-app`
**Goal:** Transform uploaded PDF patterns into AI-comprehended, visually-enhanced guidance

---

## Overview

When a user uploads a PDF pattern, we don't just extract text. We **comprehend** the pattern through a multi-stage AI pipeline, generating:
- Clarified instructions (rewritten for clarity)
- Step-specific SVG diagrams (not generic technique illustrations)
- Assembly understanding (how units connect)
- Proactive guidance (tips, warnings, context)

This takes 30-60 seconds and is the core value proposition.

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   PDF Upload    │────▶│  Comprehension  │────▶│   Structured    │
│                 │     │    Pipeline     │     │    Pattern      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  Claude Haiku   │
                        │  (multi-stage)  │
                        └─────────────────┘
```

---

## Data Structures

### Core Types (create in `/src/types/pattern.ts`)

```typescript
// The fully comprehended pattern - output of AI pipeline
export interface ComprehendedPattern {
  id: string;
  uploadedAt: string;
  processingTime: number; // ms
  
  // Metadata
  metadata: PatternMetadata;
  
  // Materials with AI-enhanced context
  materials: ComprehendedMaterial[];
  
  // The heart of it - deeply understood steps
  steps: ComprehendedStep[];
  
  // How everything connects
  assembly: AssemblyMap;
  
  // Original text preserved for reference
  originalText: string;
}

export interface PatternMetadata {
  name: string;
  designer?: string;
  source?: string;
  finishedSize?: { width: number; height: number; unit: 'inches' | 'cm' };
  difficulty: 'beginner' | 'confident-beginner' | 'intermediate' | 'advanced';
  difficultyExplanation: string; // "Involves bias cutting which can stretch"
  techniquesSummary: string[];   // High-level: ["strip piecing", "bias cutting", "on-point assembly"]
  estimatedTime?: string;        // "8-12 hours"
}

export interface ComprehendedMaterial {
  item: string;              // "Kona Classic Skinny Strips"
  quantity: string;          // "1 pack"
  quantityNumeric?: number;  // 1
  unit?: string;             // "pack", "yards", "sheets"
  purpose: string;           // "Creates the colored strips in your blocks"
  usedInSteps: number[];     // [1, 2]
  substitutionNotes?: string; // "Any 2.5\" strip set will work"
}

export interface ComprehendedStep {
  number: number;
  
  // Original from PDF
  originalTitle: string;
  originalInstruction: string;
  
  // AI-generated clarity
  clarifiedTitle: string;      // More descriptive: "Sew Strip Sets" → "Build Your Strip Set Units"
  clarifiedInstruction: string; // Rewritten for beginners, expanded
  
  // Context in the pattern
  whyThisMatters: string;      // "These strip sets become the fabric you'll cut triangles from"
  whatYouCreate: string;       // "13 identical five-strip units"
  quantityToMake: number | null; // 13
  unitName: string | null;     // "strip set"
  
  // Visual
  diagram: StepDiagram;
  
  // Before/After state
  beforeState: string;         // "You should have all your strips sorted by color"
  afterState: string;          // "You'll have 13 strip sets ready for cutting"
  
  // Proactive guidance
  techniques: string[];        // ["strip piecing", "chain piecing"]
  toolsNeeded: string[];       // ["sewing machine", "iron", "pins"]
  commonMistakes: Mistake[];
  proTips: string[];
  warnings: string[];
  
  // Timing
  estimatedTime?: string;      // "45 minutes"
  isGoodStoppingPoint: boolean;
  stoppingPointReason?: string;
  
  // Measurements in this step (for calculator integration)
  measurements: Measurement[];
}

export interface StepDiagram {
  type: 'strip-arrangement' | 'cutting' | 'piecing' | 'assembly' | 'pressing' | 'custom';
  svgCode: string;             // Generated SVG
  caption: string;             // "Arrange strips in this order"
  altText: string;             // Accessibility
  
  // For interactive diagrams
  elements?: DiagramElement[];
}

export interface DiagramElement {
  id: string;
  type: 'strip' | 'triangle' | 'square' | 'seam' | 'arrow' | 'label';
  color?: string;
  label?: string;
  annotation?: string;         // Tooltip content
}

export interface Mistake {
  mistake: string;             // "Sewing strips in wrong order"
  consequence: string;         // "Your triangles won't have background on edges"
  prevention: string;          // "Lay out all 5 strips before sewing, background on outside"
}

export interface Measurement {
  value: number;
  unit: 'inches' | 'cm';
  original: string;            // "2½\""
  context: string;             // "strip width"
}

export interface AssemblyMap {
  // Track units through the pattern
  units: AssemblyUnit[];
  
  // Visual showing how pattern comes together
  overviewDiagram: string;     // SVG of finished quilt with annotations
  
  // Flow: what becomes what
  flow: AssemblyFlow[];
}

export interface AssemblyUnit {
  name: string;                // "strip set"
  pluralName: string;          // "strip sets"
  quantity: number;            // 13
  createdInStep: number;       // 1
  usedInStep: number;          // 2
  description: string;         // "Five strips sewn together"
}

export interface AssemblyFlow {
  from: string;                // "strip sets"
  to: string;                  // "triangles"
  step: number;                // 2
  ratio: string;               // "Each strip set yields 16 triangles"
}
```

---

## API Endpoints

### 1. Enhanced PDF Parse Endpoint

**File:** `/app/api/parse-pdf/route.ts` (enhance existing)

This becomes a multi-stage pipeline:

```typescript
// POST /api/parse-pdf
// Input: FormData with PDF file
// Output: ComprehendedPattern

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Stage 1: Extract text and structure from PDF
  const extraction = await extractPDFContent(file);
  
  // Stage 2: AI Comprehension Pipeline (the heavy lift)
  const comprehended = await comprehendPattern(extraction);
  
  // Stage 3: Generate step diagrams
  const withDiagrams = await generateStepDiagrams(comprehended);
  
  return Response.json(withDiagrams);
}
```

### 2. Comprehension Pipeline

**File:** `/src/lib/comprehension/pipeline.ts` (new)

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic(); // Uses ANTHROPIC_API_KEY env var

export async function comprehendPattern(extraction: PDFExtraction): Promise<ComprehendedPattern> {
  // Stage 1: Understand the overall pattern
  const patternOverview = await comprehendOverview(extraction.text);
  
  // Stage 2: Extract and comprehend materials
  const materials = await comprehendMaterials(extraction.text, patternOverview);
  
  // Stage 3: Identify and deeply understand each step
  const steps = await comprehendSteps(extraction.text, patternOverview);
  
  // Stage 4: Build assembly map (how units connect)
  const assembly = await buildAssemblyMap(steps, patternOverview);
  
  return {
    id: generateId(),
    uploadedAt: new Date().toISOString(),
    processingTime: 0, // calculated by caller
    metadata: patternOverview,
    materials,
    steps,
    assembly,
    originalText: extraction.text,
  };
}
```

### 3. Individual Comprehension Stages

**File:** `/src/lib/comprehension/stages.ts` (new)

```typescript
// Stage 1: Pattern Overview
export async function comprehendOverview(text: string): Promise<PatternMetadata> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: `You are analyzing a quilt pattern to extract metadata. 
Return JSON only, no markdown.`,
    messages: [{
      role: 'user',
      content: `Analyze this quilt pattern and extract:
- name: The pattern name
- designer: Designer name if present
- finishedSize: {width, height, unit} if mentioned
- difficulty: One of: beginner, confident-beginner, intermediate, advanced
- difficultyExplanation: Why this difficulty level (1 sentence)
- techniquesSummary: Array of main techniques used
- estimatedTime: Rough estimate if you can determine

Pattern text:
${text}

Return as JSON object.`
    }]
  });
  
  return JSON.parse(response.content[0].text);
}

// Stage 2: Materials Comprehension
export async function comprehendMaterials(
  text: string, 
  overview: PatternMetadata
): Promise<ComprehendedMaterial[]> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    system: `You are analyzing a quilt pattern's materials list.
For each material, explain its PURPOSE in the pattern - what it becomes.
Return JSON array only.`,
    messages: [{
      role: 'user',
      content: `Pattern: "${overview.name}"
Techniques: ${overview.techniquesSummary.join(', ')}

Extract materials with:
- item: What it is
- quantity: How much
- purpose: What this becomes in the quilt (be specific)
- substitutionNotes: Alternatives if obvious

Pattern text:
${text}

Return as JSON array.`
    }]
  });
  
  return JSON.parse(response.content[0].text);
}

// Stage 3: Step Comprehension (the most important)
export async function comprehendSteps(
  text: string,
  overview: PatternMetadata
): Promise<ComprehendedStep[]> {
  // First, identify the steps
  const stepsIdentified = await identifySteps(text);
  
  // Then deeply comprehend each one
  const comprehendedSteps = await Promise.all(
    stepsIdentified.map((step, index) => 
      comprehendSingleStep(step, index, overview, stepsIdentified)
    )
  );
  
  return comprehendedSteps;
}

async function comprehendSingleStep(
  step: RawStep,
  index: number,
  overview: PatternMetadata,
  allSteps: RawStep[]
): Promise<ComprehendedStep> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    system: `You are a patient quilting instructor helping a beginner understand a pattern step.
Your goal is CLARITY - rewrite confusing instructions so they're impossible to misunderstand.
Return JSON only.`,
    messages: [{
      role: 'user',
      content: `Pattern: "${overview.name}" (${overview.difficulty})
This is step ${index + 1} of ${allSteps.length}.

Original step title: ${step.title}
Original instruction: ${step.instruction}

Context - steps before this: ${allSteps.slice(0, index).map(s => s.title).join(' → ')}
Context - steps after this: ${allSteps.slice(index + 1).map(s => s.title).join(' → ')}

Provide:
- clarifiedTitle: A more descriptive title
- clarifiedInstruction: Rewritten for absolute clarity, expanded but not padded. Use simple sentences.
- whyThisMatters: Why this step is important in the overall pattern (1-2 sentences)
- whatYouCreate: What physical thing(s) you make in this step
- quantityToMake: Number of units to make (null if not applicable)
- unitName: Name of the unit being made (null if not applicable)
- beforeState: What you should have before starting this step
- afterState: What you'll have when done
- techniques: Array of quilting techniques used
- toolsNeeded: Array of specific tools needed
- commonMistakes: Array of {mistake, consequence, prevention}
- proTips: Array of helpful tips (2-3 max)
- warnings: Array of important warnings (only if critical)
- measurements: Array of {value, unit, original, context} for any measurements
- estimatedTime: Time estimate for this step
- isGoodStoppingPoint: Boolean
- stoppingPointReason: Why it's a good stopping point (if true)

Return as JSON object.`
    }]
  });
  
  const comprehended = JSON.parse(response.content[0].text);
  
  return {
    number: index + 1,
    originalTitle: step.title,
    originalInstruction: step.instruction,
    ...comprehended,
    diagram: { type: 'custom', svgCode: '', caption: '', altText: '' } // Filled in next stage
  };
}
```

### 4. Diagram Generation

**File:** `/src/lib/comprehension/diagrams.ts` (new)

```typescript
export async function generateStepDiagrams(
  pattern: ComprehendedPattern
): Promise<ComprehendedPattern> {
  const stepsWithDiagrams = await Promise.all(
    pattern.steps.map(step => generateDiagramForStep(step, pattern))
  );
  
  return {
    ...pattern,
    steps: stepsWithDiagrams,
  };
}

async function generateDiagramForStep(
  step: ComprehendedStep,
  pattern: ComprehendedPattern
): Promise<ComprehendedStep> {
  // Determine diagram type based on techniques
  const diagramType = determineDiagramType(step);
  
  // Generate SVG based on step content
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: `You generate SVG diagrams for quilting instructions.
Your SVGs should be:
- Simple and clear
- Use a consistent color palette: #264653 (indigo), #e76f51 (persimmon), #84a98c (sage), #e9c46a (clay)
- Include text labels where helpful
- Be viewBox="0 0 300 200" unless shape requires different
- Include a brief caption

Return JSON with: {svgCode: string, caption: string, altText: string}`,
    messages: [{
      role: 'user',
      content: `Generate an SVG diagram for this quilting step:

Step: ${step.clarifiedTitle}
Instruction: ${step.clarifiedInstruction}
What's being made: ${step.whatYouCreate}
Techniques: ${step.techniques.join(', ')}

The diagram should visually show what the quilter needs to do or what the result looks like.
Be specific to THIS step, not generic.

Return JSON only.`
    }]
  });
  
  const diagram = JSON.parse(response.content[0].text);
  
  return {
    ...step,
    diagram: {
      type: diagramType,
      ...diagram,
    },
  };
}

function determineDiagramType(step: ComprehendedStep): StepDiagram['type'] {
  const text = (step.clarifiedInstruction + step.techniques.join(' ')).toLowerCase();
  
  if (text.includes('arrange') || text.includes('strip')) return 'strip-arrangement';
  if (text.includes('cut')) return 'cutting';
  if (text.includes('sew') || text.includes('piece')) return 'piecing';
  if (text.includes('press')) return 'pressing';
  if (text.includes('assemble') || text.includes('join')) return 'assembly';
  return 'custom';
}
```

---

## Frontend Updates

### Updated Reader Page

**File:** `/app/reader/page.tsx`

Update to use ComprehendedPattern type and display AI-generated content:

Key changes:
1. Show `clarifiedInstruction` by default, with "See original" toggle
2. Display step-specific `diagram.svgCode` instead of generic VisualDiagram
3. Show `whatYouCreate` and `quantityToMake` with progress tracking
4. Display `commonMistakes` proactively, not just on click
5. Show `whyThisMatters` as context
6. Use `beforeState` and `afterState` for orientation

### New Component: StepDiagram

**File:** `/src/components/reader/StepDiagram.tsx` (new)

```typescript
interface StepDiagramProps {
  diagram: StepDiagram;
  stepNumber: number;
}

export function StepDiagram({ diagram, stepNumber }: StepDiagramProps) {
  if (!diagram.svgCode) return null;
  
  return (
    <figure style={{
      margin: '1.5rem 0',
      padding: '1rem',
      backgroundColor: theme.colors.washi,
      borderRadius: theme.radius.lg,
      textAlign: 'center',
    }}>
      <div 
        dangerouslySetInnerHTML={{ __html: diagram.svgCode }}
        style={{ maxWidth: '100%' }}
        role="img"
        aria-label={diagram.altText}
      />
      <figcaption style={{
        marginTop: '0.75rem',
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.inkGray,
        fontStyle: 'italic',
      }}>
        {diagram.caption}
      </figcaption>
    </figure>
  );
}
```

### New Component: UnitProgress

**File:** `/src/components/reader/UnitProgress.tsx` (new)

For tracking "Make 13 of these":

```typescript
interface UnitProgressProps {
  unitName: string;
  total: number;
  completed: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function UnitProgress({ unitName, total, completed, onIncrement, onDecrement }: UnitProgressProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: theme.colors.rice,
      borderRadius: theme.radius.md,
      border: theme.borders.hairline,
    }}>
      <span style={{ color: theme.colors.inkGray, fontSize: theme.typography.fontSize.sm }}>
        Progress:
      </span>
      <button onClick={onDecrement} disabled={completed <= 0}>−</button>
      <span style={{ 
        fontWeight: 600, 
        color: completed >= total ? theme.colors.sage : theme.colors.indigo 
      }}>
        {completed} / {total} {unitName}
      </span>
      <button onClick={onIncrement} disabled={completed >= total}>+</button>
      {completed >= total && <span>✓</span>}
    </div>
  );
}
```

---

## Processing Feedback UI

### New Component: ProcessingOverlay

**File:** `/src/components/reader/ProcessingOverlay.tsx` (new)

Shows during the 30-60 second comprehension:

```typescript
interface ProcessingStage {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete';
}

interface ProcessingOverlayProps {
  isVisible: boolean;
  stages: ProcessingStage[];
  patternName?: string;
}

export function ProcessingOverlay({ isVisible, stages, patternName }: ProcessingOverlayProps) {
  if (!isVisible) return null;
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: theme.colors.washi,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      zIndex: 200,
    }}>
      <h2 style={{ 
        color: theme.colors.indigo, 
        marginBottom: '0.5rem',
        fontFamily: theme.typography.fontFamily.display,
      }}>
        Understanding your pattern...
      </h2>
      {patternName && (
        <p style={{ color: theme.colors.inkGray, marginBottom: '2rem' }}>
          {patternName}
        </p>
      )}
      
      <div style={{ width: '100%', maxWidth: '300px' }}>
        {stages.map((stage, idx) => (
          <div key={stage.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 0',
            opacity: stage.status === 'pending' ? 0.5 : 1,
          }}>
            <span style={{ width: '24px', textAlign: 'center' }}>
              {stage.status === 'complete' ? '✓' : 
               stage.status === 'active' ? '◐' : '○'}
            </span>
            <span style={{ 
              color: stage.status === 'complete' ? theme.colors.sage : theme.colors.inkBlack 
            }}>
              {stage.label}
            </span>
          </div>
        ))}
      </div>
      
      <p style={{ 
        marginTop: '2rem', 
        color: theme.colors.inkGray,
        fontSize: theme.typography.fontSize.sm,
        fontStyle: 'italic',
      }}>
        This takes 30-60 seconds — we're doing the hard work so you don't have to.
      </p>
    </div>
  );
}
```

---

## Environment Variables

Ensure `.env.local` has:
```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Existing Files to Update

1. **`/app/api/parse-pdf/route.ts`** - Integrate comprehension pipeline
2. **`/app/reader/page.tsx`** - Use ComprehendedPattern, show AI content
3. **`/src/components/reader/index.ts`** - Export new components

## New Files to Create

1. **`/src/types/pattern.ts`** - Type definitions
2. **`/src/lib/comprehension/pipeline.ts`** - Main orchestrator
3. **`/src/lib/comprehension/stages.ts`** - Individual AI stages
4. **`/src/lib/comprehension/diagrams.ts`** - SVG generation
5. **`/src/components/reader/StepDiagram.tsx`** - Render AI diagrams
6. **`/src/components/reader/UnitProgress.tsx`** - Track quantities
7. **`/src/components/reader/ProcessingOverlay.tsx`** - Loading feedback

---

## Testing

Test with the provided PDF: `Sample_Quilt_Pattern_SKINNY.pdf` (Kite Flight Quilt)

Expected comprehension results:
- 5 steps identified
- Materials: skinny strips, batting, backing, binding, template plastic
- Techniques: strip piecing, bias cutting, on-point assembly
- Step 1 should create diagram showing 5-strip arrangement with colors

---

## Success Criteria

1. Upload → 30-60 sec processing → Comprehended pattern
2. Step instructions are genuinely clearer than original
3. Diagrams are specific to each step, not generic
4. User understands "why" at each step
5. Progress tracking works for quantity-based steps
6. Original text accessible but not default

---

## Notes for Implementation

- Use `claude-haiku-4-5-20251001` for speed/cost (this is many API calls)
- Parallelize where possible (material + step identification can run together)
- Cache comprehended patterns (localStorage for MVP, database later)
- Handle API errors gracefully with retry
- SVG generation may need iteration - start simple
