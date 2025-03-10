import { Agent } from '@/services/agents/Agent';

export interface IdeaContent {
  description: string;
  targetAudience: string;
  contentType: string;
  blocks: ContentBlock[];
}

export interface ContentBlock {
  id: number;
  title: string;
  description: string;
  content: string;
  comments: Comment[];  // Change from string[] to Comment[]
  writer?: Agent;
  reviewer?: Agent;
}

export interface Comment {
  id: number;
  timestamp: string;
  user: string;
  comment: string;
  status: 'idle' | 'loading' | 'error' | 'success';
}
