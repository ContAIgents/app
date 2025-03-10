import { BaseLLM } from './BaseLLM';
import { PromptOptions, PromptResponse, ProviderConfig } from './types';

export class OpenRouterProvider extends BaseLLM {
  static readonly providerConfig: ProviderConfig = {
    name: 'OpenRouter',
    configFields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
      },
      {
        name: 'model',
        label: 'Model',
        type: 'select',
        required: true,
        options: [
          'openai/gpt-4-turbo-preview',
          'anthropic/claude-3-opus',
          'anthropic/claude-3-sonnet',
          'meta-llama/llama-2-70b-chat',
          'mistral-ai/mistral-large',
          'mistral-ai/mistral-medium',
          'google/gemini-pro',
          'google/palm-2-chat-bison'
        ],
        default: 'openai/gpt-4-turbo-preview',
        allowCustom: true, // Allow custom model input
      },
    ],
  };

  constructor() {
    super(OpenRouterProvider.providerConfig);
  }

  async executePrompt(prompt: string, options: PromptOptions = {}): Promise<PromptResponse> {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter provider is not configured');
    }
    
    // Implementation will be handled by the backend
    return {
      content: '',
      raw: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      }
    };
  }
}
