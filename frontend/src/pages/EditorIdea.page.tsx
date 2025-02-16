import { useEffect, useRef, useState } from 'react';
import { keyframes } from '@emotion/react';
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
  DroppableProvided,
} from '@hello-pangea/dnd';
import {
  IconArrowRight,
  IconBulb,
  IconCircleCheck,
  IconEdit,
  IconGripVertical,
  IconPencil,
  IconPlus,
  IconTrash,
  IconUsers,
  IconWand,
} from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Collapse,
  Container,
  Divider,
  Group,
  Modal,
  Paper,
  rem,
  SimpleGrid,
  Stack,
  Stepper,
  Text,
  Textarea,
  TextInput,
  Title,
  Transition,
} from '@mantine/core';
import { useClickOutside, useFocusTrap } from '@mantine/hooks';
import { CONTENT_TYPE_PLACEHOLDERS } from '@/constants/contentTypes';
import { ContentBlock } from '@/types/content';
import { CONTENT_TYPES, getStructuredBlocks } from '../constants/ideahub';
import { Agent } from '../services/agents/Agent';
import { AgentManager } from '../services/agents/AgentManager';
import { ConfigManager } from '../services/config/ConfigManager';

const getRandomPlaceholder = (contentType: string | null): string => {
  if (
    !contentType ||
    !CONTENT_TYPE_PLACEHOLDERS[contentType as keyof typeof CONTENT_TYPE_PLACEHOLDERS]
  ) {
    return "Describe your content idea in detail. The more specific you are, the better results you'll get...";
  }
  const placeholders =
    CONTENT_TYPE_PLACEHOLDERS[contentType as keyof typeof CONTENT_TYPE_PLACEHOLDERS];
  return placeholders[Math.floor(Math.random() * placeholders.length)];
};

const waveAnimation = keyframes`
  0% { transform: translateX(0) }
  50% { transform: translateX(5px) }
  100% { transform: translateX(0) }
`;

