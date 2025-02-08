import { OpenAIProvider } from './OpenAIProvider';
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
        default:
          throw new Error(`Unknown provider: ${name}`);
      }
    }

    return this.instances.get(providerName)!;
  }

  static getAvailableProviders(): string[] {
    return ['OpenAI']; // Add more as they're implemented
  }
}