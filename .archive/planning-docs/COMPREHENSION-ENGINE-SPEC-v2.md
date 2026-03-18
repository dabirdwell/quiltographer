# Pattern Comprehension Engine - Technical Specification v2
## Model-Agnostic Architecture with Provider Abstraction

**Project:** Quiltographer Pattern Reader
**Location:** `/Users/david/Documents/Claude_Technical/quiltographer/quiltographer-app`
**Updated:** December 2025

---

## The Model Landscape (December 2025)

### OCR/Document Understanding Models

| Model | Params | Accuracy | Speed | Languages | Notes |
|-------|--------|----------|-------|-----------|-------|
| **HunyuanOCR** | 1B | 94.1 OmniDoc | Fast | 100+ | SOTA sub-3B, end-to-end |
| **PaddleOCR-VL** | 0.9B | 79.0 | 2 pg/s | 109 | Smallest capable VLM |
| **DeepSeek-OCR** | 3B | 75.7 | 4.65 pg/s | 100 | Token compression focus |
| **dots.ocr** | 3B | 79.1 | 2 pg/s | Multi | Good balance |
| **OlmOCR-2** | 7B | 82.4 | 1.78 pg/s | EN only | SOTA English |
| **Chandra** | 8B | 83.1 | 1.29 pg/s | 40+ | Highest accuracy |
| **LightOn OCR** | 1B | 76.1 | 5.55 pg/s | Multi | Fastest |
| **Granite-Docling** | 258M | Good | Very fast | Multi | Smallest, DocTags |

### General VLMs with Strong Document Understanding

| Model | Params | Notes |
|-------|--------|-------|
| **Qwen2.5-VL** | 3B-72B | 75% accuracy = GPT-4o level, excellent |
| **Gemini 2.0 Flash** | - | Native PDF input, cheap API |
| **GPT-4o-mini** | - | Reliable JSON mode |
| **GLM-4.5V** | 12B active | Strong document screening |
| **DeepSeek-VL2** | 4.5B active | MoE, efficient |

### Cost per Million Pages (Self-hosted on H100)

- LightOn OCR: ~$141
- DeepSeek-OCR: ~$178  
- OlmOCR-2: ~$178
- PaddleOCR-VL: ~$150
- Chandra: ~$697
- **Cloud APIs: ~$1,500+**

---

## Architecture: Provider Abstraction Layer

The key insight: **separate the pipeline stages from the model implementations**.

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPREHENSION PIPELINE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  STAGE 1    │    │  STAGE 2    │    │  STAGE 3    │         │
│  │  Extract    │───▶│  Comprehend │───▶│  Visualize  │         │
│  │             │    │             │    │             │         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  Provider   │    │  Provider   │    │  Provider   │         │
│  │  Interface  │    │  Interface  │    │  Interface  │         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│         │                  │                  │                 │
│    ┌────┴────┐        ┌────┴────┐        ┌────┴────┐           │
│    ▼         ▼        ▼         ▼        ▼         ▼           │
│ Gemini  HunyuanOCR  GPT-4o   Claude   Templates  Claude        │
│ Flash   DeepSeek    mini    Haiku    + params   Sonnet         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
/src
├── /lib
│   ├── /providers                    # Model provider implementations
│   │   ├── types.ts                  # Shared interfaces
│   │   ├── registry.ts               # Provider registry
│   │   │
│   │   ├── /extraction               # Stage 1: Document extraction
│   │   │   ├── interface.ts
│   │   │   ├── gemini.ts
│   │   │   ├── hunyuan.ts
│   │   │   ├── deepseek-ocr.ts
│   │   │   ├── paddleocr.ts
│   │   │   └── olmocr.ts
│   │   │
│   │   ├── /comprehension            # Stage 2: Pattern understanding
│   │   │   ├── interface.ts
│   │   │   ├── openai.ts
│   │   │   ├── anthropic.ts
│   │   │   ├── gemini.ts
│   │   │   └── local.ts              # Ollama/local models
│   │   │
│   │   └── /visualization            # Stage 3: Diagram generation
│   │       ├── interface.ts
│   │       ├── templates.ts          # Template-based (preferred)
│   │       ├── anthropic.ts          # Claude for complex cases
│   │       └── openai.ts
│   │
│   ├── /comprehension                # Pipeline orchestration
│   │   ├── pipeline.ts
│   │   ├── stages.ts
│   │   └── cache.ts
│   │
│   └── /config
│       └── models.ts                 # Model configuration
│
├── /types
│   └── pattern.ts                    # Pattern data structures
│
└── /components
    └── /reader
        ├── StepDiagram.tsx
        ├── UnitProgress.tsx
        └── ProcessingOverlay.tsx
```

---

## Provider Interfaces

### `/src/lib/providers/types.ts`

```typescript
// Common types across all providers
export interface ProviderConfig {
  provider: string;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  options?: Record<string, unknown>;
}

export interface ProviderResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    cost: number;
  };
  latency: number;
}
```

### `/src/lib/providers/extraction/interface.ts`

```typescript
import { ProviderResult } from '../types';

// What we get from document extraction
export interface ExtractedDocument {
  // Raw text preserving structure
  text: string;
  
  // Markdown-formatted content
  markdown: string;
  
