import Anthropic from "@anthropic-ai/sdk";
import { CreateWithCacheParams, ClaudeCacheOptions, CacheMetrics } from "./types";
import { computeMetrics, printMetrics } from "./metrics";
import { printVolatileWarnings } from "./warnings";

const DEFAULT_SONNET_INPUT_PRICE_PER_MILLION = 3;

export class ClaudeCache {
  private client: Anthropic;
  private inputPricePerMillion: number;

  constructor(options: ClaudeCacheOptions) {
    this.client = new Anthropic({ apiKey: options.apiKey });
    this.inputPricePerMillion =
      options.inputPricePerMillion ?? DEFAULT_SONNET_INPUT_PRICE_PER_MILLION;
  }

  async createWithCache(
    params: CreateWithCacheParams
  ): Promise<{ response: Anthropic.Message; metrics: CacheMetrics }> {
    const { model, maxTokens = 1024, systemDocs, tools, messages, temperature, logMetrics = true } =
      params;

    if (systemDocs) {
      printVolatileWarnings(systemDocs);
    }

    const system = systemDocs
      ? [
          {
            type: "text" as const,
            text: systemDocs,
            cache_control: { type: "ephemeral" as const },
          },
        ]
      : undefined;

    const response = await this.client.messages.create({
      model,
      max_tokens: maxTokens,
      system,
      tools,
      temperature,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const metrics = computeMetrics(response.usage as any, this.inputPricePerMillion);

    if (logMetrics) {
      printMetrics(metrics);
    }

    return { response, metrics };
  }
}

export * from "./types";
export { computeMetrics, printMetrics, resetCumulativeMetrics } from "./metrics";
export { detectVolatileContent, printVolatileWarnings } from "./warnings";
