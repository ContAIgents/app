import { ReplicateProvider } from './ReplicateProvider';
import { OpenRouterProvider } from './OpenRouterProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { AnthropicProvider } from './AnthropicProvider';
import { GoogleProvider } from './GoogleProvider';
import { DeepSeekProvider } from './DeepSeekProvider';
import { HuggingFaceProvider } from './HuggingFaceProvider';
import { OllamaProvider } from './OllamaProvider';
import { ProviderConfig } from './types';

export const providerRegistry = {
  OpenAI: OpenAIProvider,
  Anthropic: AnthropicProvider,
  Google: GoogleProvider,
  DeepSeek: DeepSeekProvider,
  HuggingFace: HuggingFaceProvider,
  Ollama: OllamaProvider,
  Replicate: ReplicateProvider,
  OpenRouter: OpenRouterProvider,
} as const;

export type ProviderName = keyof typeof providerRegistry;

export const getProviderConfigs = (): Record<string, ProviderConfig> => {
  return Object.fromEntries(
    Object.entries(providerRegistry).map(([name, Provider]) => [
      name,
      Provider.providerConfig
    ])
  );
};

export const getProviderModels = (): Record<string, string[]> => {
  return Object.fromEntries(
    Object.entries(providerRegistry).map(([name, Provider]) => [
      name,
      Provider.providerConfig.configFields.find(field => field.name === 'model')?.options || []
    ])
  );
};