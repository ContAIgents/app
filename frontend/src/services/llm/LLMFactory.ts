import { AnthropicProvider } from './AnthropicProvider';
import { DeepSeekProvider } from './DeepSeekProvider';
import { DummyLLM } from './DummyLLM';
import { GoogleProvider } from './GoogleProvider';
import { HuggingFaceProvider } from './HuggingFaceProvider';
import { OllamaProvider } from './OllamaProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { ReplicateProvider } from './ReplicateProvider';
import { OpenRouterProvider } from './OpenRouterProvider';
import { LLMInterface, LLMConfiguration, DEFAULT_LLM_CONFIG } from './types';

const LLM_CONFIG_KEY = 'llm_configurations';

export class LLMFactory {
  private static instances: Map<string, LLMInterface> = new Map();

  static getDefaultProvider(): LLMInterface | null {
    if (process.env.USE_DUMMY_LLM) {
      return new DummyLLM();
    }

    const config = this.getConfigurations();
    if (config.defaultProvider) {
      try {
        const provider = this.getProvider(config.defaultProvider);
        if (provider.isConfigured()) {
          return provider;
        }
      } catch (error) {
        console.error(`Error getting default provider ${config.defaultProvider}:`, error);
      }
    }

    // Fall back to first configured provider
    const configuredProvider = Object.keys(config.providers).find(name => {
      const provider = this.getProvider(name);
      return provider.isConfigured();
    });

    return configuredProvider ? this.getProvider(configuredProvider) : null;
  }

  static setDefaultProvider(providerName: string): void {
    const config = this.getConfigurations();
    config.defaultProvider = providerName;
    localStorage.setItem(LLM_CONFIG_KEY, JSON.stringify(config));
  }

  static getConfigurations(): LLMConfiguration {
    try {
      const saved = localStorage.getItem(LLM_CONFIG_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_LLM_CONFIG;
    } catch (error) {
      console.error('Failed to load LLM configurations:', error);
      return DEFAULT_LLM_CONFIG;
    }
  }

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
        case 'replicate':
          this.instances.set(providerName, new ReplicateProvider());
          break;
        case 'openrouter':
          this.instances.set(providerName, new OpenRouterProvider());
          break;
        default:
          throw new Error(`Unknown provider: ${name}`);
      }
    }

    return this.instances.get(providerName)!;
  }

  static getAvailableProviders(): string[] {
    return [
      'OpenAI',
      'Anthropic',
      'Google',
      'DeepSeek',
      'HuggingFace',
      'Ollama',
      'Replicate',
      'OpenRouter'
    ];
  }
}
