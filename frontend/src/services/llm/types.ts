export interface PromptResponse {
  content: string;
  raw?: any; // Raw response from the provider
}

export interface PromptOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface LLMInterface {
  configure(config: Record<string, any>): void;
  executePrompt(prompt: string, options?: PromptOptions): Promise<PromptResponse>;
  executePrompts(prompts: string[], options?: PromptOptions): Promise<PromptResponse[]>;
  getConfig(): Record<string, any>;
  isConfigured(): boolean;
}

export interface ConfigField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'select';
  required: boolean;
  options?: string[];
  default?: string;
}

export interface ProviderConfig {
  name: string;
  configFields: ConfigField[];
}