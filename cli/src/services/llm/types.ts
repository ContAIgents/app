export interface PromptResponse {
  reason?: string;
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
    systemPrompt?: string,
    template?: string,
    options?: PromptOptions
  ): Promise<PromptResponse>;
  executePrompts(
    prompts: string[],
    systemPrompt?: string,
    template?: string,
    options?: PromptOptions
  ): Promise<PromptResponse[]>;
  getConfig(): Record<string, any>;
  isConfigured(): boolean;
}

export interface ConfigField {
  name: string;
  required: boolean;
  options?: any[];
  default?: any;
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
  | "Ollama"
  | "Gemini";

export const PROVIDER_MODELS = {
  OpenAI: ["gpt-4", "gpt-3.5-turbo", "gpt-4-turbo-preview"],
  Anthropic: [
    "claude-3-opus",
    "claude-3-sonnet",
    "claude-3-haiku",
    "claude-2.1",
  ],
  DeepSeek: ["deepseek-chat", "deepseek-coder"],
  Google: [
    "gemini-pro",
    "gemini-pro-vision",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
  ],
  HuggingFace: ["mistral-7b", "llama-2", "falcon-40b"],
  Ollama: [
    "deepseek-r1:8b",
    "llama3.2",
    "llama2",
    "mistral",
    "codellama",
    "neural-chat",
  ],
  Gemini: [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite-preview-02-05",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
  ],
} as const;
