export interface PromptResponse {
  content: string;
  raw?: any; // Raw response from the provider
}

export interface PromptOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  template?: string;
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
  allowCustom?: boolean;
}

export interface ProviderConfig {
  name: string;
  configFields: ConfigField[];
}

export type ProviderName =
  | 'OpenAI'
  | 'Anthropic'
  | 'DeepSeek'
  | 'Google'
  | 'HuggingFace'
  | 'Ollama';

export const PROVIDER_MODELS = {
  OpenAI: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo-preview'],
  Anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'claude-2.1'],
  DeepSeek: ['deepseek-chat', 'deepseek-coder'],
  Google: ['gemini-pro', 'gemini-pro-vision'],
  HuggingFace: ['mistral-7b', 'llama-2', 'falcon-40b'],
  Ollama: ['deepseek-r1:8b', 'llama3.2', 'llama2', 'mistral', 'codellama', 'neural-chat'],
  Replicate: [
    'meta/llama-2-70b-chat',
    'meta/llama-2-13b-chat',
    'mistralai/mixtral-8x7b-instruct',
    'mistralai/mistral-7b-instruct',
    'anthropic/claude-2',
    'replicate/vicuna-13b',
  ],
  OpenRouter: [
    'openai/gpt-4-turbo-preview',
    'anthropic/claude-3-opus',
    'anthropic/claude-3-sonnet',
    'meta-llama/llama-2-70b-chat',
    'mistral-ai/mistral-large',
    'mistral-ai/mistral-medium',
    'google/gemini-pro',
    'google/palm-2-chat-bison',
  ],
} as const;

export interface LLMConfiguration {
  providers: {
    [key: string]: {
      config: Record<string, any>;
    };
  };
  defaultProvider: string | null;
}

export const DEFAULT_LLM_CONFIG: LLMConfiguration = {
  providers: {},
  defaultProvider: null,
};
