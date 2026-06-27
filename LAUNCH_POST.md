# X / Twitter post

Writing Anthropic prompt-caching boilerplate sucks, so I built a zero-config wrapper for it.

npm install claude-cache-master

before:
```
system: [{ type: "text", text: docs, cache_control: { type: "ephemeral" } }]
```

after:
```
client.createWithCache({ systemDocs: docs, messages })
```

→ prints your cache hit-rate + $ saved in the terminal
→ warns you if a timestamp/UUID snuck into a cached block and silently killed your hit rate

github.com/viipor316/claude-cache-master

#ClaudeAI #buildinpublic

---

# Anthropic Discord post (#projects channel)

**claude-cache-master** — a tiny zero-config wrapper around `@anthropic-ai/sdk` for prompt caching

Prompt caching can cut input costs up to 90%, but the boilerplate (multi-block `system` arrays, `cache_control` breakpoints, remembering to check `cache_read_input_tokens`) is easy to get wrong, and a cache miss fails *silently* — no error, just a bigger bill.

This package:
- wraps the multi-block structure in one call: `client.createWithCache({ systemDocs, messages })`
- prints a terminal summary of cache hit-rate and estimated $ saved per call
- scans content marked for caching and warns if it contains a timestamp/UUID that will bust the cache prefix match

```ts
import { ClaudeCache } from "claude-cache-master";

const client = new ClaudeCache({ apiKey: process.env.ANTHROPIC_API_KEY! });

const { response, metrics } = await client.createWithCache({
  model: "claude-3-5-sonnet-20241022",
  systemDocs: "...5,000 tokens of static docs...",
  messages: [{ role: "user", content: "Summarize step 3." }],
});
```

npm: https://www.npmjs.com/package/claude-cache-master
repo: https://github.com/viipor316/claude-cache-master

Built this in a weekend — feedback, issues, and PRs very welcome. Python parity is on the roadmap if there's interest.

---

# r/LocalLLaMA / r/LanguageTechnology post

**Title:** I got tired of writing Claude prompt-caching boilerplate, so I open-sourced a wrapper for it

Prompt caching on the Claude API is one of the best cost levers available (up to 90% off input tokens on cache hits), but:
1. the multi-block `system` array + `cache_control` structure is verbose
2. if you accidentally put something volatile (timestamp, UUID, session id) inside the cached block, the cache silently breaks — no error, just a bigger bill, and it's easy to miss

`claude-cache-master` wraps the Anthropic SDK to fix both: one-call caching, a terminal printout of hit-rate/cost savings per request, and static-analysis warnings for volatile content inside cached blocks.

MIT licensed, ~150 lines of TS, tested with vitest, CI on GitHub Actions.

repo: https://github.com/viipor316/claude-cache-master
npm: https://www.npmjs.com/package/claude-cache-master

Happy to take feedback on the cost-estimate math or additional volatile-pattern detection rules.
