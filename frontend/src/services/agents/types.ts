export type AgentRole = 'content_writer' | 'content_reviewer';
export type WritingStyle = 'professional' | 'conversational' | 'technical' | 'storytelling' | 'educational';
export type ReviewStyle = 'detailed' | 'concise' | 'technical' | 'strategic' | 'educational';
export type ToneOfVoice = 'neutral' | 'enthusiastic' | 'humorous' | 'authoritative' | 'empathetic';

export interface AgentConfig {
  [x: string]: any;
  id: string;
  name: string;
  role: AgentRole;
  avatar?: string;
  systemPrompt: string;
  expertise?: string[];
  writingStyle: WritingStyle | ReviewStyle;
  tone: ToneOfVoice;
  llm?: string;  // New field for LLM selection
  createdAt: number;
  updatedAt: number;
}

export type ReviewStatus = 'pending' | 'reviewing' | 'completed' | 'error';
export type CommentStatus = 'idle' | 'loading' | 'error' | 'success';
