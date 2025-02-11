import { AnthropicProvider } from "./AnthropicProvider";
import { DeepSeekProvider } from "./DeepSeekProvider";
import { GoogleProvider } from "./GoogleProvider";
import { HuggingFaceProvider } from "./HuggingFaceProvider";
import { OllamaProvider } from "./OllamaProvider";
import { OllamaApiProvider } from "./OllamaApiProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { LLMInterface } from "./types";

export const providers = {
  OpenAI: OpenAIProvider.providerConfig,
  Anthropic: AnthropicProvider.providerConfig,
  Google: GoogleProvider.providerConfig,
  DeepSeek: DeepSeekProvider.providerConfig,
  HuggingFace: HuggingFaceProvider.providerConfig,
  Ollama: OllamaProvider.providerConfig,
  OllamaApi: OllamaApiProvider.providerConfig,
};

export class LLMFactory {
  private static instances: Map<string, LLMInterface> = new Map();

  static getProvider(name: string): LLMInterface {
    const providerName = name.toLowerCase();

    if (!this.instances.has(providerName)) {
      switch (providerName) {
        case "openai":
          this.instances.set(providerName, new OpenAIProvider());
          break;
        case "anthropic":
          this.instances.set(providerName, new AnthropicProvider());
          break;
        case "google":
          this.instances.set(providerName, new GoogleProvider());
          break;
        case "deepseek":
          this.instances.set(providerName, new DeepSeekProvider());
          break;
        case "huggingface":
          this.instances.set(providerName, new HuggingFaceProvider());
          break;
        case "ollama":
          this.instances.set(providerName, new OllamaProvider());
          break;
        case "ollamaapi":
          this.instances.set(providerName, new OllamaApiProvider());
          break;
        default:
          throw new Error(`Unknown provider: ${name}`);
      }
    }

    return this.instances.get(providerName)!;
  }

  static getConfiguredProvider(): LLMInterface | null {
    for (const providerName of Object.keys(providers)) {
      console.log("LLM:", providerName);
      const llm = this.getProvider(providerName);
      if (llm.isConfigured()) {
        return llm;
      }
    }

    return null;
  }

  static getAvailableProviders(): string[] {
    return [
      "OpenAI",
      "Anthropic",
      "Google",
      "DeepSeek",
      "HuggingFace",
      "Ollama",
    ];
  }
}
