import Anthropic from "@anthropic-ai/sdk";

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const MODEL = "claude-3-7-sonnet-20250219";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function generateText(prompt: string, options: {
  maxTokens?: number;
  temperature?: number;
  system?: string;
}) {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature || 0.7,
      system: options.system,
      messages: [{ role: "user", content: prompt }],
    });

    return response.content[0].text;
  } catch (error) {
    console.error("Error generating text with Anthropic:", error);
    throw error;
  }
}

export default anthropic;