  // Detected structure
  structure: {
    title?: string;
    sections: Array<{
      heading?: string;
      content: string;
      type: 'text' | 'table' | 'list' | 'image';
    }>;
    tables: Array<{
      html: string;
      caption?: string;
    }>;
  };
  
  // Metadata
  pageCount: number;
  hasImages: boolean;
  detectedLanguage: string;
}

// Interface all extraction providers must implement
export interface ExtractionProvider {
  name: string;
  
  // Extract content from PDF/image
  extract(
    input: Buffer | string,  // Buffer for file, string for URL
    options?: {
      outputFormat?: 'markdown' | 'html' | 'text';
      preserveTables?: boolean;
      extractImages?: boolean;
    }
  ): Promise<ProviderResult<ExtractedDocument>>;
  
  // Check if provider is available
  isAvailable(): Promise<boolean>;
}
```

### `/src/lib/providers/comprehension/interface.ts`

```typescript
import { ProviderResult } from '../types';
import { ExtractedDocument } from '../extraction/interface';
import { ComprehendedPattern, PatternMetadata, ComprehendedStep } from '@/types/pattern';

// Interface all comprehension providers must implement
export interface ComprehensionProvider {
  name: string;
  
  // Understand the overall pattern
  comprehendOverview(
    document: ExtractedDocument
  ): Promise<ProviderResult<PatternMetadata>>;
  
  // Comprehend a single step deeply
  comprehendStep(
    step: { title: string; instruction: string },
    context: {
      patternName: string;
      stepNumber: number;
      totalSteps: number;
      previousSteps: string[];
      nextSteps: string[];
    }
  ): Promise<ProviderResult<Omit<ComprehendedStep, 'number' | 'originalTitle' | 'originalInstruction' | 'diagram'>>>;
  
  // Extract materials with purpose
  comprehendMaterials(
    document: ExtractedDocument,
    overview: PatternMetadata
  ): Promise<ProviderResult<ComprehendedPattern['materials']>>;
  
  // Check if provider is available
  isAvailable(): Promise<boolean>;
}
```

### `/src/lib/providers/visualization/interface.ts`

```typescript
import { ProviderResult } from '../types';
import { StepDiagram, ComprehendedStep } from '@/types/pattern';

// Interface for visualization providers
export interface VisualizationProvider {
  name: string;
  
  // Generate diagram for a step
  generateDiagram(
    step: ComprehendedStep,
    options?: {
      style?: 'minimal' | 'detailed';
      colorPalette?: string[];
    }
  ): Promise<ProviderResult<StepDiagram>>;
  
  // Check if provider is available
  isAvailable(): Promise<boolean>;
}

// Template-based visualization (preferred for consistency)
export interface DiagramTemplate {
  type: string;
  generate: (params: Record<string, unknown>) => string;  // Returns SVG
}
```

---

## Provider Implementations

### `/src/lib/providers/extraction/gemini.ts`

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
  
  async extract(
    input: Buffer | string,
    options = {}
  ): Promise<ProviderResult<ExtractedDocument>> {
    const startTime = Date.now();
    
    try {
      const model = this.client.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp' 
      });
      
      // Gemini can handle PDF directly
      const prompt = `Extract all content from this document.
Return as JSON with this structure:
{
  "text": "full text preserving paragraphs",
  "markdown": "formatted as markdown with headers",
  "structure": {
    "title": "document title if found",
    "sections": [{"heading": "...", "content": "...", "type": "text|table|list"}],
    "tables": [{"html": "<table>...</table>", "caption": "..."}]
  },
  "pageCount": number,
  "hasImages": boolean,
  "detectedLanguage": "en"
}

Be thorough. Preserve all measurements, numbers, and formatting.`;

      const result = await model.generateContent([
        { text: prompt },
        { 
          inlineData: { 
            mimeType: 'application/pdf', 
            data: typeof input === 'string' ? input : input.toString('base64')
          }
        }
      ]);
      
      const response = result.response.text();
      const data = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
      
      return {
        success: true,
        data,
        latency: Date.now() - startTime,
        usage: {
          inputTokens: result.response.usageMetadata?.promptTokenCount || 0,
          outputTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
          cost: 0.0001 * (result.response.usageMetadata?.totalTokenCount || 0),
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        latency: Date.now() - startTime,
      };
    }
  }
  
  async isAvailable(): Promise<boolean> {
    return !!process.env.GOOGLE_AI_API_KEY;
  }
}
```

### `/src/lib/providers/extraction/hunyuan.ts`

