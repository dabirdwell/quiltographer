// Model configuration - easy to swap providers

export const MODEL_CONFIG = {
  // Stage 1: Document Extraction
  extraction: {
    // Order of preference
    providers: ['gemini', 'hunyuan', 'deepseek-ocr', 'paddleocr'] as const,

    gemini: {
      model: 'gemini-2.0-flash-exp',
      maxTokens: 32768,
    },
    hunyuan: {
      model: 'tencent/HunyuanOCR',
      endpoint: process.env.HUNYUAN_API_URL || 'http://localhost:8000/v1',
    },
    'deepseek-ocr': {
      model: 'deepseek-ai/DeepSeek-OCR',
      endpoint: process.env.DEEPSEEK_OCR_URL,
    },
    paddleocr: {
      model: 'paddleocr/PaddleOCR-VL',
      endpoint: process.env.PADDLEOCR_URL,
    },
  },

  // Stage 2: Pattern Comprehension
  comprehension: {
    providers: ['openai', 'anthropic', 'gemini'] as const,

    openai: {
      model: 'gpt-4o-mini',  // Cheap, reliable JSON
      maxTokens: 4096,
    },
    anthropic: {
      model: 'claude-haiku-4-5-20251001',
      maxTokens: 4096,
    },
    gemini: {
      model: 'gemini-2.0-flash-exp',
      maxTokens: 8192,
    },
  },

  // Stage 3: Visualization
  visualization: {
    // Templates are always first choice for consistency
    providers: ['templates', 'anthropic'] as const,

    templates: {
      // No model needed - uses SVG templates
    },
    anthropic: {
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
    },
  },
} as const;

// Environment variable requirements
export const REQUIRED_ENV_VARS = {
  // Minimum required to function
  minimum: ['OPENAI_API_KEY'] as const,
  // Recommended for better results
  recommended: ['OPENAI_API_KEY', 'GOOGLE_AI_API_KEY'] as const,
  // Full feature set
  full: ['OPENAI_API_KEY', 'GOOGLE_AI_API_KEY', 'ANTHROPIC_API_KEY'] as const,
};

// Cost estimates per operation (in USD)
export const COST_ESTIMATES = {
  extraction: {
    gemini: 0.001,      // ~$0.001 per pattern
    hunyuan: 0,         // Self-hosted
    'deepseek-ocr': 0,  // Self-hosted
  },
  comprehension: {
    openai: {
      overview: 0.001,
      stepAverage: 0.002,
      materials: 0.001,
    },
    anthropic: {
      overview: 0.002,
      stepAverage: 0.003,
      materials: 0.002,
    },
  },
  visualization: {
    templates: 0,  // Free
    anthropic: 0.01,  // If using AI for custom diagrams
  },
};

export type ExtractionProviderName = typeof MODEL_CONFIG.extraction.providers[number];
export type ComprehensionProviderName = typeof MODEL_CONFIG.comprehension.providers[number];
export type VisualizationProviderName = typeof MODEL_CONFIG.visualization.providers[number];
