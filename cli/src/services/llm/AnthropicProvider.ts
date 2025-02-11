import { BaseLLM } from "./BaseLLM";
import { PromptOptions, PromptResponse, ProviderConfig } from "./types";

export class AnthropicProvider extends BaseLLM {
  static readonly providerConfig: ProviderConfig = {
    name: "Anthropic",
    configFields: [
      {
        name: "apiKey",
        required: true,
      },
      {
        name: "model",
        required: true,
        options: [
          "claude-3-opus",
          "claude-3-sonnet",
          "claude-3-haiku",
          "claude-2.1",
        ],
        default: "claude-3-opus",
      },
    ],
  };

  constructor() {
    super(AnthropicProvider.providerConfig);
  }

  async executePrompt(
    prompt: string,
    systemPrompt?: string,
    template?: string,
    options: PromptOptions = {}
  ): Promise<PromptResponse> {
    if (!this.isConfigured()) {
      throw new Error("Anthropic provider is not configured");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: options.maxTokens,
        temperature: options.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Anthropic API error: ${error.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();

    return {
      content: data.content[0].text,
      raw: data,
    };
  }
}
