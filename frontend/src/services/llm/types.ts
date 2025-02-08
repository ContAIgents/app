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
  allowCustom?: boolean;  // New field to allow custom input
}

export interface ProviderConfig {
  name: string;
  configFields: ConfigField[];
}

export type ProviderName = 'OpenAI' | 'Anthropic' | 'DeepSeek' | 'Google' | 'HuggingFace' | 'Ollama';

export const PROVIDER_MODELS = {
  OpenAI: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo-preview'],
  Anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'claude-2.1'],
  DeepSeek: ['deepseek-chat', 'deepseek-coder'],
  Google: ['gemini-pro', 'gemini-pro-vision'],
  HuggingFace: ['mistral-7b', 'llama-2', 'falcon-40b'],
  Ollama: ['llama2', 'mistral', 'codellama', 'neural-chat']
} as const;
