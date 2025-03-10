import { useRef, useState } from 'react';
import { IconCheck, IconEdit, IconRefresh, IconX } from '@tabler/icons-react';
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ReviewStatus } from '@/services/agents/types';
import { Comment, ContentBlock } from '@/types/content';

interface CommentCardProps {
  comment: Comment;
  block: ContentBlock;
  blockStatus: {
    isLoading: boolean;
    error: string | null;
    reviewStatus: ReviewStatus;
    isInitialReview: boolean;
  };
  setContentBlocks: React.Dispatch<React.SetStateAction<ContentBlock[]>>;
  onRequestReview: (block: ContentBlock, commentId: number) => void;
  onSimulateReview: (blockId: number, commentId: number) => void;
  onSimulateContentGeneration: (block: ContentBlock, comment: Comment) => void;
  onUpdateComment: (commentId: number, newComment: string) => void;
}

export function CommentCard({
  comment,
  block,
  blockStatus,
  setContentBlocks,
  onRequestReview,
  onSimulateReview,
  onSimulateContentGeneration,
  onUpdateComment,
}: CommentCardProps) {
  const [editingComment, setEditingComment] = useState(false);
  const [editedComment, setEditedComment] = useState(comment.comment);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  if (blockStatus?.reviewStatus === 'completed') {
    return (
      <Button
        size="xs"
        variant="light"
        onClick={async () => {
          try {
            const reviewResponse= await onRequestReview(block, comment.id);
          } catch (error) {
            console.error('Review request failed:', error);
            notifications.show({
              title: 'Error',
              message: 'Failed to generate review. Please try again.',
              color: 'red',
            });
          }
        }}
        fullWidth
        loading={comment.status === 'loading'}
        disabled={comment.status === 'loading'}
      >
        Ask {block?.reviewer?.config?.name || 'AI Assistant'} to re-review
      </Button>
    );
  }

  return (
    <Paper key={comment.id} p="md" withBorder={false} shadow="xs" radius="md">
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
          {/* <ActionIcon
            size="sm"
            variant="subtle"
            onClick={() => setEditingComment(true)}
          >
            <IconEdit size="1rem" />
          </ActionIcon> */}
          <Tooltip label="Regenerate review - Click to request a new review for this comment">
            <ActionIcon
              size="sm"
              variant="subtle"
              color="blue"
              onClick={() => onSimulateReview(block.id, comment.id)}
              loading={comment.status === 'loading'}
              disabled={comment.status === 'loading'}
            >
              <IconRefresh size="1rem" />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {editingComment ? (
        <Stack gap="xs">
          <Textarea
            ref={textareaRef}
            value={editedComment}
            onChange={(e) => setEditedComment(e.currentTarget.value)}
            size="sm"
            autosize
            minRows={2}
            placeholder="Type your comment here..."
          />
          <Group gap="xs" justify="flex-end">
            <ActionIcon
              size="sm"
              variant="subtle"
              color="red"
              onClick={() => {
                if (comment.comment === '') {
                  // Remove the empty comment if canceled
                  setContentBlocks((blocks: ContentBlock[]) =>
                    blocks.map((b) => ({
                      ...b,
                      comments: b.comments.filter((c) => c.id !== comment.id),
                    }))
                  );
                }
                setEditingComment(false);
              }}
            >
              <IconX size="1rem" />
            </ActionIcon>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="green"
              onClick={() => {
                if (editedComment.trim()) {
                  onUpdateComment(comment.id, editedComment);
                  setEditingComment(false);
                }
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

          <Group justify="flex-end" mt="md" gap="xs">
            <Button variant="light" size="xs" onClick={() => setEditingComment(true)}>
              Instruct
            </Button>
            <Button
              color="blue"
              size="xs"
              onClick={async () => {
                try {
                  await onSimulateContentGeneration(block, comment);
                  // Add a visual feedback that content was updated
                  notifications.show({
                    title: 'Content Updated',
                    message: 'The content has been rewritten successfully',
                    color: 'green',
                  });
                } catch (error) {
                  console.error('Failed to rewrite content:', error);
                  notifications.show({
                    title: 'Error',
                    message: 'Failed to rewrite content. Please try again.',
                    color: 'red',
                  });
                }
              }}
              loading={blockStatus?.isLoading}
              disabled={blockStatus?.isLoading}
            >
              Rewrite Content
            </Button>
          </Group>
        </>
      )}
    </Paper>
  );
}