export function EditorIdea() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialContentType = searchParams.get('type');

  const [contentType, setContentType] = useState<string | null>(initialContentType);
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBlocks, setGeneratedBlocks] = useState<ContentBlock[] | null>(null);
  const [showPlotModal, setShowPlotModal] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [selectedWriter, setSelectedWriter] = useState<Agent | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const configManager = new ConfigManager('editor_');
  const inputRef = useRef<HTMLInputElement>(null);
  const focusTrapRef = useFocusTrap();
  const suggestionsRef = useClickOutside(() => setShowSuggestions(false));

  // Redirect if no content type is provided
  useEffect(() => {
    if (!initialContentType) {
      navigate('/');
    }
  }, [initialContentType, navigate]);

  useEffect(() => {
    const agentManager = new AgentManager();
    const allAgents = agentManager.getAllAgents();
    setAgents(allAgents);

    // Auto-select first available writer and reviewer
    const availableWriters = allAgents.filter(
      (agent) => agent.getConfig().role === 'content_writer'
    );
    const availableReviewers = allAgents.filter(
      (agent) => agent.getConfig().role === 'content_reviewer'
    );

    if (availableWriters.length > 0 && !selectedWriter) {
      setSelectedWriter(availableWriters[0]);
    }

    if (availableReviewers.length > 0 && !selectedReviewer) {
      setSelectedReviewer(availableReviewers[0]);
    }
  }, []);

  useEffect(() => {
    setCurrentPlaceholder(getRandomPlaceholder(contentType));
  }, [contentType]);

  // Update canProceed to not check for contentType since it's required
  const canProceed = (): boolean => {
    return !!(idea.trim() && selectedWriter && selectedReviewer);
  };

  const handleGenerateIdea = async () => {
    if (!canProceed()) {
      // Optionally show a notification to user about missing requirements
      return;
    }

    setIsGenerating(true);
    try {
      if (!selectedWriter || !contentType) {
        throw new Error('Writer and content type must be selected');
      }
      const contentBlocks = await selectedWriter.generateStructuredBlocks(contentType, idea);
      setGeneratedBlocks(contentBlocks);
      setShowPlotModal(true);
    } catch (error) {
      console.error('Failed to generate blocks:', error);
      setGeneratedBlocks(
        getStructuredBlocks(contentType || '', idea).map((block) => ({
          ...block,
          description: block.description,
        }))
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprovePlot = () => {
    if (generatedBlocks) {
      configManager.save('contentBlocks', generatedBlocks);
      configManager.save('idea', idea);
      configManager.save('contentType', contentType);
      configManager.save('selectedWriter', selectedWriter?.getConfig());
      configManager.save('selectedReviewer', selectedReviewer?.getConfig());
      setShowPlotModal(false);
      navigate('/editor');
    }
  };

  const handleRejectPlot = () => {
    setShowPlotModal(false);
    setGeneratedBlocks(null);
    setEditingBlockId(null);
  };

  const handleUpdateBlock = (blockId: number, updates: Partial<ContentBlock>) => {
    if (!generatedBlocks) return;

    setGeneratedBlocks(
      (blocks) =>
        blocks?.map((block) => (block.id === blockId ? { ...block, ...updates } : block)) ?? null
    );
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

    setGeneratedBlocks((blocks) => blocks?.filter((block) => block.id !== blockId) ?? null);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination || !generatedBlocks) return;

    const items = Array.from(generatedBlocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setGeneratedBlocks(items);
  };

  // Filter agents by role
  const writers = agents.filter((agent) => agent.getConfig().role === 'content_writer');
  const reviewers = agents.filter((agent) => agent.getConfig().role === 'content_reviewer');

  const nextStep = () => {
    if (activeStep === 0 && !contentType) return;
    if (activeStep === 1 && !idea.trim()) return;
    if (activeStep === 2 && (!selectedWriter || !selectedReviewer)) return;
    setActiveStep((current) => current + 1);
  };

  const prevStep = () => setActiveStep((current) => current - 1);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check if it's space bar and textarea is empty
    if (event.code === 'Space' && !idea.trim()) {
      event.preventDefault(); // Prevent actual space from being added
      setIdea(currentPlaceholder);
    }
  };

  const handleTextAreaFocus = () => {
    if (!idea.trim()) {
      const newPlaceholder = getRandomPlaceholder(contentType);
      setCurrentPlaceholder(newPlaceholder);
    }
  };

  const getSuggestions = () => {
    if (!contentType || !idea.trim()) return [];
    return CONTENT_TYPE_PLACEHOLDERS[contentType as keyof typeof CONTENT_TYPE_PLACEHOLDERS]
      .filter((suggestion) => suggestion.toLowerCase().includes(idea.toLowerCase()))
      .slice(0, 5);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setIdea(suggestion);
    setShowSuggestions(false);
    nextStep();
  };

  return (
    <>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          <Stepper active={activeStep} onStepClick={setActiveStep} allowNextStepsSelect={false}>
            {/* Remove the first step for content type selection */}
            <Stepper.Step
              label="Ideate"
              description="Describe your content"
              icon={<IconPencil size="1.2rem" />}
            >
              <Box
                maw={800}
                mx="auto"
                mt={50}
                style={{
                  minHeight: '70vh',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Stack gap="xl" align="center" style={{ width: '100%' }}>
                  <Box mb={40}>
                    <Title
                      order={1}
                      size="3.5rem"
                      ta="center"
                      style={{
                        transition: 'transform 0.3s ease',
                        transform: isFocused ? 'translateY(-20px)' : 'none',
                      }}
                    >
                      What would you like to write about?
                    </Title>
                  </Box>

                  <Box
                    style={{ width: '100%', maxWidth: 700, position: 'relative' }}
                    ref={focusTrapRef}
                  >
                    <TextInput
                      ref={inputRef}
                      size="xl"
                      radius="md"
                      placeholder="Start typing your idea..."
                      value={idea}
                      onChange={(event) => {
                        setIdea(event.currentTarget.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => {
                        setIsFocused(true);
                        setShowSuggestions(true);
                      }}
                      rightSection={
                        idea.trim() && (
                          <Button
                            variant="gradient"
                            gradient={{ from: 'indigo', to: 'cyan' }}
                            size="md"
                            radius="md"
                            onClick={() => nextStep()}
                            style={{ marginRight: -8 }}
                          >
                            GO
                            <IconArrowRight size="1rem" style={{ marginLeft: 8 }} />
                          </Button>
                        )
                      }
                      styles={{
                        input: {
                          height: 65,
                          fontSize: '1.4rem',
                          padding: '0 1.5rem',
                          boxShadow: isFocused ? '0 8px 24px rgba(0,0,0,0.12)' : 'none',
                          transition: 'all 0.3s ease',
                          '&:focus': {
                            transform: 'scale(1.02)',
                          },
                        },
                        section: {
                          width: 'auto',
                          paddingRight: 8
                        }
                      }}
                    />

                    <Transition
                      mounted={showSuggestions && getSuggestions().length > 0}
                      transition="pop-bottom-left"
                      duration={200}
                    >
                      {(styles) => (
                        <Paper
                          ref={suggestionsRef}
                          shadow="md"
                          radius="md"
                          p="md"
                          style={{
                            ...styles,
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            right: 0,
                            zIndex: 100,
                          }}
                        >
                          <Stack gap="xs">
                            {getSuggestions().map((suggestion, index) => (
                              <Box
                                key={index}
                                p="md"
                                style={{
                                  cursor: 'pointer',
                                  borderRadius: 8,
                                  transition: 'background-color 0.2s ease',
                                  '&:hover': {
                                    backgroundColor: 'var(--mantine-color-blue-0)',
                                  },
                                }}
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                <Text size="lg">{suggestion}</Text>
                              </Box>
                            ))}
                          </Stack>
                        </Paper>
                      )}
                    </Transition>
                  </Box>

                  <Text
                    c="dimmed"
                    size="sm"
                    mt="xl"
                    style={{
                      transition: 'opacity 0.3s ease',
                      opacity: isFocused ? 0 : 0.7,
                    }}
                  >
                    Press Space to see suggestions or start typing your idea
                  </Text>
                </Stack>
              </Box>
            </Stepper.Step>

            <Stepper.Step
              label="Select Team"
              description="Choose your AI team"
              icon={<IconUsers size="1.2rem" />}
            >
              <Paper shadow="sm" p="xl" withBorder mt="xl">
                <Stack gap="xl">
                  <Text size="lg" fw={500}>
                    Choose your Content Writer
                  </Text>
                  <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="lg">
                    {writers.map((writer) => {
                      const config = writer.getConfig();
                      return (
                        <Card
                          key={config.id}
                          shadow="sm"
                          padding="lg"
                          radius="md"
                          withBorder
                          onClick={() => setSelectedWriter(writer)}
                          style={{
                            cursor: 'pointer',
                            opacity: selectedWriter?.getConfig().id === config.id ? 1 : 0.7,
                          }}
                          bg={selectedWriter?.getConfig().id === config.id ? 'blue.1' : undefined}
                        >
                          <Group>
                            <Avatar size="md" src={config.avatar} color="blue">
                              {config.name.charAt(0)}
                            </Avatar>
                            <div>
                              <Text fw={500} size="sm">
                                {config.name}
                              </Text>
                              <Group gap={5} mt={3}>
                                {config.expertise?.slice(0, 2).map((skill) => (
                                  <Badge key={skill} size="xs" variant="light">
                                    {skill}
                                  </Badge>
                                ))}
                              </Group>
                            </div>
                          </Group>
                        </Card>
                      );
                    })}
                  </SimpleGrid>

                  <Text size="lg" fw={500}>
                    Choose your Content Reviewer
                  </Text>
                  <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="lg">
                    {reviewers.map((reviewer) => {
                      const config = reviewer.getConfig();
                      return (
                        <Card
                          key={config.id}
                          shadow="sm"
                          padding="lg"
                          radius="md"
                          withBorder
                          onClick={() => setSelectedReviewer(reviewer)}
                          style={{
                            cursor: 'pointer',
                            opacity: selectedReviewer?.getConfig().id === config.id ? 1 : 0.7,
                          }}
                          bg={
                            selectedReviewer?.getConfig().id === config.id ? 'green.1' : undefined
                          }
                        >
                          <Group>
                            <Avatar size="md" src={config.avatar} color="green">
                              {config.name.charAt(0)}
                            </Avatar>
                            <div>
                              <Text fw={500} size="sm">
                                {config.name}
                              </Text>
                              <Group gap={5} mt={3}>
                                {config.expertise?.slice(0, 2).map((skill) => (
                                  <Badge key={skill} size="xs" variant="light">
                                    {skill}
                                  </Badge>
                                ))}
                              </Group>
                            </div>
                          </Group>
                        </Card>
                      );
                    })}
                  </SimpleGrid>

                  <Group justify="center" mt="xl">
                    <Button variant="default" onClick={prevStep}>
                      Back
                    </Button>
                    <Button onClick={nextStep} disabled={!selectedWriter || !selectedReviewer}>
                      Continue
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            </Stepper.Step>

            <Stepper.Step
              label="Generate"
              description="Create content structure"
              icon={<IconWand size="1.2rem" />}
            >
              <Box maw={800} mx="auto" mt="xl">
                <Stack gap="xl" align="center">
                  <Title order={2}>Ready to Generate</Title>

                  <Text c="dimmed" ta="center" size="lg">
                    Let's create a structured outline for your content. Our AI will analyze your
                    idea and break it down into meaningful sections.
                  </Text>

                  <Paper withBorder p="md" radius="md" w="100%">
                    <Stack gap="xs">
                      <Text fw={500}>Content Type:</Text>
                      <Text>{CONTENT_TYPES.find((t) => t.value === contentType)?.label}</Text>

                      <Text fw={500} mt="md">
                        Your Idea:
                      </Text>
                      <Text>{idea}</Text>

                      <Text fw={500} mt="md">
                        Your Team:
                      </Text>
                      <Group>
                        <Text>Writer: {selectedWriter?.getConfig().name}</Text>
                        <Text>Reviewer: {selectedReviewer?.getConfig().name}</Text>
                      </Group>
                    </Stack>
                  </Paper>

                  <Group justify="center" mt="xl">
                    <Button variant="default" onClick={prevStep}>
                      Back
                    </Button>
                    <Button
                      onClick={handleGenerateIdea}
                      loading={isGenerating}
                      size="lg"
                      variant="gradient"
                      gradient={{ from: 'blue', to: 'cyan' }}
                    >
                      Generate Content Structure
                    </Button>
                  </Group>
                </Stack>
              </Box>
            </Stepper.Step>
          </Stepper>
        </Stack>
      </Container>

      <Modal
        opened={showPlotModal}
        onClose={handleRejectPlot}
        size="xl"
        title={<Title order={3}>Content Structure</Title>}
      >
        <Stack gap="md">
          <Text>
            Review and customize your content structure. You can reorder sections by dragging them,
            edit their titles, or add new sections as needed.
          </Text>

          <Paper withBorder p="md">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sections">
                {(provided: DroppableProvided) => (
                  <Stack gap="xs" ref={provided.innerRef} {...provided.droppableProps}>
                    {generatedBlocks?.map((block, index) => (
                      <Draggable key={block.id} draggableId={String(block.id)} index={index}>
                        {(provided: DraggableProvided) => (
                          <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            withBorder
                            p="sm"
                          >
                            <Group gap="xs">
                              <ActionIcon
                                variant="subtle"
                                {...provided.dragHandleProps}
                                aria-label="Drag to reorder"
                              >
                                <IconGripVertical size={16} />
                              </ActionIcon>

                              <Stack gap="xs" style={{ flex: 1 }}>
                                {editingBlockId === block.id ? (
                                  <TextInput
                                    value={block.title}
                                    onChange={(e) =>
                                      handleUpdateBlock(block.id, { title: e.target.value })
                                    }
                                    onBlur={() => setEditingBlockId(null)}
                                    onKeyDown={(e) => e.key === 'Enter' && setEditingBlockId(null)}
                                    autoFocus
                                  />
                                ) : (
                                  <Text fw={500}>{block.title}</Text>
                                )}
                                <Text size="sm" c="dimmed">
                                  {block.description}
                                </Text>
                              </Stack>

                              <Group gap="xs">
                                <ActionIcon
                                  variant="subtle"
                                  onClick={() => setEditingBlockId(block.id)}
                                  aria-label="Edit section title"
                                >
                                  <IconEdit size={16} />
                                </ActionIcon>
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  onClick={() => handleDeleteBlock(block.id)}
                                  disabled={generatedBlocks.length <= 1}
                                  aria-label="Delete section"
                                >
                                  <IconTrash size={16} />
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
              leftSection={<IconPlus size={16} />}
              onClick={handleAddBlock}
              mt="md"
              fullWidth
            >
              Add New Section
            </Button>
          </Paper>

          <Group justify="flex-end" mt="xl">
            <Button variant="light" color="red" onClick={handleRejectPlot}>
              Start Over
            </Button>
            <Button onClick={handleApprovePlot} leftSection={<IconCircleCheck size={16} />}>
              Proceed to Editor
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
