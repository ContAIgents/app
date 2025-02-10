import React, { useEffect, useState } from 'react';
import {
  IconCheck,
  IconEdit,
  IconInfoCircle,
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
  Modal,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { TableOfContents } from '@/components/TableOfContents';
import { Agent } from '@/services/agents/Agent';
import { CommentStatus, ReviewStatus } from '@/services/agents/types';
import { Comment, ContentBlock } from '@/types/content';
import RichTextEditorComponent from '../components/Editor';
import { ConfigManager } from '../services/config/ConfigManager';

const COMMENT_WIDTH = 280;
const TOC_WIDTH = 200;

interface IBlockStatus {
  isLoading: boolean;
  error: string | null;
  reviewStatus: ReviewStatus;
  isInitialReview: boolean;
}

export const EditorPage: React.FC = () => {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedComment, setEditedComment] = useState('');
  const [blockStatuses, setBlockStatuses] = useState<Record<number, IBlockStatus>>({});
  const [reviewInstructionsModal, setReviewInstructionsModal] = useState<{
    isOpen: boolean;
    blockId: number | null;
    commentId: number | null;
    instructions: string;
  }>({
    isOpen: false,
    blockId: null,
    commentId: null,
    instructions: '',
  });
  const configManager = new ConfigManager('editor_');
  const selectedWriter = new Agent(configManager.load('selectedWriter') || {});
  const selectedReviewer = new Agent(configManager.load('selectedReviewer') || {});

  useEffect(() => {
    const loadContent = async () => {
      const blocks = configManager.load<ContentBlock[]>('contentBlocks') || [];
      setContentBlocks(blocks);

      // Initialize status for each block
      const initialStatuses: Record<number, IBlockStatus> = {};
      blocks.forEach((block) => {
        initialStatuses[block.id] = {
          isLoading: !block.content, // Only set loading if content is empty
          error: null,
          reviewStatus: 'pending',
          isInitialReview: !block.content, // Only mark as initial review if content is empty
        };
      });
      setBlockStatuses(initialStatuses);

      // Only expand blocks that have no content
      const blocksToExpand = blocks.filter((block) => !block.content);

      if (blocksToExpand.length > 0) {
        try {
          const expandedBlocks = await Promise.all(
            blocks.map(async (block) => {
              if (block.content && block.content.trim() !== '') {
                return block; // Skip blocks that already have content
              }

              try {
                const expandedContent = await selectedWriter.expand(block);
                return {
                  ...block,
                  content: expandedContent,
                  comments: [
                    {
                      id: Math.floor(Math.random() * 1000),
                      timestamp: new Date().toISOString(),
                      user: selectedReviewer.getConfig().name,
                      comment:
                        'Initial review: This section needs more specific examples and clearer transitions between paragraphs.',
                      status: 'success' as CommentStatus,
                    },
                  ],
                };
              } catch (error) {
                console.error(`Failed to expand block ${block.id}:`, error);
                setBlockStatuses((prev) => ({
                  ...prev,
                  [block.id]: {
                    ...prev[block.id],
                    isLoading: false,
                    error: error instanceof Error ? error.message : 'Failed to expand content',
                    reviewStatus: 'error',
                    isInitialReview: true,
                  },
                }));
                return block;
              }
            })
          );

          setContentBlocks(expandedBlocks);
          configManager.save('contentBlocks', expandedBlocks);

          // Update block statuses only for blocks that were expanded
          blocksToExpand.forEach((block) => {
            setBlockStatuses((prev) => ({
              ...prev,
              [block.id]: {
                ...prev[block.id],
                isLoading: false,
                error: null,
                reviewStatus: 'pending',
                isInitialReview: true,
              },
            }));
          });
        } catch (error) {
          console.error('Failed to load and expand content:', error);
          blocksToExpand.forEach((block) => {
            setBlockStatuses((prev) => ({
              ...prev,
              [block.id]: {
                ...prev[block.id],
                isLoading: false,
                error: 'Failed to load content',
                reviewStatus: 'error',
                isInitialReview: true,
              },
            }));
          });
        }
      }
    };

    loadContent();
  }, []);

  const handleUpdate = (id: number, content: string) => {
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

  // Simulate AI review generation with random timeout
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
                  user: selectedReviewer.getConfig().name,
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
  const simulateContentGeneration = async (blockId: number, comment: Comment) => {
    setBlockStatuses((prev) => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        isLoading: true,
        error: null,
      },
    }));

    const block = contentBlocks.find((b) => b.id === blockId);
    if (!block) return;

    try {
      // Get the latest comment as the reviewer suggestion

      const rewrittenContent = await selectedWriter.rewrite(block, block.content, comment.comment);

      setContentBlocks((blocks) =>
        blocks.map((b) => (b.id === blockId ? { ...b, content: rewrittenContent } : b))
      );

      setBlockStatuses((prev) => ({
        ...prev,
        [blockId]: {
          ...prev[blockId],
          isLoading: false,
          error: null,
          reviewStatus: prev[blockId]?.reviewStatus || 'pending',
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

  const handleRequestReview = (blockId: number, commentId: number) => {
    setReviewInstructionsModal({
      isOpen: true,
      blockId,
      commentId,
      instructions: '',
    });
  };

  const handleSubmitReviewRequest = async () => {
    const { blockId, commentId, instructions } = reviewInstructionsModal;
    if (blockId === null || commentId === null) return;

    setReviewInstructionsModal((prev) => ({ ...prev, isOpen: false }));
    await simulateReview(blockId, commentId, instructions);
  };

  const renderCommentCard = (comment: Comment, blockId: number) => (
    <Paper
      key={comment.id}
      p="md"
      withBorder={false} // Remove border from comment cards
      shadow="xs"
      radius="md"
    >
      <Group gap="sm" mb="xs">
        <Avatar color={getAvatarColor(comment.user)} radius="xl" size="sm">
          {getInitials(comment.user)}
        </Avatar>
        <Box style={{ flex: 1 }}>
          <Text size="sm" fw={500}>
            {comment.user}
          </Text>
          <Text size="xs" c="dimmed">
            {new Date(comment.timestamp).toLocaleDateString()}
          </Text>
        </Box>
        <Group gap="xs">
          <ActionIcon
            size="sm"
            variant="subtle"
            onClick={() => {
              setEditingCommentId(comment.id);
              setEditedComment(comment.comment);
            }}
          >
            <IconEdit size="1rem" />
          </ActionIcon>
          <Tooltip label="Regenerate review">
            <ActionIcon
              size="sm"
              variant="subtle"
              color="blue"
              onClick={() => simulateReview(blockId, comment.id)}
              loading={comment.status === 'loading'}
              disabled={comment.status === 'loading'}
            >
              <IconRefresh size="1rem" />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {editingCommentId === comment.id ? (
        <Stack gap="xs">
          <TextInput
            value={editedComment}
            onChange={(e) => setEditedComment(e.target.value)}
            size="sm"
          />
          <Group gap="xs" justify="flex-end">
            <ActionIcon
              size="sm"
              variant="subtle"
              color="red"
              onClick={() => setEditingCommentId(null)}
            >
              <IconX size="1rem" />
            </ActionIcon>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="green"
              onClick={() => {
                setContentBlocks((blocks) =>
                  blocks.map((block) => ({
                    ...block,
                    comments: block.comments.map((c) =>
                      c.id === comment.id ? { ...c, comment: editedComment } : c
                    ),
                  }))
                );
                setEditingCommentId(null);
              }}
            >
              <IconCheck size="1rem" />
            </ActionIcon>
          </Group>
        </Stack>
      ) : (
        <>
          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
            {comment.comment}
          </Text>
          {comment.status === 'error' && (
            <Text size="sm" c="red" mt="xs">
              Failed to generate review. Please try again.
            </Text>
          )}

          <Group justify="flex-end" mt="md">
            <Button
              color="blue"
              size="xs"
              onClick={() => simulateContentGeneration(blockId, comment)}
              loading={blockStatuses[blockId]?.isLoading}
              disabled={blockStatuses[blockId]?.isLoading}
            >
              Ask {selectedWriter.getConfig().name} to rewrite
            </Button>
          </Group>
        </>
      )}
    </Paper>
  );

  // Helper function to generate dummy content based on title and description
  const generateDummyContent = (title: string, description: string) => {
    return `<h2>${title}</h2>
<p>${description}</p>

<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>

<h3>Key Points</h3>
<ul>
  <li>Important consideration one</li>
  <li>Critical aspect two</li>
  <li>Notable element three</li>
</ul>

<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

<blockquote>
  <p>Relevant quote or important highlight related to this section.</p>
</blockquote>

<p>Additional context and elaboration would be needed here to fully develop this section according to the outlined objectives.</p>`;
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
                      {blockStatuses[block.id]?.isLoading && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(255, 255, 255, 0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                          }}
                        >
                          <Stack align="center">
                            <Loader size="sm" />
                            <Text size="sm">Loading content...</Text>
                          </Stack>
                        </div>
                      )}
                      <RichTextEditorComponent
                        content={block.content}
                        onUpdate={(content) => handleUpdate(block.id, content)}
                        disabled={
                          blockStatuses[block.id]?.isLoading ||
                          blockStatuses[block.id]?.reviewStatus === 'reviewing'
                        }
                      />
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
                      {block.comments.map((comment) => renderCommentCard(comment, block.id))}
                    </Stack>
                  </Paper>
                </Group>
              ))}
            </Stack>
          </Container>
        </div>
      </div>

      <Modal
        opened={reviewInstructionsModal.isOpen}
        onClose={() => setReviewInstructionsModal((prev) => ({ ...prev, isOpen: false }))}
        title="Request Re-review"
        size="md"
      >
        <Stack>
          <Text size="sm">
            Provide specific instructions for the reviewer to focus on during this review:
          </Text>

          <Textarea
            placeholder="e.g., Please focus on technical accuracy and code examples"
            minRows={3}
            value={reviewInstructionsModal.instructions}
            onChange={(e) =>
              setReviewInstructionsModal((prev) => ({
                ...prev,
                instructions: e.currentTarget.value,
              }))
            }
          />

          <Group justify="right" mt="md">
            <Button
              variant="light"
              onClick={() => setReviewInstructionsModal((prev) => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReviewRequest}
              disabled={!reviewInstructionsModal.instructions.trim()}
            >
              Submit Request
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
``;
