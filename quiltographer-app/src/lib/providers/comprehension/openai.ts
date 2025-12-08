import { ComprehensionProvider, StepContext, ComprehendedStepData } from './interface';
import { ProviderResult } from '../types';
import { ExtractedDocument } from '../extraction/interface';
import { PatternMetadata, PatternMaterial } from '@/types/comprehension';

export class OpenAIComprehensionProvider implements ComprehensionProvider {
  name = 'openai';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = 'gpt-4o-mini') {
    this.apiKey = apiKey;
    this.model = model;
  }

  private async callOpenAI(messages: Array<{ role: string; content: string }>, temperature = 0.3): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
    }

    return response.json();
  }

  private calculateCost(usage?: { prompt_tokens?: number; completion_tokens?: number }): number {
    if (!usage) return 0;
    // GPT-4o-mini pricing: $0.15/1M input, $0.60/1M output
    return ((usage.prompt_tokens || 0) * 0.00000015) +
           ((usage.completion_tokens || 0) * 0.0000006);
  }

  async comprehendOverview(
    document: ExtractedDocument
  ): Promise<ProviderResult<PatternMetadata>> {
    const startTime = Date.now();

    try {
      const response = await this.callOpenAI([
        {
          role: 'system',
          content: `You analyze quilt patterns to extract metadata.
Return JSON matching this exact schema:
{
  "name": "pattern name",
  "designer": "designer name" or null,
  "finishedSize": { "width": number, "height": number, "unit": "inches" } or null,
  "difficulty": "beginner" | "confident-beginner" | "intermediate" | "advanced",
  "difficultyExplanation": "1 sentence explaining why",
  "techniquesSummary": ["technique1", "technique2"],
  "estimatedTime": "X hours" or null
}

Be accurate. If information is not in the document, use null.`
        },
        {
          role: 'user',
          content: `Analyze this quilt pattern and extract its metadata:\n\n${document.markdown}`
        }
      ]);

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
    context: StepContext
  ): Promise<ProviderResult<ComprehendedStepData>> {
    const startTime = Date.now();

    try {
      const response = await this.callOpenAI([
        {
          role: 'system',
          content: `You are a patient quilting instructor helping beginners understand pattern steps.
Your goal is CLARITY - rewrite confusing instructions so they're impossible to misunderstand.

Return JSON with this exact structure:
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
  "warnings": ["warning if critical"] or [],
  "measurements": [{"value": number, "unit": "inches", "original": "2½\\"", "context": "strip width"}],
  "estimatedTime": "X minutes",
  "isGoodStoppingPoint": boolean,
  "stoppingPointReason": "why" or null,
  "diagramType": "strip-arrangement" | "cutting" | "hst" | "pressing" | "assembly" | "custom",
  "diagramParams": {}
}

For diagramType, choose based on what the step does:
- "cutting": for cutting fabric pieces
- "strip-arrangement": for arranging/sewing strips together
- "hst": for half-square triangles
- "pressing": for pressing seams
- "assembly": for joining units together
- "custom": for anything else`
        },
        {
          role: 'user',
          content: `Pattern: "${context.patternName}"
Step ${context.stepNumber} of ${context.totalSteps}

Original title: ${step.title}
Original instruction: ${step.instruction}

Context - steps before: ${context.previousSteps.slice(-3).join(' → ') || 'This is the first step'}
Context - steps after: ${context.nextSteps.slice(0, 3).join(' → ') || 'This is the final step'}`
        }
      ]);

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
  ): Promise<ProviderResult<PatternMaterial[]>> {
    const startTime = Date.now();

    try {
      const response = await this.callOpenAI([
        {
          role: 'system',
          content: `Extract materials from a quilt pattern with their PURPOSE.
Return JSON: { "materials": [{ "item": "...", "quantity": "...", "purpose": "what this becomes in the quilt", "usedInSteps": [1,2], "substitutionNotes": "..." }] }

Be thorough - include fabric, batting, thread, notions, and tools mentioned.`
        },
        {
          role: 'user',
          content: `Pattern: "${overview.name}"
Techniques: ${overview.techniquesSummary.join(', ')}

Document:\n${document.markdown.slice(0, 8000)}`
        }
      ]);

      const data = JSON.parse(response.choices[0].message.content || '{}');

      return {
        success: true,
        data: data.materials || [],
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

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }
}

// Factory function
export function createOpenAIProvider(model?: string): OpenAIComprehensionProvider | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAIComprehensionProvider(apiKey, model);
}
