export interface FileContent {
  content: string;
  path: string;
}

export interface LLMConfig {
  provider: string;
  apiKey: string;
  model: string;
}

export type WritingStyle =
  | "professional"
  | "conversational"
  | "technical"
  | "storytelling"
  | "educational";
export type ToneOfVoice =
  | "neutral"
  | "enthusiastic"
  | "humorous"
  | "authoritative"
  | "empathetic";

export interface AgentConfig {
  name: string;
  llm: string;
  systemPrompt: string;
  expertise?: string[];
  writingStyle: WritingStyle;
  tone: ToneOfVoice;
  language: string;
}

export interface Worker {
  id: string;
  name: string;
  description: string;
  config: any;
}
