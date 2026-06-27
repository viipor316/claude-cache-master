# claude-cache-master

A zero-config wrapper around the Anthropic SDK that makes **Claude prompt caching** dead simple — with built-in cost-savings tracking and cache-invalidation warnings.

Prompt caching can cut your Claude API input costs by up to 90%, but wiring up the multi-block message structure and `cache_control` breakpoints by hand is tedious and easy to get wrong. This package handles the structure for you and prints exactly how much you're saving.

## Install

```bash
npm install claude-cache-master
```

## Before / After

**Without claude-cache-master:**

```ts
const response = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  system: [
    {
      type: "text",
      text: "This is a massive 5,000 token documentation brief...",
      cache_control: { type: "ephemeral" },
    },
  ],
  messages: [{ role: "user", content: "Analyze step 3." }],
});
```

**With claude-cache-master:**

```ts
import { ClaudeCache } from "claude-cache-master";

const client = new ClaudeCache({ apiKey: process.env.ANTHROPIC_API_KEY! });

const { response, metrics } = await client.createWithCache({
  model: "claude-3-5-sonnet-20241022",
  systemDocs: "This is a massive 5,000 token documentation brief...",
  messages: [{ role: "user", content: "Analyze step 3." }],
});
```

## What you get

### Terminal cost-savings tracker

Every call prints a summary of cache hit rate and estimated dollars saved:

```
┌────────────────────────────────────────────────────────┐
│  CLAUDE CACHE METRICS                                   │
├────────────────────────────────────────────────────────┤
│  Cache Hit Rate:  ████████████████████ 92%              │
│  Tokens Saved:    4,600 tokens                          │
│  Est. Cost Saved: $0.0138 (this turn)                   │
│  Cumulative Saved: $4.2100 this session                 │
└────────────────────────────────────────────────────────┘
```

### Smart invalidation warnings

Prompt caching requires an exact prefix match. If you accidentally put a moving timestamp or UUID inside a cached block, the cache breaks silently on every call. `claude-cache-master` scans cached content and warns you up front:

```
[ClaudeCache Warning]: You included what looks like a timestamp inside a cached block.
This will break the cache prefix match on every request and cause a 100% cache miss rate.
```

## API

### `new ClaudeCache(options)`

| option | type | description |
|---|---|---|
| `apiKey` | `string` | Your Anthropic API key |
| `inputPricePerMillion` | `number?` | Base input token price used for cost estimates (defaults to Sonnet pricing, $3/M) |

### `client.createWithCache(params)`

| param | type | description |
|---|---|---|
| `model` | `string` | Claude model id |
| `systemDocs` | `string?` | Static content to mark as an ephemeral cache breakpoint |
| `messages` | `{role, content}[]` | Conversation messages |
| `maxTokens` | `number?` | Defaults to 1024 |
| `tools` | `any[]?` | Tool definitions, passed through |
| `temperature` | `number?` | Passed through |
| `logMetrics` | `boolean?` | Set `false` to suppress the terminal metrics printout |

Returns `{ response, metrics }` — `response` is the raw Anthropic SDK message, `metrics` is a `CacheMetrics` object you can log or assert on in tests.

## Why

Prompt caching is one of the highest-leverage cost optimizations available on the Claude API, but the boilerplate and silent-failure modes (cache busted by a stray timestamp) make it easy to get wrong without noticing. This package exists to make the happy path the easy path.

## Contributing

PRs welcome — especially for additional cache-busting pattern detection, Python parity, and richer metrics (e.g. per-session cost dashboards).

## License

MIT
