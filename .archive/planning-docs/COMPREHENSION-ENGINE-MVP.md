# Pattern Comprehension Engine - MVP Implementation Guide
## For Claude Code Execution

**Project:** Quiltographer Pattern Reader
**Location:** `/Users/david/Documents/Claude_Technical/quiltographer/quiltographer-app`
**Scope:** MVP implementation with extensible architecture

---

## Guiding Principle

Build interfaces that last, implement one provider per stage, validate with real PDFs.

Everything built here is production code. We're not building throwaway spikes - we're building the first layer of a provider-agnostic system.

---

## What to Build Now (MVP)

| Component | Build Now | Reason |
|-----------|-----------|--------|
| Provider interfaces | ✅ Yes | Foundation, never changes |
| `GeminiExtractionProvider` | ✅ Yes | Native PDF, cheap, good |
| `OpenAIComprehensionProvider` | ✅ Yes | Reliable JSON mode |
| `TemplateVisualizationProvider` | ✅ Yes | Consistent, free |
| Pipeline orchestration | ✅ Yes | Core logic |
| Diagram templates (5 types) | ✅ Yes | Visual differentiator |
| Progress streaming | ✅ Yes | UX requirement |
| Reader page integration | ✅ Yes | End-to-end validation |

## What to Defer (Future)

| Component | Build Later | When |
|-----------|-------------|------|
| `HunyuanExtractionProvider` | ❌ Defer | When self-hosting for cost |
| `DeepSeekOCRProvider` | ❌ Defer | When comparing quality |
| `PaddleOCRProvider` | ❌ Defer | When comparing quality |
| `OlmOCRProvider` | ❌ Defer | When comparing quality |
| `AnthropicComprehensionProvider` | ❌ Defer | When comparing or as backup |
| `LocalComprehensionProvider` | ❌ Defer | When self-hosting |
| Assembly map generation | ❌ Defer | After steps work well |
| Provider comparison tooling | ❌ Defer | After MVP validated |

---

## File Structure (MVP Only)

```
/src
├── /types
│   └── pattern.ts                    # ✅ All type definitions
│
├── /lib
│   ├── /providers
│   │   ├── types.ts                  # ✅ Shared types
│   │   ├── registry.ts               # ✅ Simplified for MVP
│   │   │
│   │   ├── /extraction
│   │   │   ├── interface.ts          # ✅ ExtractionProvider interface
│   │   │   └── gemini.ts             # ✅ Gemini implementation
│   │   │
│   │   ├── /comprehension
│   │   │   ├── interface.ts          # ✅ ComprehensionProvider interface
│   │   │   └── openai.ts             # ✅ OpenAI implementation
│   │   │
│   │   └── /visualization
│   │       ├── interface.ts          # ✅ VisualizationProvider interface
│   │       └── templates.ts          # ✅ Template implementations
│   │
│   └── /comprehension
│       └── pipeline.ts               # ✅ Orchestration
│
├── /components
│   └── /reader
│       ├── ProcessingOverlay.tsx     # ✅ Progress feedback
│       ├── StepContent.tsx           # ✅ Display comprehended step
│       └── StepDiagram.tsx           # ✅ Render SVG diagrams
│
└── /app
    └── /api
        └── /comprehend-pattern
            └── route.ts              # ✅ API endpoint
```

---

## Step-by-Step Implementation Order

### Step 1: Type Definitions

**File:** `/src/types/pattern.ts`

```typescript
// Core pattern types - these are stable, build them all

export interface ComprehendedPattern {
  id: string;
  uploadedAt: string;
  processingTime: number;
  metadata: PatternMetadata;
  materials: ComprehendedMaterial[];
  steps: ComprehendedStep[];
  originalText: string;
}

export interface PatternMetadata {
  name: string;
  designer?: string;
  finishedSize?: { width: number; height: number; unit: 'inches' | 'cm' };
  difficulty: 'beginner' | 'confident-beginner' | 'intermediate' | 'advanced';
  difficultyExplanation: string;
  techniquesSummary: string[];
  estimatedTime?: string;
}

export interface ComprehendedMaterial {
  item: string;
  quantity: string;
  purpose: string;
  usedInSteps: number[];
  substitutionNotes?: string;
}

export interface ComprehendedStep {
  number: number;
  originalTitle: string;
  originalInstruction: string;
  clarifiedTitle: string;
  clarifiedInstruction: string;
  whyThisMatters: string;
  whatYouCreate: string;
  quantityToMake: number | null;
  unitName: string | null;
  beforeState: string;
  afterState: string;
  techniques: string[];
  toolsNeeded: string[];
  commonMistakes: Mistake[];
  proTips: string[];
  warnings: string[];
  measurements: Measurement[];
  estimatedTime?: string;
  isGoodStoppingPoint: boolean;
  stoppingPointReason?: string;
  diagram: StepDiagram;
}

export interface StepDiagram {
  type: 'strip-arrangement' | 'hst' | 'cutting' | 'pressing' | 'assembly' | 'custom';
  svgCode: string;
  caption: string;
  altText: string;
}

export interface Mistake {
  mistake: string;
  consequence: string;
  prevention: string;
}

export interface Measurement {
  value: number;
  unit: 'inches' | 'cm';
  original: string;
  context: string;
}

// For pipeline progress tracking
export interface PipelineProgress {
  stage: 'extraction' | 'overview' | 'materials' | 'steps' | 'diagrams' | 'complete';
  progress: number;
  message: string;
  currentStep?: number;
  totalSteps?: number;
}
```

