import { ReviewStatus } from '@/services/agents/types';

export interface IBlockStatus {
  isLoading: boolean;
  error: string | null;
  reviewStatus: ReviewStatus;
  isInitialReview: boolean;
}