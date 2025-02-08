import { BaseLLM } from './BaseLLM';
import { PromptOptions, PromptResponse, ProviderConfig } from './types';

export class OllamaProvider extends BaseLLM {
  static readonly providerConfig: ProviderConfig = {
    name: 'Ollama',
    configFields: [
      {
        name: 'endpoint',
        label: 'Endpoint URL',
        type: 'url',
        required: true,
        default: 'http://localhost:11434',
      },
      {
        name: 'model',
        label: 'Model',
        type: 'select',
        required: true,
        options: ['llama2', 'mistral', 'codellama', 'neural-chat'],
        default: 'llama2',
        allowCustom: true, // Allow custom model input
      },
    ],
  };

  constructor() {
    super(OllamaProvider.providerConfig);
  }

  async executePrompt(prompt: string, options: PromptOptions = {}): Promise<PromptResponse> {
    if (!this.isConfigured()) {
      throw new Error('Ollama provider is not configured');
    }

    const response = await fetch(`${this.config.endpoint}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
      throw new Error(`Ollama API error: ${error.error || 'Unknown error'}`);
    }

    const data = await response.json();
    
    return {
      content: data.response,
      raw: data,
    };
  }
}