```typescript
import { ExtractionProvider, ExtractedDocument } from './interface';
import { ProviderResult } from '../types';

export class HunyuanExtractionProvider implements ExtractionProvider {
  name = 'hunyuan';
  private baseUrl: string;
  
  constructor(baseUrl: string = 'http://localhost:8000/v1') {
    this.baseUrl = baseUrl;
  }
  
  async extract(
    input: Buffer | string,
    options = {}
  ): Promise<ProviderResult<ExtractedDocument>> {
    const startTime = Date.now();
    
    try {
      // HunyuanOCR via vLLM OpenAI-compatible API
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'tencent/HunyuanOCR',
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${
                    typeof input === 'string' ? input : input.toString('base64')
                  }`
                }
              },
              {
                type: 'text',
                text: `Extract all information from this document in markdown format.
Tables should be in HTML format.
Preserve all measurements and numbers exactly.
Return structured content with clear section headers.`
              }
            ]
          }],
          temperature: 0.0,
          max_tokens: 16384,
        })
      });
      
      const result = await response.json();
      const text = result.choices[0].message.content;
      
      // Parse the markdown response into our structure
      const data = this.parseMarkdownToStructure(text);
      
      return {
        success: true,
        data,
        latency: Date.now() - startTime,
        usage: {
          inputTokens: result.usage?.prompt_tokens || 0,
          outputTokens: result.usage?.completion_tokens || 0,
          cost: 0, // Self-hosted
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        latency: Date.now() - startTime,
      };
    }
  }
  
  private parseMarkdownToStructure(markdown: string): ExtractedDocument {
    // Parse markdown into structured format
    // This is a simplified version - production would be more robust
    const sections: ExtractedDocument['structure']['sections'] = [];
    const tables: ExtractedDocument['structure']['tables'] = [];
    
    // Extract tables
    const tableRegex = /<table[\s\S]*?<\/table>/gi;
    let match;
    while ((match = tableRegex.exec(markdown)) !== null) {
      tables.push({ html: match[0] });
    }
    
    // Extract sections by headers
    const lines = markdown.split('\n');
    let currentSection = { heading: '', content: '', type: 'text' as const };
    
    for (const line of lines) {
      if (line.startsWith('#')) {
        if (currentSection.content) {
          sections.push(currentSection);
        }
        currentSection = { 
          heading: line.replace(/^#+\s*/, ''), 
          content: '', 
          type: 'text' 
        };
      } else {
        currentSection.content += line + '\n';
      }
    }
    if (currentSection.content) {
      sections.push(currentSection);
    }
    
    return {
      text: markdown.replace(/<[^>]*>/g, ''),
      markdown,
      structure: {
        title: sections[0]?.heading,
        sections,
        tables,
      },
      pageCount: 1,
      hasImages: markdown.includes('!['),
      detectedLanguage: 'en',
    };
  }
  
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`);
      const models = await response.json();
      return models.data?.some((m: any) => m.id.includes('HunyuanOCR'));
    } catch {
      return false;
    }
  }
}
```

### `/src/lib/providers/comprehension/openai.ts`

```typescript
import OpenAI from 'openai';
import { ComprehensionProvider } from './interface';
import { ProviderResult } from '../types';
import { ExtractedDocument } from '../extraction/interface';
import { PatternMetadata, ComprehendedStep } from '@/types/pattern';

export class OpenAIComprehensionProvider implements ComprehensionProvider {
  name = 'openai';
  private client: OpenAI;
  private model: string;
  
  constructor(apiKey: string, model = 'gpt-4o-mini') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }
  
  async comprehendOverview(
    document: ExtractedDocument
  ): Promise<ProviderResult<PatternMetadata>> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You analyze quilt patterns to extract metadata.
Return JSON matching this schema:
{
  "name": "pattern name",
  "designer": "designer name or null",
  "finishedSize": { "width": number, "height": number, "unit": "inches" } or null,
  "difficulty": "beginner" | "confident-beginner" | "intermediate" | "advanced",
  "difficultyExplanation": "1 sentence why",
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
        usage: {
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0,
          cost: this.calculateCost(response.usage),
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
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
  ): Promise<ProviderResult<Omit<ComprehendedStep, 'number' | 'originalTitle' | 'originalInstruction' | 'diagram'>>> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are a patient quilting instructor helping beginners understand pattern steps.
Your goal is CLARITY - rewrite confusing instructions so they're impossible to misunderstand.

Return JSON with:
{
  "clarifiedTitle": "more descriptive title",
  "clarifiedInstruction": "rewritten for absolute clarity, expanded but not padded",
  "whyThisMatters": "why this step is important (1-2 sentences)",
  "whatYouCreate": "physical thing(s) made in this step",
  "quantityToMake": number or null,
  "unitName": "name of unit" or null,
  "beforeState": "what you should have before starting",
  "afterState": "what you'll have when done",
  "techniques": ["technique1", "technique2"],
  "toolsNeeded": ["tool1", "tool2"],
  "commonMistakes": [{"mistake": "...", "consequence": "...", "prevention": "..."}],
  "proTips": ["tip1", "tip2"],
  "warnings": ["warning if critical"],
  "measurements": [{"value": number, "unit": "inches", "original": "2½\"", "context": "strip width"}],
  "estimatedTime": "X minutes",
  "isGoodStoppingPoint": boolean,
  "stoppingPointReason": "why" or null,
  "diagramType": "strip-arrangement" | "cutting" | "piecing" | "pressing" | "assembly",
  "diagramParams": {} // Parameters for the diagram template
}`
          },
          {
            role: 'user',
            content: `Pattern: "${context.patternName}"
Step ${context.stepNumber} of ${context.totalSteps}

Original title: ${step.title}
Original instruction: ${step.instruction}

Context - steps before: ${context.previousSteps.join(' → ') || 'This is the first step'}
Context - steps after: ${context.nextSteps.join(' → ') || 'This is the final step'}`
          }
        ],
        temperature: 0.3,
      });
      
      const data = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        success: true,
        data,
        latency: Date.now() - startTime,
        usage: {
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0,
          cost: this.calculateCost(response.usage),
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        latency: Date.now() - startTime,
      };
    }
  }
  
  async comprehendMaterials(
    document: ExtractedDocument,
    overview: PatternMetadata
  ): Promise<ProviderResult<any>> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Extract materials from a quilt pattern with their PURPOSE.
