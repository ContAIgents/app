import { BaseLLM } from './BaseLLM';
import { PromptOptions, PromptResponse, ProviderConfig } from './types';

export class AnthropicProvider extends BaseLLM {
  static readonly providerConfig: ProviderConfig = {
    name: 'Anthropic',
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
          'claude-3-5-sonnet-20241022',
          'claude-3-5-sonnet-20240620',
          'claude-3-5-haiku-20241022',
          'claude-3-opus-20240229',
          'claude-3-haiku-20240307',
        ],
        default: 'claude-3-5-sonnet-20241022',
        allowCustom: true,
      },
    ],
  };

  private cliEndpoint = 'http://localhost:2668/api/llm/executePrompt';

  constructor() {
    super(AnthropicProvider.providerConfig);
  }

  private async tryCliEndpoint(
    prompt: string,
    options: PromptOptions = {}
  ): Promise<PromptResponse> {
    try {
      const response = await fetch(this.cliEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'anthropic',
          config: this.config,
          prompt,
          options,
        }),
      });

      if (!response.ok) {
        throw new Error('CLI endpoint failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('CLI endpoint unavailable, falling back to direct API call');
      throw error;
    }
  }

  async executePrompt(prompt: string, options: PromptOptions = {}): Promise<PromptResponse> {
    if (!this.isConfigured()) {
      throw new Error('Anthropic provider is not configured');
    }
    try {
      return await this.tryCliEndpoint(prompt, options);
    } catch (error) {
      // If CLI endpoint fails, fall back to direct API call

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options.maxTokens,
          temperature: options.temperature ?? 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();

      return {
        content: data.content[0].text,
        raw: data,
      };
    }
  }
}
