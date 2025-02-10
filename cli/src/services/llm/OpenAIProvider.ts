import { BaseLLM } from "./BaseLLM";
import { PromptOptions, PromptResponse, ProviderConfig } from "./types";

export class OpenAIProvider extends BaseLLM {
  static readonly providerConfig: ProviderConfig = {
    name: "OpenAI",
    configFields: [
      {
        name: "apiKey",
        required: true,
      },
      {
        name: "model",
        required: true,
        options: ["gpt-4", "gpt-3.5-turbo", "gpt-4-turbo-preview"],
        default: "gpt-4",
      },
    ],
  };

  constructor() {
    super(OpenAIProvider.providerConfig);
  }

  async executePrompt(
    prompt: string,
    options: PromptOptions = {}
  ): Promise<PromptResponse> {
    if (!this.isConfigured()) {
      throw new Error("OpenAI provider is not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [{ role: "user", content: prompt }],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `OpenAI API error: ${error.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      raw: data,
    };
  }
}
