import React, { useEffect, useState } from 'react';
import { IconArrowRight, IconInfoCircle, IconWand } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { CommentCard } from '@/components/CommentCard/CommentCard';
import { EmptyBlockContent } from '@/components/Editor/EmptyBlockContent';
import MarkdownEditorComponent from '@/components/MarkdownEditor';
import { TableOfContentsSidebar } from '@/components/TableOfContentsSidebar';
import { VoiceInput } from '@/components/VoiceInput/VoiceInput';
import { useEditor } from '@/hooks/useEditor';

const COMMENT_WIDTH = 280;
const TOC_WIDTH = 200;

export const EditorPage: React.FC = () => {
  const navigate = useNavigate();
  const {
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
  } = useEditor();

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
        <Group
          style={{
            position: 'fixed',
            top: '1rem',
            right: '2rem',
            zIndex: 1000,
            gap: '8px',
          }}
        >
          <Tooltip label="Generate the final version of your content">
            <Button
              onClick={() => navigate('/export')}
              size="md"
              variant="gradient"
              gradient={{ from: 'indigo', to: 'cyan' }}
              leftSection={<IconWand size="1rem" />}
              rightSection={<IconArrowRight size="1rem" />}
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              Generate Final Draft
            </Button>
          </Tooltip>
        </Group>
        {/* Fixed TOC sidebar */}
        <TableOfContentsSidebar links={tocLinks} width={TOC_WIDTH} />

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
            <Stack gap="md" pt="xl">
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

                    <Group gap={0} mb="md">
                      <VoiceInput />
                    </Group>

                    <Stack gap="md">
                      {block.comments.map((comment) => (
                        <CommentCard
                          key={comment.id}
                          comment={comment}
                          block={block}
                          blockStatus={blockStatuses[block.id]}
                          setContentBlocks={setContentBlocks}
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
