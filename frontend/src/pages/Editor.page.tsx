import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Group, 
  Paper, 
  Stack, 
  Avatar, 
  Text, 
  Box, 
  Button, 
  ActionIcon,
  TextInput,
  Loader,
  Tooltip,
  Modal,
  Textarea,
} from '@mantine/core';
import { IconRefresh, IconEdit, IconCheck, IconX, IconPencil, IconMessageCircle } from '@tabler/icons-react';
import RichTextEditorComponent from '../components/Editor';
import { TableOfContents } from '@/components/TableOfContents';
import { ConfigManager } from '../services/config/ConfigManager';
import { IContentBlock } from '@/AppContext';

const COMMENT_WIDTH = 280;
const TOC_WIDTH = 200;

type CommentStatus = 'idle' | 'loading' | 'error' | 'success';

interface IComment {
  timestamp: string;
  user: string;
  comment: string;
  id: number;
  status: CommentStatus;
}

interface IBlockStatus {
  isLoading: boolean;
  error: string | null;
}


export const EditorPage: React.FC = () => {
  const [contentBlocks, setContentBlocks] = useState<IContentBlock[]>([]);
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

  useEffect(() => {
    const loadContent = () => {
      const blocks = configManager.load<IContentBlock[]>('contentBlocks') || [];
      setContentBlocks(blocks);
    };
    loadContent();
  }, []);

  const handleUpdate = (id: number, content: string) => {
    const updatedBlocks = contentBlocks.map(block =>
      block.id === id ? { ...block, content } : block
    );
    setContentBlocks(updatedBlocks);
    configManager.save('contentBlocks', updatedBlocks);
  };

  // Generate table of contents links from content blocks
  const tocLinks = contentBlocks.map((block) => ({
    label: block.title,
    link: `#section-${block.id}`,
    order: 1
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
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Simulate AI review generation with random timeout
  const simulateReview = async (blockId: number, commentId: number, instructions?: string) => {
    const updateCommentStatus = (status: CommentStatus) => {
      setContentBlocks(blocks => 
        blocks.map(block => ({
          ...block,
          comments: block.comments.map(comment => 
            comment.id === commentId ? { ...comment, status } : comment
          )
        }))
      );
    };

    updateCommentStatus('loading');
    
    try {
      // Simulate API call with random timeout
      await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1000));
      
      // Randomly throw error for demonstration
      if (Math.random() < 0.2) throw new Error('Failed to generate review');
      
      const newComment = `Updated AI review at ${new Date().toLocaleTimeString()}${
        instructions ? `\n\nFocused on: ${instructions}` : ''
      }`;
      
      setContentBlocks(blocks =>
        blocks.map(block => ({
          ...block,
          comments: block.comments.map(comment =>
            comment.id === commentId
              ? { ...comment, comment: newComment, status: 'success' }
              : comment
          )
        }))
      );
    } catch (error) {
      updateCommentStatus('error');
    }
  };

  // Simulate content generation
  const simulateContentGeneration = async (blockId: number) => {
    setBlockStatuses(prev => ({
      ...prev,
      [blockId]: { isLoading: true, error: null }
    }));

    try {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 5000 + 2000));
      
      if (Math.random() < 0.1) throw new Error('Failed to generate content');

      setContentBlocks(blocks =>
        blocks.map(block =>
          block.id === blockId
            ? { ...block, content: block.content + '\n\nNew AI generated content at ' + new Date().toLocaleTimeString() }
            : block
        )
      );

      setBlockStatuses(prev => ({
        ...prev,
        [blockId]: { isLoading: false, error: null }
      }));
    } catch (error) {
      setBlockStatuses(prev => ({
        ...prev,
        [blockId]: { isLoading: false, error: error.message }
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

    setReviewInstructionsModal(prev => ({ ...prev, isOpen: false }));
    await simulateReview(blockId, commentId, instructions);
  };

  const renderCommentCard = (comment: IComment, blockId: number) => (
    <Paper 
      key={comment.id} 
      p="md" 
      withBorder
      shadow="sm"
      radius="md"
    >
      <Group gap="sm" mb="xs">
        <Avatar 
          color={getAvatarColor(comment.user)} 
          radius="xl"
          size="sm"
        >
          {getInitials(comment.user)}
        </Avatar>
        <Box style={{ flex: 1 }}>
          <Text size="sm" fw={500}>{comment.user}</Text>
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
                setContentBlocks(blocks =>
                  blocks.map(block => ({
                    ...block,
                    comments: block.comments.map(c =>
                      c.id === comment.id ? { ...c, comment: editedComment } : c
                    )
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
          
          <Group position="apart" mt="md">
            <Button
              variant="light"
              size="xs"
              leftIcon={<IconMessageCircle size="1rem" />}
              onClick={() => handleRequestReview(blockId, comment.id)}
              loading={comment.status === 'loading'}
              disabled={comment.status === 'loading'}
            >
              Request Re-review
            </Button>
            
            <Button
              color="blue"
              size="xs"
              leftIcon={<IconPencil size="1rem" />}
              onClick={() => simulateContentGeneration(blockId)}
              loading={blockStatuses[blockId]?.isLoading}
              disabled={blockStatuses[blockId]?.isLoading}
            >
              Pass to Writer
            </Button>
          </Group>
        </>
      )}
    </Paper>
  );

  return (
    <>
      <div style={{ 
        height: '100vh', 
        display: 'flex',
        overflow: 'hidden' // Prevent body scroll
      }}>
        {/* Fixed TOC sidebar */}
        <Paper 
          style={{ 
            width: TOC_WIDTH,
            height: '100vh',
            borderRight: '1px solid var(--mantine-color-gray-3)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* TOC Header */}
          <Box p="md" style={{ 
            borderBottom: '1px solid var(--mantine-color-gray-3)',
            backgroundColor: 'var(--mantine-color-body)'
          }}>
            <Text size="sm" fw={700}>Table of Contents</Text>
          </Box>
          
          {/* Scrollable TOC Content */}
          <Box p="md" style={{ 
            flex: 1,
            overflowY: 'auto'
          }}>
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
            padding: 'var(--mantine-spacing-xl)'
          }}
        >
          <Container size="xl">
            <Stack gap="md">
              {contentBlocks.map((block) => (
                <Group 
                  key={block.id} 
                  id={`section-${block.id}`} 
                  align="flex-start" 
                  noWrap
                  style={{ scrollMarginTop: '2rem' }}
                >
                  {/* Editor Section */}
                  <Paper 
                    p="md" 
                    style={{ 
                      flex: 1,
                      minHeight: '300px',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Text size="lg" fw={500} mb="md">{block.title}</Text>
                    <Box style={{ flex: 1, position: 'relative' }}>
                      {blockStatuses[block.id]?.isLoading && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(255, 255, 255, 0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 1000
                        }}>
                          <Stack align="center">
                            <Loader size="sm" />
                            <Text size="sm">AI is writing...</Text>
                          </Stack>
                        </div>
                      )}
                      <RichTextEditorComponent
                        content={block.content}
                        onUpdate={(content) => handleUpdate(block.id, content)}
                        disabled={blockStatuses[block.id]?.isLoading}
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
                    style={{ 
                      width: COMMENT_WIDTH,
                      flexShrink: 0,
                      alignSelf: 'stretch'
                    }}
                  >
                    <Text size="sm" fw={500} c="dimmed" mb="md">Comments</Text>
                    <Stack gap="md">
                      {block.comments.map(comment => renderCommentCard(comment, block.id))}
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
        onClose={() => setReviewInstructionsModal(prev => ({ ...prev, isOpen: false }))}
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
            onChange={(e) => setReviewInstructionsModal(prev => ({
              ...prev,
              instructions: e.currentTarget.value
            }))}
          />

          <Group position="right" mt="md">
            <Button 
              variant="light" 
              onClick={() => setReviewInstructionsModal(prev => ({ ...prev, isOpen: false }))}
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