Return JSON: { "materials": [{ "item": "...", "quantity": "...", "purpose": "what this becomes in the quilt", "usedInSteps": [1,2], "substitutionNotes": "..." }] }`
          },
          {
            role: 'user',
            content: `Pattern: "${overview.name}"
Techniques: ${overview.techniquesSummary.join(', ')}

Document:\n${document.markdown}`
          }
        ],
        temperature: 0.3,
      });
      
      const data = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        success: true,
        data: data.materials,
        latency: Date.now() - startTime,
        usage: {
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0,
          cost: this.calculateCost(response.usage),
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        latency: Date.now() - startTime,
      };
    }
  }
  
  private calculateCost(usage?: { prompt_tokens?: number; completion_tokens?: number }): number {
    if (!usage) return 0;
    // GPT-4o-mini pricing: $0.15/1M input, $0.60/1M output
    return ((usage.prompt_tokens || 0) * 0.00000015) + 
           ((usage.completion_tokens || 0) * 0.0000006);
  }
  
  async isAvailable(): Promise<boolean> {
    return !!process.env.OPENAI_API_KEY;
  }
}
```

---

## Provider Registry

### `/src/lib/providers/registry.ts`

```typescript
import { ExtractionProvider } from './extraction/interface';
import { ComprehensionProvider } from './comprehension/interface';
import { VisualizationProvider } from './visualization/interface';

import { GeminiExtractionProvider } from './extraction/gemini';
import { HunyuanExtractionProvider } from './extraction/hunyuan';
import { OpenAIComprehensionProvider } from './comprehension/openai';
import { AnthropicComprehensionProvider } from './comprehension/anthropic';
import { TemplateVisualizationProvider } from './visualization/templates';

// Singleton registry
class ProviderRegistry {
  private extractionProviders: Map<string, ExtractionProvider> = new Map();
  private comprehensionProviders: Map<string, ComprehensionProvider> = new Map();
  private visualizationProviders: Map<string, VisualizationProvider> = new Map();
  
  // Register providers based on available API keys
  async initialize() {
    // Extraction providers (in order of preference)
    if (process.env.GOOGLE_AI_API_KEY) {
      this.extractionProviders.set('gemini', 
        new GeminiExtractionProvider(process.env.GOOGLE_AI_API_KEY));
    }
    if (process.env.HUNYUAN_API_URL) {
      this.extractionProviders.set('hunyuan',
        new HunyuanExtractionProvider(process.env.HUNYUAN_API_URL));
    }
    // Add more: deepseek, paddleocr, olmocr...
    
    // Comprehension providers
    if (process.env.OPENAI_API_KEY) {
      this.comprehensionProviders.set('openai',
        new OpenAIComprehensionProvider(process.env.OPENAI_API_KEY));
    }
    if (process.env.ANTHROPIC_API_KEY) {
      this.comprehensionProviders.set('anthropic',
        new AnthropicComprehensionProvider(process.env.ANTHROPIC_API_KEY));
    }
    
    // Visualization (templates always available)
    this.visualizationProviders.set('templates',
      new TemplateVisualizationProvider());
  }
  
  // Get best available extraction provider
  async getExtractionProvider(preferred?: string): Promise<ExtractionProvider> {
    if (preferred && this.extractionProviders.has(preferred)) {
      const provider = this.extractionProviders.get(preferred)!;
      if (await provider.isAvailable()) return provider;
    }
    
    // Fallback to first available
    for (const [_, provider] of this.extractionProviders) {
      if (await provider.isAvailable()) return provider;
    }
    
    throw new Error('No extraction provider available');
  }
  
  async getComprehensionProvider(preferred?: string): Promise<ComprehensionProvider> {
    if (preferred && this.comprehensionProviders.has(preferred)) {
      const provider = this.comprehensionProviders.get(preferred)!;
      if (await provider.isAvailable()) return provider;
    }
    
    for (const [_, provider] of this.comprehensionProviders) {
      if (await provider.isAvailable()) return provider;
    }
    
    throw new Error('No comprehension provider available');
  }
  
  async getVisualizationProvider(preferred?: string): Promise<VisualizationProvider> {
    // Templates are always available and preferred for consistency
    return this.visualizationProviders.get('templates')!;
  }
  
  // List available providers
  listProviders() {
    return {
      extraction: Array.from(this.extractionProviders.keys()),
      comprehension: Array.from(this.comprehensionProviders.keys()),
      visualization: Array.from(this.visualizationProviders.keys()),
    };
  }
}

export const providerRegistry = new ProviderRegistry();
```

---

## Diagram Templates

### `/src/lib/providers/visualization/templates.ts`

