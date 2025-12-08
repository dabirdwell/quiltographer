import { ExtractionProvider } from './extraction/interface';
import { ComprehensionProvider } from './comprehension/interface';
import { VisualizationProvider } from './visualization/interface';

import { GeminiExtractionProvider } from './extraction/gemini';
import { OpenAIComprehensionProvider } from './comprehension/openai';
import { TemplateVisualizationProvider } from './visualization/templates';

// Singleton registry for managing providers
class ProviderRegistry {
  private extractionProviders: Map<string, ExtractionProvider> = new Map();
  private comprehensionProviders: Map<string, ComprehensionProvider> = new Map();
  private visualizationProviders: Map<string, VisualizationProvider> = new Map();
  private initialized = false;

  // Register providers based on available API keys
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Extraction providers (in order of preference)
    const googleApiKey = process.env.GOOGLE_AI_API_KEY;
    if (googleApiKey) {
      this.extractionProviders.set('gemini', new GeminiExtractionProvider(googleApiKey));
    }

    // Add more extraction providers as needed:
    // if (process.env.HUNYUAN_API_URL) {
    //   this.extractionProviders.set('hunyuan', new HunyuanExtractionProvider(...));
    // }

    // Comprehension providers
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (openaiApiKey) {
      this.comprehensionProviders.set('openai', new OpenAIComprehensionProvider(openaiApiKey));
    }

    // Add Anthropic provider if key available
    // const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    // if (anthropicApiKey) {
    //   this.comprehensionProviders.set('anthropic', new AnthropicComprehensionProvider(anthropicApiKey));
    // }

    // Visualization (templates always available)
    this.visualizationProviders.set('templates', new TemplateVisualizationProvider());

    this.initialized = true;

    console.log('[ProviderRegistry] Initialized with:', {
      extraction: Array.from(this.extractionProviders.keys()),
      comprehension: Array.from(this.comprehensionProviders.keys()),
      visualization: Array.from(this.visualizationProviders.keys()),
    });
  }

  // Get best available extraction provider
  async getExtractionProvider(preferred?: string): Promise<ExtractionProvider> {
    await this.initialize();

    if (preferred && this.extractionProviders.has(preferred)) {
      const provider = this.extractionProviders.get(preferred)!;
      if (await provider.isAvailable()) return provider;
    }

    // Fallback to first available
    for (const [name, provider] of this.extractionProviders) {
      if (await provider.isAvailable()) {
        console.log(`[ProviderRegistry] Using extraction provider: ${name}`);
        return provider;
      }
    }

    throw new Error('No extraction provider available. Please set GOOGLE_AI_API_KEY.');
  }

  async getComprehensionProvider(preferred?: string): Promise<ComprehensionProvider> {
    await this.initialize();

    if (preferred && this.comprehensionProviders.has(preferred)) {
      const provider = this.comprehensionProviders.get(preferred)!;
      if (await provider.isAvailable()) return provider;
    }

    for (const [name, provider] of this.comprehensionProviders) {
      if (await provider.isAvailable()) {
        console.log(`[ProviderRegistry] Using comprehension provider: ${name}`);
        return provider;
      }
    }

    throw new Error('No comprehension provider available. Please set OPENAI_API_KEY.');
  }

  async getVisualizationProvider(preferred?: string): Promise<VisualizationProvider> {
    await this.initialize();

    // Templates are always available and preferred for consistency
    if (!preferred || preferred === 'templates') {
      return this.visualizationProviders.get('templates')!;
    }

    if (this.visualizationProviders.has(preferred)) {
      const provider = this.visualizationProviders.get(preferred)!;
      if (await provider.isAvailable()) return provider;
    }

    return this.visualizationProviders.get('templates')!;
  }

  // List available providers
  listProviders(): {
    extraction: string[];
    comprehension: string[];
    visualization: string[];
  } {
    return {
      extraction: Array.from(this.extractionProviders.keys()),
      comprehension: Array.from(this.comprehensionProviders.keys()),
      visualization: Array.from(this.visualizationProviders.keys()),
    };
  }

  // Check if minimum providers are available
  async checkAvailability(): Promise<{
    ready: boolean;
    missing: string[];
  }> {
    await this.initialize();

    const missing: string[] = [];

    if (this.extractionProviders.size === 0) {
      missing.push('extraction (set GOOGLE_AI_API_KEY)');
    }

    if (this.comprehensionProviders.size === 0) {
      missing.push('comprehension (set OPENAI_API_KEY)');
    }

    return {
      ready: missing.length === 0,
      missing,
    };
  }

  // Reset registry (useful for testing)
  reset(): void {
    this.extractionProviders.clear();
    this.comprehensionProviders.clear();
    this.visualizationProviders.clear();
    this.initialized = false;
  }
}

// Export singleton instance
export const providerRegistry = new ProviderRegistry();