---

### Step 2: Provider Interfaces

**File:** `/src/lib/providers/types.ts`

```typescript
export interface ProviderResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  latency: number;
}
```

**File:** `/src/lib/providers/extraction/interface.ts`

```typescript
import { ProviderResult } from '../types';

export interface ExtractedDocument {
  text: string;
  markdown: string;
  structure: {
    title?: string;
    sections: Array<{
      heading?: string;
      content: string;
    }>;
  };
  pageCount: number;
}

export interface ExtractionProvider {
  name: string;
  extract(input: Buffer): Promise<ProviderResult<ExtractedDocument>>;
  isAvailable(): Promise<boolean>;
}
```

**File:** `/src/lib/providers/comprehension/interface.ts`

```typescript
import { ProviderResult } from '../types';
import { ExtractedDocument } from '../extraction/interface';
import { PatternMetadata, ComprehendedStep, ComprehendedMaterial } from '@/types/pattern';

export interface ComprehensionProvider {
  name: string;
  
  comprehendOverview(
    document: ExtractedDocument
  ): Promise<ProviderResult<PatternMetadata>>;
  
  comprehendStep(
    step: { title: string; instruction: string },
    context: {
      patternName: string;
      stepNumber: number;
      totalSteps: number;
      previousSteps: string[];
      nextSteps: string[];
    }
  ): Promise<ProviderResult<ComprehendedStepData>>;
  
  comprehendMaterials(
    document: ExtractedDocument,
    overview: PatternMetadata
  ): Promise<ProviderResult<ComprehendedMaterial[]>>;
  
  isAvailable(): Promise<boolean>;
}

// Partial step data (before adding number, original text, diagram)
export type ComprehendedStepData = Omit<
  ComprehendedStep, 
  'number' | 'originalTitle' | 'originalInstruction' | 'diagram'
> & {
  diagramType?: StepDiagram['type'];
  diagramParams?: Record<string, unknown>;
};
```

**File:** `/src/lib/providers/visualization/interface.ts`

```typescript
import { ProviderResult } from '../types';
import { StepDiagram, ComprehendedStep } from '@/types/pattern';

export interface VisualizationProvider {
  name: string;
  generateDiagram(step: ComprehendedStep): Promise<ProviderResult<StepDiagram>>;
  isAvailable(): Promise<boolean>;
}
```

---

### Step 3: Gemini Extraction Provider

**File:** `/src/lib/providers/extraction/gemini.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExtractionProvider, ExtractedDocument } from './interface';
import { ProviderResult } from '../types';

export class GeminiExtractionProvider implements ExtractionProvider {
  name = 'gemini';
  private client: GoogleGenerativeAI;
  
  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }
  
  async extract(input: Buffer): Promise<ProviderResult<ExtractedDocument>> {
    const startTime = Date.now();
    
    try {
      const model = this.client.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp' 
      });
      
      const prompt = `You are extracting content from a quilting pattern PDF.

