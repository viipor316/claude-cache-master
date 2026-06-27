export interface CreateWithCacheParams {
  model: string;
  maxTokens?: number;
  systemDocs?: string;
  tools?: any[];
  messages: { role: "user" | "assistant"; content: string }[];
  temperature?: number;
  logMetrics?: boolean;
}

export interface CacheMetrics {
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
  inputTokens: number;
  outputTokens: number;
  cacheHitRate: number;
  tokensSaved: number;
  estCostSaved: number;
  cumulativeCostSaved: number;
}

export interface ClaudeCacheOptions {
  apiKey: string;
  /** USD price per 1M base input tokens, used to estimate cache savings. Defaults to Sonnet pricing. */
  inputPricePerMillion?: number;
}
