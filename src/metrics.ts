import { CacheMetrics } from "./types";

// Anthropic cache pricing multipliers relative to base input token price:
// cache writes cost 1.25x base, cache reads cost 0.1x base.
const CACHE_WRITE_MULTIPLIER = 1.25;
const CACHE_READ_MULTIPLIER = 0.1;

let cumulativeCostSaved = 0;

export function computeMetrics(
  usage: {
    input_tokens?: number;
    output_tokens?: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  },
  inputPricePerMillion: number
): CacheMetrics {
  const cacheCreationInputTokens = usage.cache_creation_input_tokens ?? 0;
  const cacheReadInputTokens = usage.cache_read_input_tokens ?? 0;
  const inputTokens = usage.input_tokens ?? 0;
  const outputTokens = usage.output_tokens ?? 0;

  const totalCachedTokens = cacheCreationInputTokens + cacheReadInputTokens;
  const totalRelevantTokens = inputTokens + totalCachedTokens;
  const cacheHitRate =
    totalRelevantTokens === 0 ? 0 : cacheReadInputTokens / totalRelevantTokens;

  const basePrice = inputPricePerMillion / 1_000_000;
  // What the cache-read tokens would have cost at full price, minus what they actually cost.
  const costWithoutCache = cacheReadInputTokens * basePrice;
  const costWithCache = cacheReadInputTokens * basePrice * CACHE_READ_MULTIPLIER;
  const estCostSaved = costWithoutCache - costWithCache;

  cumulativeCostSaved += estCostSaved;

  return {
    cacheCreationInputTokens,
    cacheReadInputTokens,
    inputTokens,
    outputTokens,
    cacheHitRate,
    tokensSaved: cacheReadInputTokens,
    estCostSaved,
    cumulativeCostSaved,
  };
}

export function resetCumulativeMetrics(): void {
  cumulativeCostSaved = 0;
}

const BOX_WIDTH = 58;

function bar(rate: number, width = 20): string {
  const filled = Math.round(rate * width);
  return "█".repeat(filled) + "▒".repeat(width - filled);
}

function row(content: string): string {
  return "│ " + content.padEnd(BOX_WIDTH - 1) + "│";
}

export function printMetrics(metrics: CacheMetrics): void {
  const hitPct = (metrics.cacheHitRate * 100).toFixed(0);
  const lines = [
    "┌" + "─".repeat(BOX_WIDTH) + "┐",
    row("CLAUDE CACHE METRICS"),
    "├" + "─".repeat(BOX_WIDTH) + "┤",
    row(`Cache Hit Rate:  ${bar(metrics.cacheHitRate)} ${hitPct}%`),
    row(`Tokens Saved:    ${metrics.tokensSaved.toLocaleString()} tokens`),
    row(`Est. Cost Saved: $${metrics.estCostSaved.toFixed(4)} (this turn)`),
    row(`Cumulative Saved: $${metrics.cumulativeCostSaved.toFixed(4)} this session`),
    "└" + "─".repeat(BOX_WIDTH) + "┘",
  ];
  console.log(lines.join("\n"));
}
