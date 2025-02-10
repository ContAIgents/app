import { BaseLLM } from "./BaseLLM";
import { PromptOptions, PromptResponse, ProviderConfig } from "./types";

export class DeepSeekProvider extends BaseLLM {
  static readonly providerConfig: ProviderConfig = {
    name: "DeepSeek",
    configFields: [
      {
        name: "apiKey",
        required: true,
      },
      {
        name: "model",
        required: true,
        options: ["deepseek-chat", "deepseek-coder"],
        default: "deepseek-chat",
      },
    ],
  };

  constructor() {
    super(DeepSeekProvider.providerConfig);
  }

  async executePrompt(
    prompt: string,
    options: PromptOptions = {}
  ): Promise<PromptResponse> {
    if (!this.isConfigured()) {
      throw new Error("DeepSeek provider is not configured");
    }

    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
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
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `DeepSeek API error: ${error.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      raw: data,
    };
  }
}
