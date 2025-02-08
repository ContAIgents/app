export interface FileContent {
  content: string;
  path: string;
}

export interface LLMConfig {
  provider: string;
  apiKey: string;
  model: string;
}

export interface Worker {
  id: string;
  name: string;
  description: string;
  config: any;
}
