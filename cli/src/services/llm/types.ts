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
  executePrompt(
    prompt: string,
    options?: PromptOptions
  ): Promise<PromptResponse>;
  executePrompts(
    prompts: string[],
    options?: PromptOptions
  ): Promise<PromptResponse[]>;
  getConfig(): Record<string, any>;
  isConfigured(): boolean;
}

export interface ConfigField {
  name: string;
  required: boolean;
  options?: string[];
  default?: string;
}

export interface ProviderConfig {
  name: string;
  configFields: ConfigField[];
}

export type ProviderName =
  | "OpenAI"
  | "Anthropic"
  | "DeepSeek"
  | "Google"
  | "HuggingFace"
  | "Ollama";

export const PROVIDER_MODELS = {
  OpenAI: ["gpt-4", "gpt-3.5-turbo", "gpt-4-turbo-preview"],
  Anthropic: [
    "claude-3-opus",
    "claude-3-sonnet",
    "claude-3-haiku",
    "claude-2.1",
  ],
  DeepSeek: ["deepseek-chat", "deepseek-coder"],
  Google: ["gemini-pro", "gemini-pro-vision"],
  HuggingFace: ["mistral-7b", "llama-2", "falcon-40b"],
  Ollama: [
    "deepseek-r1:8b",
    "llama3.2",
    "llama2",
    "mistral",
    "codellama",
    "neural-chat",
  ],
} as const;
