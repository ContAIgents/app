import { Agent } from '@/services/agents/Agent';

export interface ContentBlock {
  id: number;
  title: string;
  content: string;
  comments: Comment[];
  description: string;
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
