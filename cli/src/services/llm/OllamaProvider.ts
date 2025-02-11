import { BaseLLM } from "./BaseLLM";
import { PromptOptions, PromptResponse, ProviderConfig } from "./types";
import ollama from "ollama";

export class OllamaProvider extends BaseLLM {
  static readonly providerConfig: ProviderConfig = {
    name: "Ollama",
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
      {
        name: "stream",
        required: false,
        options: [true, false],
        default: true,
      },
    ],
  };

  constructor() {
    super(OllamaProvider.providerConfig);
  }

  async executePrompt(
    prompt: string,
    systemPrompt?: string,
    template?: string,
    options: PromptOptions = {}
  ): Promise<PromptResponse> {
    await this.loadConfig();
    if (!this.isConfigured()) {
      throw new Error("Ollama provider is not configured");
    }

    const { model, stream } = this.config;
    let result = "";
    console.log("stream: ", stream);
    if (stream) {
      const response = await ollama.generate({
        model,
        prompt,
        stream,
        system: systemPrompt,
        template: template,
      });
      for await (const part of response) {
        result += part.response;
      }
    } else {
      const response = await ollama.generate({
        model,
        prompt,
        system: systemPrompt,
        template: template,
      });
      result = response.response;
    }

    const thinkTag = "<think>";
    const thinkEndTag = "</think>";
    const thinkPart =
      result.includes(thinkTag) && result.includes(thinkEndTag)
        ? result.split(thinkTag)[1]?.split(thinkEndTag)[0] || ""
        : "";
    const responsePart = result.includes(thinkEndTag)
      ? result.split(thinkEndTag)[1] || ""
      : result;

    return {
      reason: thinkPart.replace(/[\n\t]/g, ""),
      content: responsePart.replace(/[\n\t]/g, ""),
      raw: result,
    };
  }
}
