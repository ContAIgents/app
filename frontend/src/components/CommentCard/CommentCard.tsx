import { useState } from 'react';
import { 
  Paper, 
  Group, 
  Avatar, 
  Box, 
  Text, 
  ActionIcon, 
  Tooltip, 
  Button, 
  Stack, 
  Textarea 
} from '@mantine/core';
import { IconEdit, IconRefresh, IconX, IconCheck } from '@tabler/icons-react';
import { Comment, ContentBlock } from '@/types/content';
import { ReviewStatus } from '@/services/agents/types';

interface CommentCardProps {
  comment: Comment;
  block: ContentBlock;
  blockStatus: {
    isLoading: boolean;
    error: string | null;
    reviewStatus: ReviewStatus;
    isInitialReview: boolean;
  };
  onRequestReview: (block: ContentBlock, commentId: number) => void;
  onSimulateReview: (blockId: number, commentId: number) => void;
  onSimulateContentGeneration: (block: ContentBlock, comment: Comment) => void;
  onUpdateComment: (commentId: number, newComment: string) => void;
}

export function CommentCard({
  comment,
  block,
  blockStatus,
  onRequestReview,
  onSimulateReview,
  onSimulateContentGeneration,
  onUpdateComment,
}: CommentCardProps) {
  const [editingComment, setEditingComment] = useState(false);
  const [editedComment, setEditedComment] = useState(comment.comment);

  const getAvatarColor = (user: string) => {
    switch (user) {
      case 'AI Assistant': return 'blue';
      case 'Editor': return 'green';
      case 'Technical Reviewer': return 'orange';
      default: return 'gray';
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
        size="sm"
        variant="light"
        onClick={() => onRequestReview(block, comment.id)}
        fullWidth
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
          <ActionIcon
            size="sm"
            variant="subtle"
            onClick={() => setEditingComment(true)}
          >
            <IconEdit size="1rem" />
          </ActionIcon>
          <Tooltip label="Regenerate review">
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
            value={editedComment}
            onChange={(e) => setEditedComment(e.currentTarget.value)}
            size="sm"
            autosize
            minRows={2}
          />
          <Group gap="xs" justify="flex-end">
            <ActionIcon
              size="sm"
              variant="subtle"
              color="red"
              onClick={() => setEditingComment(false)}
            >
              <IconX size="1rem" />
            </ActionIcon>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="green"
              onClick={() => {
                onUpdateComment(comment.id, editedComment);
                setEditingComment(false);
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
              onClick={() => onSimulateContentGeneration(block, comment)}
              loading={blockStatus?.isLoading}
              disabled={blockStatus?.isLoading}
            >
              Ask {block?.writer?.config?.name || 'AI Writer'} to rewrite
            </Button>
          </Group>
        </>
      )}
    </Paper>
  );
}