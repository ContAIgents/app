import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconCircleCheck,
  IconEdit,
  IconCheck,
  IconTrash,
  IconPlus,
  IconInfoCircle,
  IconGripVertical,
  IconWand,
} from '@tabler/icons-react';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import { ConfigManager } from '@/services/config/ConfigManager';
import type { ContentBlock, IdeaContent } from '@/types/content';
import type { Agent } from '@/services/agents/Agent';
import { getStructuredBlocks } from '@/constants/Ideahub';
import { modals } from '@mantine/modals';

interface GenerateStepProps {
  selectedWriter: Agent | null;
  selectedReviewer: Agent | null;
  ideaContent: IdeaContent;
  prevStep: () => void;
}

export function GenerateStep({
  selectedWriter,
  selectedReviewer,
  ideaContent,
  prevStep,
}: GenerateStepProps) {
  const navigate = useNavigate();
  const configManager = new ConfigManager('editor_');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [generatedBlocks, setGeneratedBlocks] = useState<ContentBlock[]>(ideaContent.blocks);

  useEffect(() => {
    if (!generatedBlocks?.length && !isGenerating) {
      handleGenerateIdea();
    }
  }, []);

  const handleGenerateIdea = async (extraContext?: string) => {
    setIsGenerating(true);
    try {
      if (!selectedWriter || !ideaContent.contentType) {
        throw new Error('Writer and content type must be selected');
      }
      const contentBlocks = await selectedWriter.generateStructuredBlocks(
        ideaContent.contentType,
        ideaContent.description,
        ideaContent.targetAudience,
        extraContext
      );
      setGeneratedBlocks(contentBlocks);
    } catch (error) {
      console.error('Failed to generate blocks:', error);
      const fallbackBlocks = getStructuredBlocks(ideaContent.contentType, ideaContent.description);
      setGeneratedBlocks(fallbackBlocks);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateBlock = (blockId: number, updates: Partial<ContentBlock>) => {
    if (!generatedBlocks) return;
    const newGeneratedBlocks = generatedBlocks.map((block) => 
      block.id === blockId ? { ...block, ...updates } : block
    );
    setGeneratedBlocks(newGeneratedBlocks);
  };

  const handleAddBlock = () => {
    if (!generatedBlocks) return;
    const newBlock: ContentBlock = {
      id: Math.max(...generatedBlocks.map((b) => b.id)) + 1,
      title: 'New Section',
      content: '',
      description: 'Describe the purpose of this section...',
      comments: [],
    };
    setGeneratedBlocks([...generatedBlocks, newBlock]);
    setEditingBlockId(newBlock.id);
  };

  const handleDeleteBlock = (blockId: number) => {
    if (!generatedBlocks || generatedBlocks.length <= 1) return;
    const newBlocks = generatedBlocks.filter((block) => block.id !== blockId);
    setGeneratedBlocks(newBlocks);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination || !generatedBlocks) return;
    const items = Array.from(generatedBlocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setGeneratedBlocks(items);
  };

  const openRegenerateModal = () => {
    modals.open({
      title: 'Regenerate Content Sections',
      size: 'lg',
      children: (
        <Stack gap="md">
          <Text size="sm">
            Provide additional context or specific instructions to guide the AI in generating new sections.
            Leave empty to regenerate with original parameters.
          </Text>
          <Textarea
            placeholder="E.g., Focus more on practical examples, Include a section about testing, etc."
            minRows={3}
            maxRows={5}
            data-autofocus
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => modals.closeAll()}>
              Cancel
            </Button>
            <Button
              onClick={async (event) => {
                const textarea = (event.target as HTMLElement)
                  .closest('.mantine-Modal-content')
                  ?.querySelector('textarea');
                const extraContext = textarea?.value || '';
                modals.closeAll();
                await handleGenerateIdea(extraContext);
              }}
              loading={isGenerating}
            >
              Regenerate
            </Button>
          </Group>
        </Stack>
      ),
    });
  };

  return (
    <Box maw={1000} mx="auto" mt="xl">
      <Stack gap="xl">
        <Stack gap="xs" ta="center">
          <Title order={1} size="2rem" fw={900}>
            Let's get it to a plan
          </Title>
          <Group justify="center">
            <Text c="dimmed" size="xs" maw={600} mx="auto">
              Review and arrange your content sections before AI starts writing. A
              well-structured outline helps AI generate more focused and coherent content.
              <Tooltip
                multiline
                w={300}
                position="top"
                withArrow
                label={
                  <div>
                    Why structure matters:
                    <ul>
                      <li>Better content organization</li>
                      <li>More focused AI responses</li>
                      <li>Easier content reviews</li>
                      <li>Full control over the narrative flow</li>
                      <li>Ability to iterate and refine sections</li>
                    </ul>
                  </div>
                }
              >
                <ActionIcon variant="subtle" color="gray">
                  <IconInfoCircle size="1.2rem" />
                </ActionIcon>
              </Tooltip>
            </Text>
          </Group>
        </Stack>

        {isGenerating ? (
          <Paper withBorder p="xl" radius="md">
            <Stack align="center" gap="xl">
              <Loader size="xl" />
              <Text size="lg">Breaking down your content into logical sections...</Text>
            </Stack>
          </Paper>
        ) : (
          <Stack gap="xl">
            <Paper withBorder p="xl" radius="md">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="sections">
                  {(provided: DroppableProvided) => (
                    <Stack gap="md" {...provided.droppableProps} ref={provided.innerRef}>
                      {generatedBlocks?.map((block, index) => (
                        <Draggable
                          key={block.id}
                          draggableId={String(block.id)}
                          index={index}
                        >
                          {(provided: DraggableProvided) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              withBorder
                              p="md"
                              radius="md"
                            >
                              <Group>
                                <div
                                  {...provided.dragHandleProps}
                                  style={{
                                    cursor: 'grab',
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  <IconGripVertical size={18} style={{ opacity: 0.5 }} />
                                </div>

                                <Stack gap="xs" style={{ flex: 1 }}>
                                  {editingBlockId === block.id ? (
                                    <Stack gap="xs">
                                      <TextInput
                                        value={block.title}
                                        onChange={(e) =>
                                          handleUpdateBlock(block.id, {
                                            title: e.target.value,
                                          })
                                        }
                                        onKeyDown={(e) =>
                                          e.key === 'Enter' && setEditingBlockId(null)
                                        }
                                        autoFocus
                                        size="md"
                                        placeholder="Section title"
                                      />
                                      <Textarea
                                        value={block.description}
                                        onChange={(e) =>
                                          handleUpdateBlock(block.id, {
                                            description: e.target.value,
                                          })
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && e.shiftKey) {
                                            setEditingBlockId(null);
                                          }
                                        }}
                                        size="sm"
                                        placeholder="Section description"
                                        autosize
                                        minRows={2}
                                        maxRows={4}
                                      />
                                      <Text size="xs" c="dimmed">
                                        Press Shift + Enter to save
                                      </Text>
                                    </Stack>
                                  ) : (
                                    <>
                                      <Text size="lg" fw={500}>
                                        {block.title}
                                      </Text>
                                      <Text size="sm" c="dimmed">
                                        {block.description}
                                      </Text>
                                    </>
                                  )}
                                </Stack>

                                <Group gap="xs">
                                  <ActionIcon
                                    variant="subtle"
                                    onClick={() => {
                                      if (editingBlockId === block.id) {
                                        setEditingBlockId(null);
                                      } else {
                                        setEditingBlockId(block.id);
                                      }
                                    }}
                                    aria-label={
                                      editingBlockId === block.id
                                        ? 'Save changes'
                                        : 'Edit section'
                                    }
                                    size="lg"
                                    color={editingBlockId === block.id ? 'green' : 'gray'}
                                  >
                                    {editingBlockId === block.id ? (
                                      <IconCheck size={18} />
                                    ) : (
                                      <IconEdit size={18} />
                                    )}
                                  </ActionIcon>
                                  <ActionIcon
                                    variant="subtle"
                                    color="red"
                                    onClick={() => handleDeleteBlock(block.id)}
                                    disabled={generatedBlocks?.length <= 1}
                                    aria-label="Delete section"
                                    size="lg"
                                  >
                                    <IconTrash size={18} />
                                  </ActionIcon>
                                </Group>
                              </Group>
                            </Paper>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Stack>
                  )}
                </Droppable>
              </DragDropContext>

              <Button
                variant="light"
                leftSection={<IconPlus size={18} />}
                onClick={handleAddBlock}
                fullWidth
                size="md"
                mt="md"
              >
                Add New Section
              </Button>
            </Paper>

            <Group justify="center" mt="md">
              <Button
                variant="light"
                leftSection={<IconWand size={18} />}
                onClick={openRegenerateModal}
                size="md"
              >
                Regenerate Sections
              </Button>
            </Group>

            <Group justify="center" mt="xl">
              <Button variant="default" size="md" onClick={prevStep}>
                Back
              </Button>
              {generatedBlocks && (
                <Button
                  onClick={() => {
                    if (generatedBlocks) {
                      configManager.save('ideaContent', ideaContent);
                      configManager.save('contentBlocks', generatedBlocks);
                      configManager.save('selectedWriter', selectedWriter?.getConfig());
                      configManager.save(
                        'selectedReviewer',
                        selectedReviewer?.getConfig()
                      );
                      navigate('/editor');
                    }
                  }}
                  leftSection={<IconCircleCheck size={18} />}
                  size="md"
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan' }}
                >
                  Start Writing
                </Button>
              )}
            </Group>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

