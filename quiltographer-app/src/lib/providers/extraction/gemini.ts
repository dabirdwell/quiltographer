import { ExtractionProvider, ExtractedDocument, ExtractionOptions } from './interface';
import { ProviderResult } from '../types';

export class GeminiExtractionProvider implements ExtractionProvider {
  name = 'gemini';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async extract(
    input: Buffer | string,
    options: ExtractionOptions = {}
  ): Promise<ProviderResult<ExtractedDocument>> {
    const startTime = Date.now();

    try {
      const base64Data = typeof input === 'string' ? input : input.toString('base64');

      const prompt = `Extract all content from this quilting pattern PDF document.
Return as JSON with this exact structure:
{
  "text": "full text preserving paragraphs and structure",
  "markdown": "formatted as markdown with headers, lists, and tables",
  "structure": {
    "title": "document title if found",
    "sections": [{"heading": "section heading", "content": "section content", "type": "text|table|list"}],
    "tables": [{"html": "<table>...</table>", "caption": "table caption if any"}]
  },
  "pageCount": number,
  "hasImages": boolean,
  "detectedLanguage": "en"
}

Be thorough. Preserve ALL measurements, numbers, fabric quantities, and formatting exactly as written.
For quilting patterns, pay special attention to:
- Cutting instructions with exact measurements
- Fabric requirements and yardage
- Step-by-step construction instructions
- Seam allowances and finished sizes`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: 'application/pdf',
                    data: base64Data
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 32768,
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
      }

      const result = await response.json();
      const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        throw new Error('No content returned from Gemini');
      }

      // Parse JSON from response (handle markdown code blocks)
      const jsonMatch = textContent.match(/```json\n?([\s\S]*?)\n?```/) ||
                        textContent.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('Could not parse JSON from Gemini response');
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const data = JSON.parse(jsonStr) as ExtractedDocument;

      // Calculate token usage from response metadata
      const usageMetadata = result.usageMetadata || {};

      return {
        success: true,
        data,
        latency: Date.now() - startTime,
        usage: {
          inputTokens: usageMetadata.promptTokenCount || 0,
          outputTokens: usageMetadata.candidatesTokenCount || 0,
          // Gemini 2.0 Flash: ~$0.075/1M input, ~$0.30/1M output
          cost: ((usageMetadata.promptTokenCount || 0) * 0.000000075) +
                ((usageMetadata.candidatesTokenCount || 0) * 0.0000003),
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

// Factory function for easy instantiation
export function createGeminiProvider(): GeminiExtractionProvider | null {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return null;
  return new GeminiExtractionProvider(apiKey);
}