```typescript
import { VisualizationProvider, DiagramTemplate } from './interface';
import { ProviderResult } from '../types';
import { StepDiagram, ComprehendedStep } from '@/types/pattern';

// Color palette (Japanese-inspired)
const COLORS = {
  indigo: '#264653',
  persimmon: '#e76f51',
  sage: '#84a98c',
  clay: '#e9c46a',
  washi: '#faf6f1',
  rice: '#f5f5f0',
  inkGray: '#5c5c5c',
};

// SVG templates for common quilting diagrams
const TEMPLATES: Record<string, DiagramTemplate> = {
  
  'strip-arrangement': {
    type: 'strip-arrangement',
    generate: (params: {
      strips: Array<{ color: string; label: string }>;
      direction?: 'horizontal' | 'vertical';
      showSeams?: boolean;
    }) => {
      const { strips, direction = 'horizontal', showSeams = true } = params;
      const stripHeight = 30;
      const stripWidth = 280;
      const gap = showSeams ? 2 : 0;
      
      return `<svg viewBox="0 0 320 ${strips.length * (stripHeight + gap) + 40}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .strip-label { font-family: system-ui; font-size: 12px; fill: ${COLORS.inkGray}; }
          .strip-label-light { fill: white; }
        </style>
        <rect width="100%" height="100%" fill="${COLORS.washi}" rx="8"/>
        ${strips.map((strip, i) => {
          const y = 20 + i * (stripHeight + gap);
          const isLight = isLightColor(strip.color);
          return `
            <rect x="20" y="${y}" width="${stripWidth}" height="${stripHeight}" 
                  fill="${strip.color}" stroke="${COLORS.indigo}" stroke-width="1" rx="2"/>
            <text x="160" y="${y + 19}" text-anchor="middle" 
                  class="strip-label ${isLight ? '' : 'strip-label-light'}">
              ${strip.label}
            </text>
          `;
        }).join('')}
        ${showSeams ? `
          <text x="160" y="${strips.length * (stripHeight + gap) + 32}" 
                text-anchor="middle" class="strip-label" style="font-style: italic;">
            Sew strips in this order
          </text>
        ` : ''}
      </svg>`;
    }
  },
  
  'hst': {
    type: 'hst',
    generate: (params: {
      color1: string;
      color2: string;
      label1?: string;
      label2?: string;
      size?: number;
    }) => {
      const { color1, color2, label1 = '', label2 = '', size = 100 } = params;
      
      return `<svg viewBox="0 0 ${size + 40} ${size + 60}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .hst-label { font-family: system-ui; font-size: 11px; fill: ${COLORS.inkGray}; }
        </style>
        <rect width="100%" height="100%" fill="${COLORS.washi}" rx="8"/>
        
        <!-- Square outline -->
        <rect x="20" y="20" width="${size}" height="${size}" 
              fill="none" stroke="${COLORS.indigo}" stroke-width="1"/>
        
        <!-- Triangle 1 (top-left) -->
        <polygon points="20,20 ${20 + size},20 20,${20 + size}" 
                 fill="${color1}" stroke="${COLORS.indigo}" stroke-width="1"/>
        
        <!-- Triangle 2 (bottom-right) -->
        <polygon points="${20 + size},20 ${20 + size},${20 + size} 20,${20 + size}" 
                 fill="${color2}" stroke="${COLORS.indigo}" stroke-width="1"/>
        
        <!-- Diagonal seam line -->
        <line x1="20" y1="${20 + size}" x2="${20 + size}" y2="20" 
              stroke="${COLORS.indigo}" stroke-width="2" stroke-dasharray="4,2"/>
        
        <!-- Labels -->
        ${label1 ? `<text x="45" y="55" class="hst-label">${label1}</text>` : ''}
        ${label2 ? `<text x="${size - 15}" y="${size}" class="hst-label">${label2}</text>` : ''}
        
        <text x="${20 + size/2}" y="${size + 50}" text-anchor="middle" class="hst-label">
          Half Square Triangle
        </text>
      </svg>`;
    }
  },
  
  'cutting': {
    type: 'cutting',
    generate: (params: {
      shape: 'strip' | 'square' | 'triangle' | 'rectangle';
      width: string;
      height?: string;
      quantity?: number;
      fromFabric?: string;
    }) => {
      const { shape, width, height, quantity, fromFabric } = params;
      
      // Generate cutting diagram based on shape
      let shapesSvg = '';
      const w = 60, h = shape === 'strip' ? 20 : 60;
      
      if (shape === 'strip') {
        shapesSvg = `
          <rect x="40" y="60" width="240" height="30" fill="${COLORS.clay}" 
                stroke="${COLORS.indigo}" stroke-width="1"/>
          <line x1="40" y1="75" x2="280" y2="75" stroke="${COLORS.indigo}" 
                stroke-width="1" stroke-dasharray="5,5"/>
          <text x="160" y="80" text-anchor="middle" style="font-size: 12px; fill: ${COLORS.indigo};">
            ${width}
          </text>
        `;
      } else if (shape === 'square') {
        shapesSvg = `
          <rect x="110" y="40" width="80" height="80" fill="${COLORS.sage}" 
                stroke="${COLORS.indigo}" stroke-width="1"/>
          <text x="150" y="85" text-anchor="middle" style="font-size: 14px; fill: white;">
            ${width}
          </text>
        `;
      } else if (shape === 'triangle') {
        shapesSvg = `
          <polygon points="150,40 200,120 100,120" fill="${COLORS.persimmon}" 
                   stroke="${COLORS.indigo}" stroke-width="1"/>
          <text x="150" y="100" text-anchor="middle" style="font-size: 12px; fill: white;">
            ${width}
          </text>
        `;
      }
      
      return `<svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${COLORS.washi}" rx="8"/>
        ${shapesSvg}
        <text x="160" y="145" text-anchor="middle" style="font-size: 12px; fill: ${COLORS.inkGray};">
          Cut ${quantity || ''} ${shape}${(quantity || 0) > 1 ? 's' : ''} at ${width}${height ? ` × ${height}` : ''}
        </text>
      </svg>`;
    }
  },
  
  'pressing': {
    type: 'pressing',
    generate: (params: {
      direction: 'left' | 'right' | 'open' | 'toward-dark';
    }) => {
      const { direction } = params;
      
      const arrowPath = direction === 'open' 
        ? 'M120,80 L100,60 M120,80 L100,100 M180,80 L200,60 M180,80 L200,100'
        : direction === 'left'
        ? 'M180,80 L120,80 M130,70 L120,80 L130,90'
        : 'M120,80 L180,80 M170,70 L180,80 L170,90';
      
      return `<svg viewBox="0 0 300 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${COLORS.washi}" rx="8"/>
        
        <!-- Seam line -->
        <rect x="50" y="50" width="200" height="60" fill="${COLORS.rice}" 
              stroke="${COLORS.indigo}" stroke-width="1"/>
        <line x1="150" y1="50" x2="150" y2="110" stroke="${COLORS.indigo}" stroke-width="2"/>
        
        <!-- Arrow -->
        <path d="${arrowPath}" stroke="${COLORS.persimmon}" stroke-width="3" fill="none"/>
        
        <text x="150" y="130" text-anchor="middle" style="font-size: 12px; fill: ${COLORS.inkGray};">
          Press seams ${direction === 'open' ? 'open' : direction === 'toward-dark' ? 'toward darker fabric' : direction}
        </text>
      </svg>`;
    }
  },
  
  'assembly': {
    type: 'assembly',
    generate: (params: {
      units: Array<{ label: string; color: string }>;
      layout: 'row' | 'column' | 'grid';
      gridCols?: number;
    }) => {
      const { units, layout, gridCols = 3 } = params;
      const unitSize = 50;
      const gap = 10;
      
      let unitsSvg = '';
      units.forEach((unit, i) => {
        const col = layout === 'grid' ? i % gridCols : (layout === 'row' ? i : 0);
        const row = layout === 'grid' ? Math.floor(i / gridCols) : (layout === 'column' ? i : 0);
        const x = 30 + col * (unitSize + gap);
        const y = 30 + row * (unitSize + gap);
        
        unitsSvg += `
          <rect x="${x}" y="${y}" width="${unitSize}" height="${unitSize}" 
                fill="${unit.color}" stroke="${COLORS.indigo}" stroke-width="1" rx="4"/>
          <text x="${x + unitSize/2}" y="${y + unitSize/2 + 4}" 
                text-anchor="middle" style="font-size: 10px; fill: ${isLightColor(unit.color) ? COLORS.indigo : 'white'};">
            ${unit.label}
          </text>
        `;
      });
      
      const cols = layout === 'grid' ? gridCols : (layout === 'row' ? units.length : 1);
      const rows = layout === 'grid' ? Math.ceil(units.length / gridCols) : (layout === 'column' ? units.length : 1);
      const width = 60 + cols * (unitSize + gap);
      const height = 60 + rows * (unitSize + gap);
      
      return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${COLORS.washi}" rx="8"/>
        ${unitsSvg}
      </svg>`;
    }
  },
};

