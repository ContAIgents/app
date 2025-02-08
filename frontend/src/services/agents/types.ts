export type AgentRole = 'content_writer' | 'content_reviewer';

export interface AgentConfig {
  id: string;
  name: string;
  role: AgentRole;
  avatar?: string;
  systemPrompt: string;
  writingStyle?: string;
  expertise?: string[];
  tone?: string;
  createdAt: number;
  updatedAt: number;
}