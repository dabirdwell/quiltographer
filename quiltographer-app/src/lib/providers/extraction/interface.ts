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

export interface ExtractionOptions {
  outputFormat?: 'markdown' | 'html' | 'text';
  preserveTables?: boolean;
  extractImages?: boolean;
}

// Interface all extraction providers must implement
export interface ExtractionProvider {
  name: string;

  // Extract content from PDF/image
  extract(
    input: Buffer | string,  // Buffer for file, string for base64
    options?: ExtractionOptions
  ): Promise<ProviderResult<ExtractedDocument>>;

  // Check if provider is available
  isAvailable(): Promise<boolean>;
}
