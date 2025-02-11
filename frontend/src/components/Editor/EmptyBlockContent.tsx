import React from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import { ActionIcon, Avatar, Box, Button, Group, Menu, Paper, Stack, Text } from '@mantine/core';
import { useBlockAgents } from '@/hooks/useBlockAgents';
import { ConfigManager } from '@/services/config/ConfigManager';
import { ContentBlock } from '@/types/content';
import { IBlockStatus } from '@/types/editor';

interface EmptyBlockContentProps {
  blockId: number;
  isLoading: boolean;
  setBlockStatuses: React.Dispatch<React.SetStateAction<Record<number, IBlockStatus>>>;
  setContentBlocks: React.Dispatch<React.SetStateAction<ContentBlock[]>>;
  contentBlocks: ContentBlock[];
  configManager: ConfigManager;
}

export const EmptyBlockContent: React.FC<EmptyBlockContentProps> = ({
  blockId,
  isLoading,
  setBlockStatuses,
  setContentBlocks,
  contentBlocks,
  configManager,
}) => {
  const { selectedWriter, availableAgents, updateWriter, selectedReviewer } =
    useBlockAgents(blockId);
    const avaialbleWriters= availableAgents.filter((agent) => agent.getConfig().role === 'content_writer');

  const handleGenerateContent = async () => {
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
      const expandedContent = await selectedWriter.expand(block);
      const newCommentId = Math.floor(Math.random() * 1000);

      setContentBlocks((blocks) =>
        blocks.map((b) =>
          b.id === blockId
            ? {
                ...b,
                content: expandedContent,
                writer: selectedWriter,
                reviewer: selectedReviewer,
                comments: [
                  {
                    id: newCommentId,
                    timestamp: new Date().toISOString(),
                    user: selectedReviewer.getConfig().name,
                    comment: 'Initiating first review...',
                    status: 'loading',
                  },
                ],
              }
            : b
        )
      );

      // Generate initial review
      const reviewResponse = await selectedReviewer.generateReview(block, expandedContent);

      setContentBlocks((blocks) =>
        blocks.map((b) =>
          b.id === blockId
            ? {
                ...b,
                comments: [
                  {
                    id: newCommentId,
                    timestamp: new Date().toISOString(),
                    user: selectedReviewer.getConfig().name,
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
          isLoading: false,
          error: null,
          reviewStatus: 'pending',
          isInitialReview: true,
        },
      }));

      configManager.save('contentBlocks', contentBlocks);
    } catch (error) {
      setBlockStatuses((prev) => ({
        ...prev,
        [blockId]: {
          ...prev[blockId],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to expand content',
          reviewStatus: 'error',
          isInitialReview: true,
        },
      }));
    }
  };

  return (
    <Box
      p="xl"
      style={{
        height: '100%',
        border: '2px dashed var(--mantine-color-gray-4)',
        borderRadius: 'var(--mantine-radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper p="xl" radius="md" style={{ width: 'auto', minWidth: 300, textAlign: 'center' }}>
        <Stack align="center" gap="md">
          <Avatar size={64} src={selectedWriter.getConfig().avatar} color="blue" radius="xl">
            {selectedWriter.getConfig().name.charAt(0)}
          </Avatar>

          <Stack gap="xs">
            <Group justify="center" gap="xs">
              <Text fw={500}>{selectedWriter.getConfig().name}</Text>
              <Menu position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="subtle" size="sm" color="gray">
                    <IconChevronDown size="1rem" />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  {avaialbleWriters.map((w) => (
                    <Menu.Item
                      key={w.getConfig().id}
                      leftSection={
                        <Avatar size="sm" src={w.getConfig().avatar} color="blue" radius="xl">
                          {w.getConfig().name.charAt(0)}
                        </Avatar>
                      }
                      onClick={() => updateWriter(w)}
                    >
                      {w.getConfig().name}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            </Group>
            <Text size="sm" c="dimmed">
              {selectedWriter.getConfig().expertise?.join(', ') || 'AI Content Writer'}
            </Text>
          </Stack>

          <Button onClick={handleGenerateContent} loading={isLoading} disabled={isLoading}>
            Ask {selectedWriter?.getConfig()?.name || 'AI'} to write
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
