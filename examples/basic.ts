import { ClaudeCache } from "../src/index";

async function main() {
  const client = new ClaudeCache({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const systemDocs = `You are a helpful assistant with deep knowledge of this 5,000-token
codebase documentation brief that we want cached across turns...`;

  const { response, metrics } = await client.createWithCache({
    model: "claude-3-5-sonnet-20241022",
    systemDocs,
    messages: [{ role: "user", content: "Summarize step 3 of the docs." }],
  });

  console.log(response.content);
  console.log(metrics);
}

main();
