import { AnthropicProvider } from "./AnthropicProvider.js";
import { DeepSeekProvider } from "./DeepSeekProvider.js";
import { GoogleProvider } from "./GoogleProvider.js";
import { HuggingFaceProvider } from "./HuggingFaceProvider.js";
import { OllamaProvider } from "./OllamaProvider.js";
import { OllamaApiProvider } from "./OllamaApiProvider.js";
import { OpenAIProvider } from "./OpenAIProvider.js";
import { LLMInterface } from "./types.js";

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
    if (!providerName) {
      throw new Error(`Unknown provider: ${name}`);
    }

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
