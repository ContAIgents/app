import { BaseLLM } from './BaseLLM';
import { PromptOptions, PromptResponse, ProviderConfig } from './types';

export class ReplicateProvider extends BaseLLM {
  static readonly providerConfig: ProviderConfig = {
    name: 'Replicate',
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
          'meta/llama-2-70b-chat',
          'meta/llama-2-13b-chat',
          'mistralai/mixtral-8x7b-instruct',
          'mistralai/mistral-7b-instruct',
          'anthropic/claude-2',
          'replicate/vicuna-13b'
        ],
        default: 'meta/llama-2-70b-chat',
        allowCustom: true, // Allow custom model input
      },
    ],
  };

  constructor() {
    super(ReplicateProvider.providerConfig);
  }

  async executePrompt(prompt: string, options: PromptOptions = {}): Promise<PromptResponse> {
    if (!this.isConfigured()) {
      throw new Error('Replicate provider is not configured');
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