// Helper function
function isLightColor(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

export class TemplateVisualizationProvider implements VisualizationProvider {
  name = 'templates';
  
  async generateDiagram(
    step: ComprehendedStep,
    options = {}
  ): Promise<ProviderResult<StepDiagram>> {
    const startTime = Date.now();
    
    // Use diagramType and diagramParams from step comprehension
    const diagramType = (step as any).diagramType || this.inferDiagramType(step);
    const diagramParams = (step as any).diagramParams || this.inferDiagramParams(step, diagramType);
    
    const template = TEMPLATES[diagramType];
    if (!template) {
      return {
        success: true,
        data: {
          type: 'custom',
          svgCode: '',
          caption: '',
          altText: step.clarifiedTitle,
        },
        latency: Date.now() - startTime,
      };
    }
    
    try {
      const svgCode = template.generate(diagramParams);
      
      return {
        success: true,
        data: {
          type: diagramType as StepDiagram['type'],
          svgCode,
          caption: this.generateCaption(step, diagramType),
          altText: `Diagram showing ${step.whatYouCreate}`,
        },
        latency: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        latency: Date.now() - startTime,
      };
    }
  }
  
  private inferDiagramType(step: ComprehendedStep): string {
    const text = (step.clarifiedInstruction + step.techniques.join(' ')).toLowerCase();
    
    if (text.includes('strip') && (text.includes('arrange') || text.includes('sew'))) return 'strip-arrangement';
    if (text.includes('half square') || text.includes('hst')) return 'hst';
    if (text.includes('cut')) return 'cutting';
    if (text.includes('press')) return 'pressing';
    if (text.includes('assemble') || text.includes('join') || text.includes('sew together')) return 'assembly';
    return 'custom';
  }
  
  private inferDiagramParams(step: ComprehendedStep, diagramType: string): Record<string, unknown> {
    // Default params based on diagram type
    // In production, these would come from the comprehension step
    switch (diagramType) {
      case 'strip-arrangement':
        return {
          strips: [
            { color: COLORS.rice, label: 'background' },
            { color: COLORS.clay, label: 'light' },
            { color: COLORS.persimmon, label: 'medium' },
            { color: COLORS.indigo, label: 'dark' },
            { color: COLORS.rice, label: 'background' },
          ]
        };
      case 'hst':
        return { color1: COLORS.rice, color2: COLORS.indigo };
      case 'pressing':
        return { direction: 'toward-dark' };
      default:
        return {};
    }
  }
  
  private generateCaption(step: ComprehendedStep, diagramType: string): string {
    switch (diagramType) {
      case 'strip-arrangement':
        return 'Arrange and sew strips in this order';
      case 'hst':
        return 'Half Square Triangle unit';
      case 'cutting':
        return `Cut pieces as shown`;
      case 'pressing':
        return 'Press seams in the direction shown';
      case 'assembly':
        return 'Assemble units as shown';
      default:
        return step.clarifiedTitle;
    }
  }
  
  async isAvailable(): Promise<boolean> {
    return true; // Templates are always available
  }
}
```

---

## Configuration

### `/src/lib/config/models.ts`

```typescript
// Model configuration - easy to swap providers
export const MODEL_CONFIG = {
  // Stage 1: Document Extraction
  extraction: {
    // Order of preference
    providers: ['gemini', 'hunyuan', 'deepseek-ocr', 'paddleocr'],
    
    // Specific config per provider
    gemini: {
      model: 'gemini-2.0-flash-exp',
    },
    hunyuan: {
      model: 'tencent/HunyuanOCR',
      endpoint: process.env.HUNYUAN_API_URL || 'http://localhost:8000/v1',
    },
    'deepseek-ocr': {
      model: 'deepseek-ai/DeepSeek-OCR',
      endpoint: process.env.DEEPSEEK_OCR_URL,
    },
  },
  
  // Stage 2: Pattern Comprehension
  comprehension: {
    providers: ['openai', 'anthropic', 'gemini'],
    
    openai: {
      model: 'gpt-4o-mini',  // Cheap, reliable JSON
    },
    anthropic: {
      model: 'claude-haiku-4-5-20251001',
    },
    gemini: {
      model: 'gemini-2.0-flash-exp',
    },
  },
  
  // Stage 3: Visualization
  visualization: {
    // Templates are always first choice for consistency
    providers: ['templates', 'anthropic'],
    
    // Only used for complex/custom diagrams
    anthropic: {
      model: 'claude-sonnet-4-20250514',
    },
  },
};

// Environment variable requirements
export const REQUIRED_ENV_VARS = {
  minimum: ['OPENAI_API_KEY'],  // Minimum to function
  recommended: ['OPENAI_API_KEY', 'GOOGLE_AI_API_KEY'],
  full: ['OPENAI_API_KEY', 'GOOGLE_AI_API_KEY', 'ANTHROPIC_API_KEY'],
};
```

---

## Pipeline Orchestration

### `/src/lib/comprehension/pipeline.ts`

```typescript
import { providerRegistry } from '../providers/registry';
import { ComprehendedPattern } from '@/types/pattern';
import { MODEL_CONFIG } from '../config/models';

interface PipelineProgress {
  stage: 'extraction' | 'overview' | 'materials' | 'steps' | 'diagrams' | 'complete';
  progress: number;  // 0-100
  message: string;
  currentStep?: number;
  totalSteps?: number;
}

export async function comprehendPattern(
  pdfBuffer: Buffer,
  onProgress?: (progress: PipelineProgress) => void
): Promise<ComprehendedPattern> {
  const startTime = Date.now();
  
  // Initialize providers
  await providerRegistry.initialize();
  
  // Stage 1: Extract document
  onProgress?.({ stage: 'extraction', progress: 5, message: 'Extracting document content...' });
  
  const extractionProvider = await providerRegistry.getExtractionProvider(
    MODEL_CONFIG.extraction.providers[0]
  );
  const extraction = await extractionProvider.extract(pdfBuffer);
  
  if (!extraction.success || !extraction.data) {
    throw new Error(`Extraction failed: ${extraction.error}`);
  }
  
  // Stage 2: Comprehend overview
  onProgress?.({ stage: 'overview', progress: 15, message: 'Understanding pattern structure...' });
  
  const comprehensionProvider = await providerRegistry.getComprehensionProvider(
    MODEL_CONFIG.comprehension.providers[0]
  );
  const overview = await comprehensionProvider.comprehendOverview(extraction.data);
  
  if (!overview.success || !overview.data) {
    throw new Error(`Overview comprehension failed: ${overview.error}`);
  }
  
  // Stage 3: Comprehend materials
  onProgress?.({ stage: 'materials', progress: 25, message: 'Analyzing materials...' });
  
  const materials = await comprehensionProvider.comprehendMaterials(
    extraction.data, 
    overview.data
  );
  
  // Stage 4: Identify and comprehend steps
  onProgress?.({ stage: 'steps', progress: 30, message: 'Identifying steps...' });
  
  const rawSteps = identifySteps(extraction.data.markdown);
  const totalSteps = rawSteps.length;
  
  const comprehendedSteps = [];
  for (let i = 0; i < rawSteps.length; i++) {
    onProgress?.({ 
      stage: 'steps', 
      progress: 30 + (i / totalSteps) * 40,
      message: `Comprehending step ${i + 1} of ${totalSteps}...`,
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
  
  // Stage 5: Generate diagrams
  onProgress?.({ stage: 'diagrams', progress: 75, message: 'Generating visual diagrams...' });
  
  const visualizationProvider = await providerRegistry.getVisualizationProvider();
  
  for (let i = 0; i < comprehendedSteps.length; i++) {
    onProgress?.({ 
      stage: 'diagrams', 
      progress: 75 + (i / comprehendedSteps.length) * 20,
      message: `Creating diagram ${i + 1} of ${comprehendedSteps.length}...`,
    });
    
    const diagramResult = await visualizationProvider.generateDiagram(comprehendedSteps[i]);
    if (diagramResult.success && diagramResult.data) {
      comprehendedSteps[i].diagram = diagramResult.data;
    }
  }
  
  // Complete
  onProgress?.({ stage: 'complete', progress: 100, message: 'Pattern comprehension complete!' });
  
  return {
    id: generateId(),
    uploadedAt: new Date().toISOString(),
    processingTime: Date.now() - startTime,
    metadata: overview.data,
    materials: materials.data || [],
    steps: comprehendedSteps,
    assembly: { units: [], overviewDiagram: '', flow: [] },  // TODO: implement
    originalText: extraction.data.text,
  };
}

// Helper to identify steps from markdown
function identifySteps(markdown: string): Array<{ title: string; instruction: string }> {
  const steps: Array<{ title: string; instruction: string }> = [];
  
  // Look for numbered steps, headers, or "Step X" patterns
  const stepPatterns = [
    /^#+\s*(?:Step\s+)?(\d+)[.:)]?\s*(.+?)$/gim,
    /^(\d+)[.:)]\s*(.+?)$/gm,
    /^(?:Step\s+)?(\d+)[.:)]?\s*(.+?)$/gim,
  ];
  
  // Split by headers or step markers
  const sections = markdown.split(/(?=^#+\s|^\d+[.:)])/m);
  
  for (const section of sections) {
    const lines = section.trim().split('\n');
    if (lines.length === 0) continue;
    
    const title = lines[0].replace(/^#+\s*/, '').replace(/^\d+[.:)]\s*/, '').trim();
    const instruction = lines.slice(1).join('\n').trim();
    
    if (title && instruction) {
      steps.push({ title, instruction });
    }
  }
  
  return steps;
}

function generateId(): string {
  return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
```

---

## API Route Update

### `/app/api/parse-pdf/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { comprehendPattern } from '@/lib/comprehension/pipeline';

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
    
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Run comprehension pipeline
    const pattern = await comprehendPattern(buffer);
    
    return NextResponse.json(pattern);
    
  } catch (error) {
    console.error('Pattern comprehension error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Comprehension failed' },
      { status: 500 }
    );
  }
}

// For streaming progress updates
export async function GET(request: NextRequest) {
  // Return server-sent events for progress
  // Implementation depends on your streaming approach
}
```

---

## Environment Variables

```bash
# .env.local

# Extraction providers (at least one required)
GOOGLE_AI_API_KEY=your_google_ai_key      # For Gemini (recommended for MVP)
HUNYUAN_API_URL=http://localhost:8000/v1  # If self-hosting HunyuanOCR
DEEPSEEK_OCR_URL=http://localhost:8001/v1 # If self-hosting DeepSeek-OCR

# Comprehension providers (at least one required)
OPENAI_API_KEY=your_openai_key            # For GPT-4o-mini (recommended)
ANTHROPIC_API_KEY=your_anthropic_key      # For Claude (backup)

# Optional: For complex diagram generation
# (Templates are used by default, which is preferred)
```

---

## Adding a New Provider

To add a new model (e.g., OlmOCR, Chandra, or a future model):

1. Create provider file: `/src/lib/providers/extraction/olmocr.ts`
2. Implement the `ExtractionProvider` interface
3. Add to registry in `/src/lib/providers/registry.ts`
4. Add config in `/src/lib/config/models.ts`
5. Add environment variable if needed

Example:

```typescript
// /src/lib/providers/extraction/olmocr.ts
import { ExtractionProvider, ExtractedDocument } from './interface';
import { ProviderResult } from '../types';

export class OlmOCRExtractionProvider implements ExtractionProvider {
  name = 'olmocr';
  
  async extract(input: Buffer | string): Promise<ProviderResult<ExtractedDocument>> {
    // Implementation using vLLM or SGLang
    // OlmOCR uses Qwen2.5-VL base with OCR fine-tuning
  }
  
  async isAvailable(): Promise<boolean> {
    // Check if OlmOCR endpoint is available
  }
}
```

---

## Recommended MVP Path

1. **Start with hosted APIs:**
   - Extraction: Gemini 2.0 Flash (native PDF, cheap)
   - Comprehension: GPT-4o-mini (reliable JSON)
   - Visualization: Templates (consistent, free)

2. **Test alternatives in parallel:**
   - Run same patterns through HunyuanOCR, DeepSeek-OCR
   - Compare quality and cost
   - Log metrics for decision-making

3. **Scale path:**
   - High volume → self-host best performer
   - HunyuanOCR (1B) or PaddleOCR-VL (0.9B) for cost efficiency
   - OlmOCR-2 or Chandra for maximum accuracy

---

## Success Metrics

- Extraction accuracy: >95% text preservation
- Step clarity improvement: User testing required
- Diagram relevance: Step-specific, not generic
- Processing time: <60 seconds for typical pattern
- Cost per pattern: <$0.10 at scale