Extract ALL text content, preserving:
- Section headers and structure
- All measurements (keep exact format like 2½")
- Materials lists
- Step-by-step instructions
- Any tips or notes

Return as JSON:
{
  "text": "full plain text",
  "markdown": "formatted with ## headers, bullet points, etc.",
  "structure": {
    "title": "pattern name",
    "sections": [
      { "heading": "Materials", "content": "..." },
      { "heading": "Step 1", "content": "..." }
    ]
  },
  "pageCount": 1
}

Be thorough. Every measurement matters. Every instruction matters.`;

      const result = await model.generateContent([
        { text: prompt },
        { 
          inlineData: { 
            mimeType: 'application/pdf', 
            data: input.toString('base64')
          }
        }
      ]);
      
      const responseText = result.response.text();
      
      // Clean markdown code blocks if present
      const jsonStr = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const data = JSON.parse(jsonStr);
      
      return {
        success: true,
        data,
        latency: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Extraction failed',
        latency: Date.now() - startTime,
      };
    }
  }
  
  async isAvailable(): Promise<boolean> {
    return !!process.env.GOOGLE_AI_API_KEY;
  }
}
```

**Required package:** `npm install @google/generative-ai`

---

### Step 4: OpenAI Comprehension Provider

**File:** `/src/lib/providers/comprehension/openai.ts`

```typescript
import OpenAI from 'openai';
import { ComprehensionProvider, ComprehendedStepData } from './interface';
import { ProviderResult } from '../types';
import { ExtractedDocument } from '../extraction/interface';
import { PatternMetadata, ComprehendedMaterial } from '@/types/pattern';

export class OpenAIComprehensionProvider implements ComprehensionProvider {
  name = 'openai';
  private client: OpenAI;
  
  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }
  
  async comprehendOverview(
    document: ExtractedDocument
  ): Promise<ProviderResult<PatternMetadata>> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You analyze quilt patterns to extract metadata. Return JSON:
{
  "name": "pattern name",
  "designer": "designer name or null",
  "finishedSize": { "width": number, "height": number, "unit": "inches" } or null,
  "difficulty": "beginner" | "confident-beginner" | "intermediate" | "advanced",
  "difficultyExplanation": "one sentence explaining why",
  "techniquesSummary": ["technique1", "technique2"],
  "estimatedTime": "X hours" or null
}`
          },
          {
            role: 'user',
            content: `Analyze this quilt pattern:\n\n${document.markdown}`
          }
        ],
        temperature: 0.3,
      });
      
      const data = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        success: true,
        data,
        latency: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Overview failed',
        latency: Date.now() - startTime,
      };
    }
  }
  
  async comprehendStep(
    step: { title: string; instruction: string },
    context: {
      patternName: string;
      stepNumber: number;
      totalSteps: number;
      previousSteps: string[];
      nextSteps: string[];
    }
  ): Promise<ProviderResult<ComprehendedStepData>> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are a patient quilting instructor helping a beginner understand a pattern step.

Your goal is CLARITY. Rewrite confusing instructions so they're impossible to misunderstand.
Use simple sentences. Expand abbreviations. Explain the "why" behind each action.

Return JSON:
{
  "clarifiedTitle": "more descriptive title",
  "clarifiedInstruction": "rewritten for absolute clarity - expanded but not padded",
  "whyThisMatters": "why this step matters in the overall pattern (1-2 sentences)",
  "whatYouCreate": "physical thing(s) you make in this step",
  "quantityToMake": number or null,
  "unitName": "name of the unit being made" or null,
  "beforeState": "what you should have before starting this step",
  "afterState": "what you'll have when this step is complete",
  "techniques": ["technique1", "technique2"],
  "toolsNeeded": ["tool1", "tool2"],
  "commonMistakes": [
    {"mistake": "what people do wrong", "consequence": "what goes wrong", "prevention": "how to avoid it"}
  ],
  "proTips": ["helpful tip 1", "helpful tip 2"],
  "warnings": ["critical warning if any"],
  "measurements": [
    {"value": 2.5, "unit": "inches", "original": "2½\"", "context": "strip width"}
  ],
  "estimatedTime": "X minutes",
  "isGoodStoppingPoint": true/false,
  "stoppingPointReason": "why this is a good place to stop" or null,
  "diagramType": "strip-arrangement" | "hst" | "cutting" | "pressing" | "assembly" | "custom",
  "diagramParams": {
    // Parameters specific to the diagram type
    // For strip-arrangement: { "strips": [{ "color": "#xxx", "label": "background" }] }
    // For hst: { "color1": "#xxx", "color2": "#xxx" }
    // For cutting: { "shape": "strip", "width": "2½\"", "quantity": 5 }
    // For pressing: { "direction": "toward-dark" }
  }
}`
          },
          {
            role: 'user',
            content: `Pattern: "${context.patternName}"
Step ${context.stepNumber} of ${context.totalSteps}

Original title: ${step.title}
Original instruction: ${step.instruction}

