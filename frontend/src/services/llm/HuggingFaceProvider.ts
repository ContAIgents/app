import { BaseLLM } from './BaseLLM';
import { PromptOptions, PromptResponse, ProviderConfig } from './types';

export class HuggingFaceProvider extends BaseLLM {
  static readonly providerConfig: ProviderConfig = {
    name: 'HuggingFace',
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
        options: ['mistral-7b', 'llama-2', 'falcon-40b'],
        default: 'mistral-7b',
        allowCustom: true,
      },
    ],
  };

  constructor() {
    super(HuggingFaceProvider.providerConfig);
  }

  async executePrompt(prompt: string, options: PromptOptions = {}): Promise<PromptResponse> {
    if (!this.isConfigured()) {
      throw new Error('HuggingFace provider is not configured');
    }

    const response = await fetch(`https://api-inference.huggingface.co/models/${this.config.model}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          temperature: options.temperature ?? 0.7,
          max_new_tokens: options.maxTokens,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HuggingFace API error: ${error.error || 'Unknown error'}`);
    }

    const data = await response.json();
    
    return {
      content: Array.isArray(data) ? data[0].generated_text : data.generated_text,
      raw: data,
    };
  }
}
