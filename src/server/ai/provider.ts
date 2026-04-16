import "server-only";

export class NoProviderError extends Error {
  constructor() {
    super("No AI provider configured");
    this.name = "NoProviderError";
  }
}

const RETRY_DELAY_MS = 2000;

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callAnthropic(
  systemPrompt: string,
  userContent: string
): Promise<string> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userContent }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Anthropic returned no text content");
  }
  return textBlock.text;
}

async function callOpenAI(
  systemPrompt: string,
  userContent: string
): Promise<string> {
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    max_tokens: 4096,
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned no content");
  return content;
}

/**
 * Calls the configured AI provider with retry on rate limit (429).
 * Provider priority: Anthropic → OpenAI → throws NoProviderError
 * Never logs API keys or prompt content.
 */
export async function callAI(
  systemPrompt: string,
  userContent: string
): Promise<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (anthropicKey) {
    try {
      console.log("[ai] Using Anthropic provider");
      return await callAnthropic(systemPrompt, userContent);
    } catch (err: unknown) {
      if (isRateLimitError(err)) {
        console.log("[ai] Anthropic rate limited, retrying after delay...");
        await delay(RETRY_DELAY_MS);
        return await callAnthropic(systemPrompt, userContent);
      }
      throw err;
    }
  }

  if (openaiKey) {
    try {
      console.log("[ai] Using OpenAI provider");
      return await callOpenAI(systemPrompt, userContent);
    } catch (err: unknown) {
      if (isRateLimitError(err)) {
        console.log("[ai] OpenAI rate limited, retrying after delay...");
        await delay(RETRY_DELAY_MS);
        return await callOpenAI(systemPrompt, userContent);
      }
      throw err;
    }
  }

  throw new NoProviderError();
}

function isRateLimitError(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes("rate limit") ||
      msg.includes("429") ||
      msg.includes("too many requests")
    );
  }
  return false;
}
