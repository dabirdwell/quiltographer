import { ExtractionProvider, ExtractedDocument, ExtractionOptions } from './interface';
import { ProviderResult } from '../types';

/**
 * Local PDF extraction using pdf-parse.
 * No API calls needed — runs entirely on-device.
 * Primary extraction provider for Quiltographer.
 */
export class PdfLocalExtractionProvider implements ExtractionProvider {
  name = 'pdf-local';

  async extract(
    input: Buffer | string,
    options: ExtractionOptions = {}
  ): Promise<ProviderResult<ExtractedDocument>> {
    const startTime = Date.now();

    try {
      // Dynamic import to avoid SSR issues
      const pdfParse = (await import('pdf-parse')).default;

      const buffer = typeof input === 'string'
        ? Buffer.from(input, 'base64')
        : input;

      const pdf = await pdfParse(buffer);
      const rawText = pdf.text;

      // Convert raw text to markdown with structure detection
      const { markdown, sections, title } = this.structureText(rawText);

      const document: ExtractedDocument = {
        text: rawText,
        markdown,
        structure: {
          title,
          sections,
          tables: [], // pdf-parse doesn't extract tables as HTML
        },
        pageCount: pdf.numpages,
        hasImages: false, // pdf-parse doesn't detect images
        detectedLanguage: 'en',
      };

      return {
        success: true,
        data: document,
        latency: Date.now() - startTime,
        usage: {
          inputTokens: 0,
          outputTokens: 0,
          cost: 0, // Free — no API call
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PDF parsing failed',
        latency: Date.now() - startTime,
      };
    }
  }

  /**
   * Convert raw PDF text into structured markdown.
   * Detects headings, lists, measurements, and quilting-specific patterns.
   */
  private structureText(text: string): {
    markdown: string;
    sections: Array<{ heading?: string; content: string; type: 'text' | 'table' | 'list' }>;
    title?: string;
  } {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const sections: Array<{ heading?: string; content: string; type: 'text' | 'table' | 'list' }> = [];
    let title: string | undefined;
    let markdownLines: string[] = [];
    let currentSection: { heading?: string; content: string; type: 'text' | 'table' | 'list' } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect title (first substantial line, often the pattern name)
      if (!title && line.length > 3 && line.length < 80 && !line.match(/^(www\.|http|©|page)/i)) {
        title = line;
        markdownLines.push(`# ${line}`);
        continue;
      }

      // Detect section headings: "Step N:", "Supplies Needed:", etc.
      const isHeading = this.isLikelyHeading(line, lines[i + 1]);

      if (isHeading) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }

        const headingLevel = line.match(/^Step\s+\d+/i) ? '##' : '###';
        markdownLines.push('');
        markdownLines.push(`${headingLevel} ${line}`);

        currentSection = {
          heading: line,
          content: '',
          type: 'text',
        };
        continue;
      }

      // Detect list items: "- item", "• item", "1. item"
      const isListItem = line.match(/^[-•*]\s/) || line.match(/^\d+[.)]\s/);

      if (isListItem) {
        const normalized = line.replace(/^[-•*]\s/, '- ').replace(/^\d+[.)]\s/, '- ');
        markdownLines.push(normalized);
        if (currentSection) {
          currentSection.content += line + '\n';
          currentSection.type = 'list';
        }
        continue;
      }

      // Regular text
      markdownLines.push(line);
      if (currentSection) {
        currentSection.content += line + '\n';
      } else {
        currentSection = { content: line + '\n', type: 'text' };
      }
    }

    // Save final section
    if (currentSection) {
      sections.push(currentSection);
    }

    return {
      markdown: markdownLines.join('\n'),
      sections,
      title,
    };
  }

  /**
   * Heuristic: is this line a heading?
   */
  private isLikelyHeading(line: string, nextLine?: string): boolean {
    // "Step N:" pattern
    if (line.match(/^Step\s+\d+/i)) return true;

    // Lines ending with ":" that are short
    if (line.endsWith(':') && line.length < 60) return true;

    // ALL CAPS short lines
    if (line === line.toUpperCase() && line.length > 3 && line.length < 50 && line.match(/[A-Z]/)) return true;

    // Short line followed by longer content (title-like)
    if (line.length < 40 && nextLine && nextLine.length > line.length * 2) return true;

    return false;
  }

  async isAvailable(): Promise<boolean> {
    try {
      await import('pdf-parse');
      return true;
    } catch {
      return false;
    }
  }
}

// Factory
export function createPdfLocalProvider(): PdfLocalExtractionProvider {
  return new PdfLocalExtractionProvider();
}