Steps before this: ${context.previousSteps.join(' → ') || 'This is the first step'}
Steps after this: ${context.nextSteps.join(' → ') || 'This is the final step'}`
          }
        ],
        temperature: 0.3,
      });
      
      const data = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        success: true,
        data,
        latency: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Step comprehension failed',
        latency: Date.now() - startTime,
      };
    }
  }
  
  async comprehendMaterials(
    document: ExtractedDocument,
    overview: PatternMetadata
  ): Promise<ProviderResult<ComprehendedMaterial[]>> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Extract materials from a quilt pattern. For each material, explain its PURPOSE - what it becomes in the finished quilt.

Return JSON:
{
  "materials": [
    {
      "item": "Kona Cotton Skinny Strips",
      "quantity": "1 pack",
      "purpose": "Creates the colored strips in your blocks",
      "usedInSteps": [1, 2],
      "substitutionNotes": "Any 2.5\" strip set will work"
    }
  ]
}`
          },
          {
            role: 'user',
            content: `Pattern: "${overview.name}"
Techniques: ${overview.techniquesSummary.join(', ')}

Document:
${document.markdown}`
          }
        ],
        temperature: 0.3,
      });
      
      const data = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        success: true,
        data: data.materials || [],
        latency: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Materials failed',
        latency: Date.now() - startTime,
      };
    }
  }
  
  async isAvailable(): Promise<boolean> {
    return !!process.env.OPENAI_API_KEY;
  }
}
```

**Required package:** `npm install openai`

---

### Step 5: Template Visualization Provider

**File:** `/src/lib/providers/visualization/templates.ts`

```typescript
import { VisualizationProvider } from './interface';
import { ProviderResult } from '../types';
import { StepDiagram, ComprehendedStep } from '@/types/pattern';

// Japanese-inspired color palette
const COLORS = {
  indigo: '#264653',
  persimmon: '#e76f51',
  sage: '#84a98c',
  clay: '#e9c46a',
  washi: '#faf6f1',
  rice: '#f5f5f0',
  inkGray: '#5c5c5c',
};

