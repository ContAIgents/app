import { useState, useEffect } from 'react';
import { Agent } from '@/services/agents/Agent';
import { ConfigManager } from '@/services/config/ConfigManager';
import { Comment, ContentBlock } from '@/types/content';
import { IBlockStatus } from '@/types/editor';
import { CommentStatus } from '@/services/agents/types';
import { getReviewInstructionsFromUser } from '@/components/ReviewInstructionsModal/ReviewInstructionsModal';

export const useEditor = () => {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [blockStatuses, setBlockStatuses] = useState<Record<number, IBlockStatus>>({});
  const configManager = new ConfigManager('editor_');

  useEffect(() => {
    const blocks = configManager.load<ContentBlock[]>('contentBlocks') || [];
    setContentBlocks(blocks);

    const savedBlockStatuses = configManager.load<Record<number, IBlockStatus>>('blockStatuses');
    if (savedBlockStatuses) {
      setBlockStatuses(savedBlockStatuses);
    } else {
      const initialStatuses: Record<number, IBlockStatus> = {};
      blocks.forEach((block) => {
        initialStatuses[block.id] = {
          isLoading: false,
          error: null,
          reviewStatus: 'pending',
          isInitialReview: !block.content,
        };
      });
      setBlockStatuses(initialStatuses);
      configManager.save('blockStatuses', initialStatuses);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(blockStatuses).length > 0) {
      configManager.save('blockStatuses', blockStatuses);
    }
  }, [blockStatuses]);

  const handleUpdate = (id: number, content: string) => {
    if (!id || content === null) return;

    const updatedBlocks = contentBlocks.map((block) =>
      block.id === id ? { ...block, content } : block
    );
    setContentBlocks(updatedBlocks);
    configManager.save('contentBlocks', updatedBlocks);
  };

  const simulateReview = async (blockId: number, commentId: number, instructions?: string) => {
    setBlockStatuses((prev) => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        reviewStatus: 'reviewing',
      },
    }));

    const updateCommentStatus = (status: CommentStatus) => {
      setContentBlocks((blocks) =>
        blocks.map((block) => ({
          ...block,
          comments: block.comments.map((comment) =>
            comment.id === commentId ? { ...comment, status } : comment
          ),
        }))
      );
    };

    updateCommentStatus('loading');

    try {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 3000 + 1000));

      if (Math.random() < 0.2) throw new Error('Failed to generate review');

      const newComment = `Updated AI review at ${new Date().toLocaleTimeString()}${
        instructions ? `\n\nFocused on: ${instructions}` : ''
      }`;

      setContentBlocks((blocks) =>
        blocks.map((block) => ({
          ...block,
          comments: block.comments.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  comment: newComment,
                  status: 'success',
                  user: block?.reviewer?.config?.name || 'AI Assistant',
                }
              : comment
          ),
        }))
      );

      setBlockStatuses((prev) => ({
        ...prev,
        [blockId]: {
          ...prev[blockId],
          reviewStatus: 'completed',
          isInitialReview: false,
        },
      }));
    } catch (error) {
      updateCommentStatus('error');
      setBlockStatuses((prev) => ({
        ...prev,
        [blockId]: {
          ...prev[blockId],
          reviewStatus: 'error',
        },
      }));
    }
  };

  const simulateContentGeneration = async (block: ContentBlock, comment: Comment) => {
    const blockId = block?.id;
    if (!blockId || !block || !comment) return;

    setBlockStatuses((prev) => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        isLoading: true,
        error: null,
      },
    }));

    try {
      if (!block?.writer?.config) return;

      const selectedWriter = new Agent(block.writer.config);
      const rewrittenContent = await selectedWriter.rewrite(
        block,
        block.content || '',
        comment.comment || ''
      );

      // Update the content blocks with new content
      setContentBlocks((blocks) =>
        blocks.map((b) => (b.id === blockId ? { ...b, content: rewrittenContent } : b))
      );

      // Force a re-render by updating the block status
      setBlockStatuses((prev) => ({
        ...prev,
        [blockId]: {
          ...prev[blockId],
          isLoading: false,
          error: null,
          reviewStatus: 'completed',
          isInitialReview: prev[blockId]?.isInitialReview || true,
        },
      }));
    } catch (error) {
      console.error('Content generation failed:', error);
      setBlockStatuses((prev) => ({
        ...prev,
        [blockId]: {
          ...prev[blockId],
          isLoading: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred',
          reviewStatus: 'error',
          isInitialReview: prev[blockId]?.isInitialReview || true,
        },
      }));
    }
  };

  const handleRequestReview = async (block: ContentBlock, commentId: number) => {
    const blockId = block?.id;
    if (block?.reviewer?.config === undefined) return;

    try {
      setBlockStatuses((prev) => ({
        ...prev,
        [blockId]: {
          ...prev[blockId],
          reviewStatus: 'reviewing',
        },
      }));

      setContentBlocks((blocks) =>
        blocks.map((b) =>
          b.id === blockId
            ? {
                ...b,
                comments: b.comments.map((c) =>
                  c.id === commentId ? { ...c, status: 'loading' } : c
                ),
              }
            : b
        )
      );

      const instructions = await getReviewInstructionsFromUser();
      const reviewResponse = await new Agent(block?.reviewer?.config).generateReview(
        block,
        instructions
      );
      setContentBlocks((blocks) =>
        blocks.map((b) =>
          b.id === blockId
            ? {
                ...b,
                comments: b.comments.map((c) =>
                  c.id === commentId
                    ? {
                        ...c,
                        comment: reviewResponse,
                        status: 'success',
                        user: block?.reviewer?.config?.name || 'AI Assistant',
                      }
                    : c
                ),
              }
            : b
        )
      );

      return reviewResponse;
    } catch (error) {
      setBlockStatuses((prev) => ({
        ...prev,
        [blockId]: {
          ...prev[blockId],
          reviewStatus: 'error',
        },
      }));
      throw error;
    }
  };

  const tocLinks = contentBlocks.map((block) => ({
    label: block.title,
    link: `#section-${block.id}`,
    order: 1,
  }));

  return {
    contentBlocks,
    blockStatuses,
    tocLinks,
    handleUpdate,
    simulateReview,
    simulateContentGeneration,
    handleRequestReview,
    setContentBlocks,
    setBlockStatuses,
    configManager,
  };
};
