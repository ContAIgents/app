import { BaseLLM } from "./BaseLLM";
import { PromptOptions, PromptResponse, ProviderConfig } from "./types";

export class GoogleProvider extends BaseLLM {
  static readonly providerConfig: ProviderConfig = {
    name: "Google",
    configFields: [
      {
        name: "apiKey",
        required: true,
      },
      {
        name: "model",
        required: true,
        options: ["gemini-pro", "gemini-pro-vision"],
        default: "gemini-pro",
      },
    ],
  };

  constructor() {
    super(GoogleProvider.providerConfig);
  }

  async executePrompt(
    prompt: string,
    systemPrompt?: string,
    template?: string,
    options: PromptOptions = {}
  ): Promise<PromptResponse> {
    if (!this.isConfigured()) {
      throw new Error("Google provider is not configured");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${this.config.model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options.temperature ?? 0.7,
            maxOutputTokens: options.maxTokens,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Google API error: ${error.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();

    return {
      content: data.candidates[0].content.parts[0].text,
      raw: data,
    };
  }
}