function isLightColor(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

// Template generators
const templates: Record<string, (params: any) => string> = {
  
  'strip-arrangement': (params: {
    strips?: Array<{ color: string; label: string }>;
  }) => {
    const strips = params.strips || [
      { color: COLORS.rice, label: 'background' },
      { color: COLORS.clay, label: 'light' },
      { color: COLORS.persimmon, label: 'medium' },
      { color: COLORS.indigo, label: 'dark' },
      { color: COLORS.rice, label: 'background' },
    ];
    const stripHeight = 28;
    const height = strips.length * stripHeight + 50;
    
    return `<svg viewBox="0 0 300 ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${COLORS.washi}" rx="8"/>
      ${strips.map((strip, i) => {
        const y = 15 + i * stripHeight;
        const textColor = isLightColor(strip.color) ? COLORS.indigo : '#fff';
        return `
          <rect x="15" y="${y}" width="270" height="${stripHeight - 3}" 
                fill="${strip.color}" stroke="${COLORS.indigo}" stroke-width="1" rx="3"/>
          <text x="150" y="${y + stripHeight/2 + 1}" text-anchor="middle" 
                font-family="system-ui" font-size="11" fill="${textColor}">
            ${strip.label}
          </text>
        `;
      }).join('')}
      <text x="150" y="${height - 12}" text-anchor="middle" 
            font-family="system-ui" font-size="11" fill="${COLORS.inkGray}" font-style="italic">
        Sew strips in this order ↓
      </text>
    </svg>`;
  },
  
  'hst': (params: {
    color1?: string;
    color2?: string;
    label1?: string;
    label2?: string;
  }) => {
    const { 
      color1 = COLORS.rice, 
      color2 = COLORS.indigo,
      label1 = 'light',
      label2 = 'dark'
    } = params;
    
    return `<svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${COLORS.washi}" rx="8"/>
      <rect x="30" y="25" width="100" height="100" fill="none" stroke="${COLORS.indigo}" stroke-width="1"/>
      <polygon points="30,25 130,25 30,125" fill="${color1}" stroke="${COLORS.indigo}" stroke-width="1"/>
      <polygon points="130,25 130,125 30,125" fill="${color2}" stroke="${COLORS.indigo}" stroke-width="1"/>
      <line x1="30" y1="125" x2="130" y2="25" stroke="${COLORS.indigo}" stroke-width="2" stroke-dasharray="4,2"/>
      <text x="55" y="65" font-family="system-ui" font-size="10" fill="${isLightColor(color1) ? COLORS.indigo : '#fff'}">${label1}</text>
      <text x="95" y="105" font-family="system-ui" font-size="10" fill="${isLightColor(color2) ? COLORS.indigo : '#fff'}">${label2}</text>
      <text x="80" y="155" text-anchor="middle" font-family="system-ui" font-size="11" fill="${COLORS.inkGray}">
        Half Square Triangle
      </text>
      <text x="80" y="170" text-anchor="middle" font-family="system-ui" font-size="10" fill="${COLORS.inkGray}" font-style="italic">
        Sew on diagonal, trim
      </text>
    </svg>`;
  },
  
  'cutting': (params: {
    shape?: 'strip' | 'square' | 'triangle' | 'rectangle';
    width?: string;
    height?: string;
    quantity?: number;
  }) => {
    const { shape = 'strip', width = '2½"', height, quantity } = params;
    
    let shapesSvg = '';
    if (shape === 'strip') {
      shapesSvg = `
        <rect x="30" y="50" width="240" height="35" fill="${COLORS.clay}" stroke="${COLORS.indigo}" stroke-width="1" rx="2"/>
        <line x1="30" y1="67" x2="270" y2="67" stroke="${COLORS.indigo}" stroke-width="1" stroke-dasharray="8,4"/>
        <text x="150" y="72" text-anchor="middle" font-family="system-ui" font-size="12" fill="${COLORS.indigo}">${width} wide</text>
      `;
    } else if (shape === 'square') {
      shapesSvg = `
        <rect x="100" y="35" width="80" height="80" fill="${COLORS.sage}" stroke="${COLORS.indigo}" stroke-width="1"/>
        <text x="140" y="80" text-anchor="middle" font-family="system-ui" font-size="14" fill="#fff">${width}</text>
      `;
    } else if (shape === 'triangle') {
      shapesSvg = `
        <polygon points="150,30 210,110 90,110" fill="${COLORS.persimmon}" stroke="${COLORS.indigo}" stroke-width="1"/>
        <text x="150" y="90" text-anchor="middle" font-family="system-ui" font-size="12" fill="#fff">${width}</text>
      `;
    }
    
    const label = quantity 
      ? `Cut ${quantity} ${shape}${quantity > 1 ? 's' : ''} at ${width}${height ? ` × ${height}` : ''}`
      : `Cut ${shape}s at ${width}`;
    
    return `<svg viewBox="0 0 300 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${COLORS.washi}" rx="8"/>
      ${shapesSvg}
      <text x="150" y="125" text-anchor="middle" font-family="system-ui" font-size="11" fill="${COLORS.inkGray}">
        ${label}
      </text>
    </svg>`;
  },
  
  'pressing': (params: {
    direction?: 'left' | 'right' | 'open' | 'toward-dark';
  }) => {
    const { direction = 'toward-dark' } = params;
    
    let arrowPath = '';
    let label = '';
    
    if (direction === 'open') {
      arrowPath = 'M100,60 L80,45 M100,60 L80,75 M140,60 L160,45 M140,60 L160,75';
      label = 'Press seams open';
    } else if (direction === 'left') {
      arrowPath = 'M160,60 L100,60 M110,50 L100,60 L110,70';
      label = 'Press seams to the left';
    } else if (direction === 'right') {
      arrowPath = 'M80,60 L140,60 M130,50 L140,60 L130,70';
      label = 'Press seams to the right';
    } else {
      arrowPath = 'M80,60 L140,60 M130,50 L140,60 L130,70';
      label = 'Press toward darker fabric';
    }
    
    return `<svg viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${COLORS.washi}" rx="8"/>
      <rect x="40" y="35" width="160" height="50" fill="${COLORS.rice}" stroke="${COLORS.indigo}" stroke-width="1" rx="2"/>
      <rect x="40" y="35" width="80" height="50" fill="${COLORS.clay}" stroke="${COLORS.indigo}" stroke-width="1"/>
      <rect x="120" y="35" width="80" height="50" fill="${COLORS.indigo}" stroke="${COLORS.indigo}" stroke-width="1"/>
      <line x1="120" y1="35" x2="120" y2="85" stroke="${COLORS.persimmon}" stroke-width="3"/>
      <path d="${arrowPath}" stroke="${COLORS.persimmon}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <text x="120" y="105" text-anchor="middle" font-family="system-ui" font-size="11" fill="${COLORS.inkGray}">
        ${label}
      </text>
    </svg>`;
  },
  
  'assembly': (params: {
    units?: Array<{ label: string; color: string }>;
    layout?: 'row' | 'column' | 'grid';
    gridCols?: number;
  }) => {
    const { 
      units = [
        { label: 'A', color: COLORS.sage },
        { label: 'B', color: COLORS.clay },
        { label: 'A', color: COLORS.sage },
      ],
      layout = 'row',
      gridCols = 3
    } = params;
    
    const unitSize = 45;
    const gap = 8;
    
    const cols = layout === 'grid' ? gridCols : (layout === 'row' ? units.length : 1);
    const rows = layout === 'grid' ? Math.ceil(units.length / gridCols) : (layout === 'column' ? units.length : 1);
    const width = 40 + cols * (unitSize + gap);
    const height = 60 + rows * (unitSize + gap);
    
    const unitsSvg = units.map((unit, i) => {
      const col = layout === 'grid' ? i % gridCols : (layout === 'row' ? i : 0);
      const row = layout === 'grid' ? Math.floor(i / gridCols) : (layout === 'column' ? i : 0);
      const x = 20 + col * (unitSize + gap);
      const y = 20 + row * (unitSize + gap);
      const textColor = isLightColor(unit.color) ? COLORS.indigo : '#fff';
      
      return `
        <rect x="${x}" y="${y}" width="${unitSize}" height="${unitSize}" 
              fill="${unit.color}" stroke="${COLORS.indigo}" stroke-width="1" rx="4"/>
        <text x="${x + unitSize/2}" y="${y + unitSize/2 + 4}" text-anchor="middle" 
              font-family="system-ui" font-size="12" font-weight="600" fill="${textColor}">
          ${unit.label}
        </text>
      `;
    }).join('');
    
    return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${COLORS.washi}" rx="8"/>
      ${unitsSvg}
      <text x="${width/2}" y="${height - 12}" text-anchor="middle" 
            font-family="system-ui" font-size="10" fill="${COLORS.inkGray}" font-style="italic">
        Arrange and sew together
      </text>
    </svg>`;
  },
  
  'custom': () => {
    // Empty placeholder - no diagram available
    return '';
  }
};

export class TemplateVisualizationProvider implements VisualizationProvider {
  name = 'templates';
  
  async generateDiagram(
    step: ComprehendedStep & { diagramType?: string; diagramParams?: Record<string, unknown> }
  ): Promise<ProviderResult<StepDiagram>> {
    const startTime = Date.now();
    
    const diagramType = step.diagramType || this.inferDiagramType(step);
    const diagramParams = step.diagramParams || {};
    
    const template = templates[diagramType];
    if (!template) {
      return {
        success: true,
        data: { type: 'custom', svgCode: '', caption: '', altText: step.clarifiedTitle },
        latency: Date.now() - startTime,
      };
    }
    
    try {
      const svgCode = template(diagramParams);
      
      return {
        success: true,
        data: {
          type: diagramType as StepDiagram['type'],
          svgCode,
          caption: this.generateCaption(diagramType, step),
          altText: `Diagram: ${step.whatYouCreate || step.clarifiedTitle}`,
        },
        latency: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Diagram generation failed',
        latency: Date.now() - startTime,
      };
    }
  }
  
  private inferDiagramType(step: ComprehendedStep): string {
    const text = `${step.clarifiedInstruction} ${step.techniques.join(' ')}`.toLowerCase();
    
    if (text.includes('strip') && (text.includes('arrange') || text.includes('sew'))) return 'strip-arrangement';
    if (text.includes('half square') || text.includes('hst')) return 'hst';
    if (text.includes('cut')) return 'cutting';
    if (text.includes('press')) return 'pressing';
    if (text.includes('assemble') || text.includes('join blocks')) return 'assembly';
    return 'custom';
  }
  
  private generateCaption(type: string, step: ComprehendedStep): string {
    switch (type) {
      case 'strip-arrangement': return 'Arrange and sew strips in this order';
      case 'hst': return 'Half Square Triangle construction';
      case 'cutting': return 'Cutting diagram';
      case 'pressing': return 'Press seams as shown';
      case 'assembly': return 'Assembly layout';
      default: return step.clarifiedTitle;
    }
  }
  
  async isAvailable(): Promise<boolean> {
    return true; // Templates are always available
  }
}
```

---

### Step 6: Pipeline Orchestration

**File:** `/src/lib/comprehension/pipeline.ts`

```typescript
import { GeminiExtractionProvider } from '../providers/extraction/gemini';
import { OpenAIComprehensionProvider } from '../providers/comprehension/openai';
import { TemplateVisualizationProvider } from '../providers/visualization/templates';
import { ComprehendedPattern, PipelineProgress } from '@/types/pattern';

export async function comprehendPattern(
  pdfBuffer: Buffer,
  onProgress?: (progress: PipelineProgress) => void
): Promise<ComprehendedPattern> {
  const startTime = Date.now();
  
  // Initialize providers
  const extractionProvider = new GeminiExtractionProvider(
    process.env.GOOGLE_AI_API_KEY!
  );
  const comprehensionProvider = new OpenAIComprehensionProvider(
    process.env.OPENAI_API_KEY!
  );
  const visualizationProvider = new TemplateVisualizationProvider();
  
  // Check availability
  if (!await extractionProvider.isAvailable()) {
    throw new Error('GOOGLE_AI_API_KEY not configured');
  }
  if (!await comprehensionProvider.isAvailable()) {
    throw new Error('OPENAI_API_KEY not configured');
  }
  
  // Stage 1: Extract
  onProgress?.({ stage: 'extraction', progress: 5, message: 'Reading your pattern...' });
  
  const extraction = await extractionProvider.extract(pdfBuffer);
  if (!extraction.success || !extraction.data) {
    throw new Error(`Extraction failed: ${extraction.error}`);
  }
  
  // Stage 2: Overview
  onProgress?.({ stage: 'overview', progress: 15, message: 'Understanding the pattern...' });
  
  const overview = await comprehensionProvider.comprehendOverview(extraction.data);
  if (!overview.success || !overview.data) {
    throw new Error(`Overview failed: ${overview.error}`);
  }
  
  // Stage 3: Materials
  onProgress?.({ stage: 'materials', progress: 25, message: 'Analyzing materials...' });
  
  const materials = await comprehensionProvider.comprehendMaterials(extraction.data, overview.data);
  
  // Stage 4: Steps
  const rawSteps = identifySteps(extraction.data.markdown);
  const totalSteps = rawSteps.length;
  
  if (totalSteps === 0) {
    throw new Error('No steps found in pattern');
  }
  
  const comprehendedSteps = [];
  
  for (let i = 0; i < rawSteps.length; i++) {
    onProgress?.({
      stage: 'steps',
      progress: 30 + (i / totalSteps) * 40,
      message: `Understanding step ${i + 1} of ${totalSteps}...`,
      currentStep: i + 1,
      totalSteps,
    });
    
    const stepResult = await comprehensionProvider.comprehendStep(
      rawSteps[i],
      {
        patternName: overview.data.name,
        stepNumber: i + 1,
        totalSteps,
        previousSteps: rawSteps.slice(0, i).map(s => s.title),
        nextSteps: rawSteps.slice(i + 1).map(s => s.title),
      }
    );
    
    if (stepResult.success && stepResult.data) {
      comprehendedSteps.push({
        number: i + 1,
        originalTitle: rawSteps[i].title,
        originalInstruction: rawSteps[i].instruction,
        ...stepResult.data,
        diagram: { type: 'custom' as const, svgCode: '', caption: '', altText: '' },
      });
    }
  }
  
  // Stage 5: Diagrams
  for (let i = 0; i < comprehendedSteps.length; i++) {
    onProgress?.({
      stage: 'diagrams',
      progress: 75 + (i / comprehendedSteps.length) * 20,
      message: `Creating visual for step ${i + 1}...`,
    });
    
    const diagramResult = await visualizationProvider.generateDiagram(comprehendedSteps[i] as any);
    if (diagramResult.success && diagramResult.data) {
      comprehendedSteps[i].diagram = diagramResult.data;
    }
  }
  
  // Complete
  onProgress?.({ stage: 'complete', progress: 100, message: 'Ready!' });
  
  return {
    id: `pattern_${Date.now()}`,
    uploadedAt: new Date().toISOString(),
    processingTime: Date.now() - startTime,
    metadata: overview.data,
    materials: materials.data || [],
    steps: comprehendedSteps,
    originalText: extraction.data.text,
  };
}

function identifySteps(markdown: string): Array<{ title: string; instruction: string }> {
  const steps: Array<{ title: string; instruction: string }> = [];
  
  // Split by common step patterns
  const stepPatterns = [
    /^##\s*(?:Step\s*)?(\d+)[.:\s]*(.*)$/gim,
    /^(?:Step\s*)?(\d+)[.:]\s*(.*)$/gim,
  ];
  
  // Try to find sections that look like steps
  const sections = markdown.split(/(?=^##\s|^Step\s+\d|^\d+[.:]\s)/im);
  
  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;
    
    const lines = trimmed.split('\n');
    const firstLine = lines[0];
    
    // Check if this looks like a step
    const stepMatch = firstLine.match(/^(?:##\s*)?(?:Step\s*)?(\d+)[.:)]*\s*(.*)$/i);
    
    if (stepMatch) {
      const title = stepMatch[2].trim() || `Step ${stepMatch[1]}`;
      const instruction = lines.slice(1).join('\n').trim();
      
      if (instruction) {
        steps.push({ title, instruction });
      }
    }
  }
  
  // If no numbered steps found, try splitting by headers
  if (steps.length === 0) {
    const headerSections = markdown.split(/(?=^##\s)/m);
    let stepNum = 1;
    
    for (const section of headerSections) {
      const trimmed = section.trim();
      if (!trimmed) continue;
      
      const lines = trimmed.split('\n');
      const title = lines[0].replace(/^##\s*/, '').trim();
      const instruction = lines.slice(1).join('\n').trim();
      
      // Skip non-instructional sections
      if (title.toLowerCase().includes('material') || 
          title.toLowerCase().includes('supply') ||
          title.toLowerCase().includes('note')) {
        continue;
      }
      
      if (instruction && instruction.length > 50) {
        steps.push({ title: title || `Step ${stepNum}`, instruction });
        stepNum++;
      }
    }
  }
  
  return steps;
}
```

---

### Step 7: API Endpoint

**File:** `/app/api/comprehend-pattern/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { comprehendPattern } from '@/lib/comprehension/pipeline';

export const maxDuration = 60; // Allow up to 60 seconds

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Run comprehension (progress streaming would require SSE, keeping simple for MVP)
    const pattern = await comprehendPattern(buffer);
    
    return NextResponse.json(pattern);
    
  } catch (error) {
    console.error('Comprehension error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Comprehension failed' },
      { status: 500 }
    );
  }
}
```

---

### Step 8: Install Dependencies

```bash
cd /Users/david/Documents/Claude_Technical/quiltographer/quiltographer-app

npm install @google/generative-ai openai
```

---

### Step 9: Environment Variables

Add to `.env.local`:

```bash
# Required for MVP
GOOGLE_AI_API_KEY=your_google_ai_key
OPENAI_API_KEY=your_openai_key
```

---

## Testing Checklist

After implementation, test with the Kite Flight Quilt PDF:

1. **Extraction works:** Gemini extracts readable text with measurements intact
2. **Steps identified:** Pipeline finds 5-6 distinct steps
3. **Clarification helps:** Rewritten instructions are genuinely clearer
4. **Diagrams render:** SVG templates produce visible diagrams
5. **Timing acceptable:** Total processing < 60 seconds
6. **Cost reasonable:** Check API costs in dashboards

---

## What Success Looks Like

Original PDF step:
> "Arrange your strips as shown: 2 background strips, 1 light, 1 medium and 1 dark strip. Sew together."

Comprehended output:
```json
{
  "clarifiedTitle": "Build Your Strip Set Units",
  "clarifiedInstruction": "You'll create a strip set by sewing 5 fabric strips together in a specific order. Lay out your strips from top to bottom: background, light, medium, dark, background. The background strips go on the outside edges. Sew the strips together with a ¼\" seam allowance, pressing seams as you go.",
  "whyThisMatters": "These strip sets become the fabric you'll cut triangles from. The order matters because your triangles need background fabric on their outer edges.",
  "whatYouCreate": "13 identical strip set units",
  "quantityToMake": 13,
  "diagram": {
    "type": "strip-arrangement",
    "svgCode": "<svg>...</svg>"
  }
}
```

If THAT transformation happens reliably, we have a product.

---

## After MVP Validation

If it works:
1. Add more extraction providers (HunyuanOCR, DeepSeek)
2. Add Anthropic as comprehension backup
3. Build proper progress streaming (SSE)
4. Add caching layer
5. Improve step identification heuristics
6. Expand diagram templates

If it doesn't work:
- Identify which stage fails
- Iterate on prompts
- Try different models
- Adjust expectations

---

## Commands for Claude Code

```
Read /Users/david/Documents/Claude_Technical/quiltographer/COMPREHENSION-ENGINE-MVP.md

Implement the MVP comprehension engine following the step-by-step guide.
Start with Step 1 (types), then work through each step.
Install required packages.
Test that the build compiles.
```
