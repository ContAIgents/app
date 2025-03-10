import { LLMInterface, PromptOptions, PromptResponse, ProviderConfig, LLMConfiguration, DEFAULT_LLM_CONFIG } from './types';

const LLM_CONFIG_KEY = 'llm_configurations';

export abstract class BaseLLM implements LLMInterface {
  protected config: Record<string, any> = {};

  constructor(protected readonly providerConfig: ProviderConfig) {
    this.loadConfig();
  }

  abstract executePrompt(prompt: string, options?: PromptOptions): Promise<PromptResponse>;

  async executePrompts(prompts: string[], options?: PromptOptions): Promise<PromptResponse[]> {
    return Promise.all(prompts.map(prompt => this.executePrompt(prompt, options)));
  }

  configure(config: Record<string, any>): void {
    this.config = config;
    const allConfig = this.getAllConfigurations();
    allConfig.providers[this.providerConfig.name] = { config };
    localStorage.setItem(LLM_CONFIG_KEY, JSON.stringify(allConfig));
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
    const allConfig = this.getAllConfigurations();
    const providerConfig = allConfig.providers[this.providerConfig.name];
    if (providerConfig) {
      this.config = providerConfig.config;
    }
  }

  protected getAllConfigurations(): LLMConfiguration {
    try {
      const saved = localStorage.getItem(LLM_CONFIG_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_LLM_CONFIG;
    } catch (error) {
      console.error('Failed to load LLM configurations:', error);
      return DEFAULT_LLM_CONFIG;
    }
  }
}
