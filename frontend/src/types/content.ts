export interface ContentBlock {
  id: number;
  title: string;
  content: string;
  description: string;
  shortDescription: string;
  comments: Comment[];
}

export interface Comment {
  id: number;
  timestamp: string;
  user: string;
  comment: string;
  status: 'idle' | 'loading' | 'error' | 'success';
}