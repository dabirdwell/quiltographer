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

export interface ProviderMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalLatency: number;
  totalCost: number;
  averageLatency: number;
}
