import React, { useCallback, useEffect, useState } from 'react';
import {
  IconCheck,
  IconChevronDown,
  IconEdit,
  IconInfoCircle,
  IconLock,
  IconMessageCircle,
  IconPencil,
  IconRefresh,
  IconX,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Container,
  Group,
  Loader,
  Menu,
  Modal,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { CommentCard } from '@/components/CommentCard/CommentCard';
import { EmptyBlockContent } from '@/components/Editor/EmptyBlockContent';
import MarkdownEditorComponent from '@/components/MarkdownEditor';
import { getReviewInstructionsFromUser } from '@/components/ReviewInstructionsModal/ReviewInstructionsModal';
import { TableOfContents } from '@/components/TableOfContents';
import { Agent } from '@/services/agents/Agent';
import { AgentManager } from '@/services/agents/AgentManager';
import { CommentStatus, ReviewStatus } from '@/services/agents/types';
import { Comment, ContentBlock } from '@/types/content';
import { IBlockStatus } from '@/types/editor';
import RichTextEditorComponent from '../components/Editor';
import { ConfigManager } from '../services/config/ConfigManager';

const COMMENT_WIDTH = 280;
const TOC_WIDTH = 200;

export const EditorPage: React.FC = () => {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  // const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  // const [editedComment, setEditedComment] = useState('');
  const [blockStatuses, setBlockStatuses] = useState<Record<number, IBlockStatus>>({});
  const configManager = new ConfigManager('editor_');
  const setSelectedWriter = (writer: Agent) => {
    configManager.save('selectedWriter', writer.getConfig());
  };
  const setSelectedReviewer = (reviewer: Agent) => {
    configManager.save('selectedReviewer', reviewer.getConfig());
  };

  useEffect(() => {
    const blocks = configManager.load<ContentBlock[]>('contentBlocks') || [];
    setContentBlocks(blocks);

    // Load blockStatuses from ConfigManager, or initialize if not found
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

  // Create a useEffect to save blockStatuses whenever it changes
  useEffect(() => {
    if (Object.keys(blockStatuses).length > 0) {
      configManager.save('blockStatuses', blockStatuses);
    }
  }, [blockStatuses]);

  const openModal = () =>
    modals.openConfirmModal({
      title: 'Please confirm your action',
      children: (
        <Text size="sm">
          This action is so important that you are required to confirm it with a modal. Please click
          one of these buttons to proceed.
        </Text>
      ),
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => console.log('Confirmed'),
    });

  const handleUpdate = (id: number, content: string) => {
    if (!id || content === null) return;

    const updatedBlocks = contentBlocks.map((block) =>
      block.id === id ? { ...block, content } : block
    );
    setContentBlocks(updatedBlocks);
    configManager.save('contentBlocks', updatedBlocks);
  };

  // Generate table of contents links from content blocks
  const tocLinks = contentBlocks.map((block) => ({
    label: block.title,
    link: `#section-${block.id}`,
    order: 1,
  }));

  // Helper function to get avatar color based on user role
  const getAvatarColor = (user: string) => {
    switch (user) {
      case 'AI Assistant':
        return 'blue';
      case 'Editor':
        return 'green';
      case 'Technical Reviewer':
        return 'orange';
      default:
        return 'gray';
    }
  };

  // Helper function to get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  // // Simulate AI review generation with random timeout
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

  // Simulate content generation
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

      if (!selectedWriter) throw new Error('No writer selected for this block');

      const rewrittenContent = await selectedWriter.rewrite(
        block,
        block.content || '', // Provide default empty string if content is null
        comment.comment || '' // Provide default empty string if comment is null
      );

      setContentBlocks((blocks) =>
        blocks.map((b) => (b.id === blockId ? { ...b, content: rewrittenContent } : b))
      );

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
      const instructions = await getReviewInstructionsFromUser();
      // console.log("instructions",instructions)
      const reviewResponse = await new Agent(block?.reviewer?.config).generateReview(
        block,
        instructions
      );
      setContentBlocks((blocks) =>
        blocks.map((b) =>
          b.id === blockId
            ? {
                ...b,

                comments: [
                  ...b.comments,
                  {
                    id: commentId,
                    timestamp: new Date().toISOString(),
                    user: block?.reviewer?.config?.name || 'AI Assistant',
                    comment: reviewResponse,
                    status: 'success',
                  },
                ],
              }
            : b
        )
      );
      setBlockStatuses((prev) => ({
        ...prev,
        [blockId]: {
          ...prev[blockId],
          reviewStatus: 'pending',
        },
      }));

      
    } catch (error) {
      // Handle modal cancellation or errors
      console.log('Review instructions modal cancelled or failed');
    }
  };

  return (
    <>
      <div
        style={{
          height: '100vh',
          display: 'flex',
          overflow: 'hidden',
          backgroundColor: 'var(--mantine-color-body)',
        }}
      >
        {/* Fixed TOC sidebar */}
        <Paper
          shadow="xs"
          style={{
            width: TOC_WIDTH,
            height: '100vh',
            borderRight: '1px solid var(--mantine-color-default-border)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* TOC Header */}
          <Box
            p="md"
            style={{
              borderBottom: '1px solid var(--mantine-color-default-border)',
              backgroundColor: 'var(--mantine-color-body)',
            }}
          >
            <Text size="sm" fw={700}>
              Table of Contents
            </Text>
          </Box>

          {/* Scrollable TOC Content */}
          <Box
            p="md"
            style={{
              flex: 1,
              overflowY: 'auto',
            }}
          >
            <TableOfContents links={tocLinks} />
          </Box>
        </Paper>

        {/* Main content area with independent scroll */}
        <div
          role="main"
          style={{
            flex: 1,
            height: '100vh',
            overflowY: 'auto',
            padding: 'var(--mantine-spacing-xl)',
            backgroundColor: 'var(--mantine-color-body)',
          }}
        >
          <Container size="xl">
            <Stack gap="md">
              {contentBlocks.map((block) => (
                <Group
                  key={block.id}
                  id={`section-${block.id}`}
                  align="flex-start"
                  style={{ scrollMarginTop: '2rem' }}
                >
                  {/* Editor Section */}
                  <Paper
                    p="md"
                    withBorder={false}
                    style={{
                      flex: 1,
                      minHeight: '300px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Group justify="apart" mb="md">
                      <Group gap="xs">
                        <Text size="lg" fw={500}>
                          {block.title}
                        </Text>
                        <Tooltip
                          label={block.description}
                          position="right"
                          multiline
                          w={300}
                          withArrow
                        >
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            aria-label="Section description"
                          >
                            <IconInfoCircle size="1rem" />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                      {blockStatuses[block.id]?.reviewStatus === 'reviewing' && (
                        <Group gap="xs">
                          <Loader size="xs" />
                          <Text size="sm" c="dimmed">
                            Review in progress...
                          </Text>
                        </Group>
                      )}
                    </Group>
                    <Box style={{ flex: 1, position: 'relative' }}>
                      {block.content ? (
                        <MarkdownEditorComponent
                          content={block.content}
                          onUpdate={(content) => handleUpdate(block.id, content)}
                          disabled={blockStatuses[block.id]?.isLoading}
                        />
                      ) : (
                        <EmptyBlockContent
                          blockId={block.id}
                          isLoading={blockStatuses[block.id]?.isLoading}
                          setBlockStatuses={setBlockStatuses}
                          setContentBlocks={setContentBlocks}
                          contentBlocks={contentBlocks}
                          configManager={configManager}
                        />
                      )}
                    </Box>
                    {blockStatuses[block.id]?.error && (
                      <Text c="red" size="sm" mt="xs">
                        {blockStatuses[block.id].error}
                      </Text>
                    )}
                  </Paper>

                  {/* Comments Section */}
                  <Paper
                    p="md"
                    withBorder={false}
                    style={{
                      width: COMMENT_WIDTH,
                      flexShrink: 0,
                      alignSelf: 'stretch',
                    }}
                  >
                    <Text size="sm" fw={500} c="dimmed" mb="md">
                      Reviewer Comments
                    </Text>
                    <Stack gap="md">
                      {block.comments.map((comment) => (
                        <CommentCard
                          key={comment.id}
                          comment={comment}
                          block={block}
                          blockStatus={blockStatuses[block.id]}
                          onRequestReview={handleRequestReview}
                          onSimulateReview={(blockId, commentId) =>
                            simulateReview(blockId, commentId)
                          }
                          onSimulateContentGeneration={simulateContentGeneration}
                          onUpdateComment={(commentId, newComment) => {
                            setContentBlocks((blocks) =>
                              blocks.map((block) => ({
                                ...block,
                                comments: block.comments.map((c) =>
                                  c.id === commentId ? { ...c, comment: newComment } : c
                                ),
                              }))
                            );
                          }}
                        />
                      ))}
                    </Stack>
                  </Paper>
                </Group>
              ))}
            </Stack>
          </Container>
        </div>
      </div>
    </>
  );
};
``;
