import { describe, it, expect, beforeEach } from "vitest";
import { computeMetrics, resetCumulativeMetrics } from "./metrics";

describe("computeMetrics", () => {
  beforeEach(() => {
    resetCumulativeMetrics();
  });

  it("computes a 0% hit rate when there is no cache usage", () => {
    const metrics = computeMetrics(
      { input_tokens: 100, output_tokens: 50 },
      3
    );
    expect(metrics.cacheHitRate).toBe(0);
    expect(metrics.tokensSaved).toBe(0);
    expect(metrics.estCostSaved).toBe(0);
  });

  it("computes a positive hit rate and cost savings on a cache hit", () => {
    const metrics = computeMetrics(
      {
        input_tokens: 10,
        output_tokens: 50,
        cache_read_input_tokens: 4600,
      },
      3
    );
    expect(metrics.cacheHitRate).toBeCloseTo(4600 / 4610, 5);
    expect(metrics.tokensSaved).toBe(4600);
    // 4600 tokens * ($3/1M) * (1 - 0.1) savings multiplier
    expect(metrics.estCostSaved).toBeCloseTo(4600 * (3 / 1_000_000) * 0.9, 8);
  });

  it("accumulates cumulative cost saved across calls", () => {
    const first = computeMetrics({ cache_read_input_tokens: 1000 }, 3);
    const second = computeMetrics({ cache_read_input_tokens: 1000 }, 3);
    expect(second.cumulativeCostSaved).toBeCloseTo(first.estCostSaved * 2, 8);
  });

  it("treats cache_creation_input_tokens as part of the relevant token pool", () => {
    const metrics = computeMetrics(
      { input_tokens: 0, cache_creation_input_tokens: 5000, cache_read_input_tokens: 0 },
      3
    );
    expect(metrics.cacheHitRate).toBe(0);
    expect(metrics.cacheCreationInputTokens).toBe(5000);
  });
});
