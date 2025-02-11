import { BaseLLM } from './BaseLLM';
import { PromptOptions, PromptResponse, ProviderConfig } from './types';

export class GoogleProvider extends BaseLLM {
  static readonly providerConfig: ProviderConfig = {
    name: 'Google',
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
          'gemini-2.0-flash',
          'gemini-2.0-flash-lite-preview-02-05',
          'gemini-1.5-flash',
          'gemini-1.5-flash-8b',
          'gemini-1.5-pro',
          'gemini-1.0-pro',
        ],
        default: 'gemini-pro',
      },
    ],
  };

  constructor() {
    super(GoogleProvider.providerConfig);
  }

  async executePrompt(prompt: string, options: PromptOptions = {}): Promise<PromptResponse> {
    if (!this.isConfigured()) {
      throw new Error('Google provider is not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,

      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options.temperature ?? 0.7,
            maxOutputTokens: options.maxTokens,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    return {
      content: data.candidates[0].content.parts[0].text,
      raw: data,
    };
  }
}
