export type AgentRole = 'content_writer' | 'content_reviewer';
export type WritingStyle = 'professional' | 'conversational' | 'technical' | 'storytelling' | 'educational';
export type ToneOfVoice = 'neutral' | 'enthusiastic' | 'humorous' | 'authoritative' | 'empathetic';

export interface AgentConfig {
  id: string;
  name: string;
  role: AgentRole;
  avatar?: string;
  systemPrompt: string;
  expertise?: string[];
  writingStyle: WritingStyle;
  tone: ToneOfVoice;
  createdAt: number;
  updatedAt: number;
}
