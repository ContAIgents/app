import { BaseLLM } from "./BaseLLM";
import { PromptOptions, PromptResponse, ProviderConfig } from "./types";

export class OllamaApiProvider extends BaseLLM {
  static readonly providerConfig: ProviderConfig = {
    name: "OllamaApi",
    configFields: [
      {
        name: "endpoint",
        required: true,
        default: "http://localhost:11434",
      },
      {
        name: "model",
        required: true,
        options: [
          "deepseek-r1:8b",
          "llama3.2",
          "llama2",
          "mistral",
          "codellama",
          "neural-chat",
        ],
        default: "deepseek-r1:8b",
      },
    ],
  };

  constructor() {
    super(OllamaApiProvider.providerConfig);
  }

  async executePrompt(
    prompt: string,
    systemPrompt?: string,
    template?: string,
    options: PromptOptions = {}
  ): Promise<PromptResponse> {
    await this.loadConfig();
    if (!this.isConfigured()) {
      throw new Error("OllamaApi provider is not configured");
    }

    const response = await fetch(`${this.config.endpoint}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.model,
        prompt: prompt,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Ollama API error: ${error.error || "Unknown error"}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get reader from response body");
    }

    const decoder = new TextDecoder();
    let result = "";
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const resp = decoder.decode(value, { stream: true });
        const jsonResp = JSON.parse(resp);
        console.log("Partial response:", jsonResp.response);
        result += jsonResp.response;
      }
    }
    // split the response -> Between <think> and </think -> Rest of the response
    const thinkTag = "<think>";
    const thinkEndTag = "</think>";
    let thinkPart = "";
    let responsePart = "";

    if (result.includes(thinkTag) && result.includes(thinkEndTag)) {
      thinkPart = result.split(thinkTag)[1]?.split(thinkEndTag)[0] || "";
      responsePart = result.split(thinkEndTag)[1] || "";
    } else {
      responsePart = result;
    }

    return {
      reason: thinkPart.replace(/[\n\t]/g, ""),
      content: responsePart.replace(/[\n\t]/g, ""),
      raw: result,
    };
  }
}
