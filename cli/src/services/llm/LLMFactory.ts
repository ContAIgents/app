import { OpenAIProvider } from './OpenAIProvider';
import { AnthropicProvider } from './AnthropicProvider';
import { GoogleProvider } from './GoogleProvider';
import { DeepSeekProvider } from './DeepSeekProvider';
import { HuggingFaceProvider } from './HuggingFaceProvider';
import { OllamaProvider } from './OllamaProvider';
import { LLMInterface } from './types';

export class LLMFactory {
  private static instances: Map<string, LLMInterface> = new Map();

  static getProvider(name: string): LLMInterface {
    const providerName = name.toLowerCase();
    
    if (!this.instances.has(providerName)) {
      switch (providerName) {
        case 'openai':
          this.instances.set(providerName, new OpenAIProvider());
          break;
        case 'anthropic':
          this.instances.set(providerName, new AnthropicProvider());
          break;
        case 'google':
          this.instances.set(providerName, new GoogleProvider());
          break;
        case 'deepseek':
          this.instances.set(providerName, new DeepSeekProvider());
          break;
        case 'huggingface':
          this.instances.set(providerName, new HuggingFaceProvider());
          break;
        case 'ollama':
          this.instances.set(providerName, new OllamaProvider());
          break;
        default:
          throw new Error(`Unknown provider: ${name}`);
      }
    }

    return this.instances.get(providerName)!;
  }

  static getAvailableProviders(): string[] {
    return ['OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'HuggingFace', 'Ollama'];
  }
}
