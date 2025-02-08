import { LLMInterface, PromptOptions, PromptResponse, ProviderConfig } from './types';

export abstract class BaseLLM implements LLMInterface {
  protected config: Record<string, any> = {};
  protected readonly storageKey: string;

  constructor(protected readonly providerConfig: ProviderConfig) {
    this.storageKey = `llm_config_${providerConfig.name.toLowerCase()}`;
    this.loadConfig();
  }

  abstract executePrompt(prompt: string, options?: PromptOptions): Promise<PromptResponse>;

  async executePrompts(prompts: string[], options?: PromptOptions): Promise<PromptResponse[]> {
    return Promise.all(prompts.map(prompt => this.executePrompt(prompt, options)));
  }

  configure(config: Record<string, any>): void {
    this.config = config;
    localStorage.setItem(this.storageKey, JSON.stringify(config));
  }

  getConfig(): Record<string, any> {
    return this.config;
  }

  isConfigured(): boolean {
    return this.providerConfig.configFields
      .filter(field => field.required)
      .every(field => Boolean(this.config[field.name]));
  }

  protected loadConfig(): void {
    const savedConfig = localStorage.getItem(this.storageKey);
    if (savedConfig) {
      try {
        this.config = JSON.parse(savedConfig);
      } catch (error) {
        console.error('Failed to load config from localStorage:', error);
        this.config = {};
      }
    }
  }
}