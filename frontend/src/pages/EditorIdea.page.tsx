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
  IconCheck,
  IconCircleCheck,
  IconEdit,
  IconGripVertical,
  IconInfoCircle,
  IconPencil,
  IconPlus,
  IconTrash,
  IconUsers,
  IconWand,
} from '@tabler/icons-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  Loader,
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
  Tooltip,
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

  useEffect(() => {
    if (activeStep === 2 && !generatedBlocks && !isGenerating) {
      // 2 is the index of the Generate step
      handleGenerateIdea();
    }
  }, [activeStep]);

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
      console.log('Generated blocks:', contentBlocks);
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
                          paddingRight: 8,
                        },
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
              label="Team Up"
              description="Build your dream AI team"
              icon={<IconUsers size="1.2rem" />}
            >
              <Stack gap="xl" style={{ height: 'calc(100vh - 200px)', overflow: 'hidden' }}>
                <Box
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  <Title order={1} size="3.5rem" mb="md">
                    Team Up with AI
                  </Title>
                  <Text c="dimmed" size="xl" maw={600}>
                    Choose your AI collaborators to bring your content to life
                  </Text>
                </Box>

                <Group align="flex-start" gap="xl" justify="center" style={{ flex: 1 }}>
                  {/* Writer Section */}
                  <Box style={{ width: '400px', height: '100%' }}>
                    <Box
                      p="lg"
                      style={{
                        border: '2px dotted var(--mantine-color-gray-4)',
                        borderRadius: 'var(--mantine-radius-md)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Box
                        style={{
                          textAlign: 'center',
                          padding: '2rem 0',
                          borderBottom: '1px solid var(--mantine-color-gray-2)',
                        }}
                      >
                        <Title order={3} size="h3">
                          Your Content Writer
                        </Title>
                        <Text size="sm" c="dimmed" mt="xs">
                          Will create your content with expertise
                        </Text>
                      </Box>

                      {writers.length > 0 ? (
                        <Box style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                          <Stack gap="md" mt="xl">
                            {writers.map((writer) => {
                              const config = writer.getConfig();
                              const isSelected = selectedWriter?.getConfig().id === config.id;
                              return (
                                <Card
                                  key={config.id}
                                  padding="md"
                                  radius="md"
                                  onClick={() => setSelectedWriter(writer)}
                                  style={{
                                    cursor: 'pointer',
                                    border: isSelected
                                      ? '2px solid var(--mantine-color-blue-5)'
                                      : '1px solid var(--mantine-color-gray-3)',
                                    backgroundColor: 'transparent',
                                  }}
                                >
                                  <Group>
                                    <Avatar
                                      size="md"
                                      src={config.avatar}
                                      color={isSelected ? 'blue' : 'gray'}
                                    >
                                      {config.name.charAt(0)}
                                    </Avatar>
                                    <div>
                                      <Text fw={500} size="lg">
                                        {config.name}
                                      </Text>
                                      <Group gap={5} mt={3}>
                                        {config.expertise?.slice(0, 2).map((skill) => (
                                          <Badge
                                            key={skill}
                                            size="sm"
                                            variant="dot"
                                            color={isSelected ? 'blue' : 'gray'}
                                          >
                                            {skill}
                                          </Badge>
                                        ))}
                                      </Group>
                                    </div>
                                  </Group>
                                </Card>
                              );
                            })}
                          </Stack>
                        </Box>
                      ) : (
                        <Stack justify="center" align="center" style={{ flex: 1 }}>
                          <Text c="dimmed">No content writers available</Text>
                          <Button
                            variant="light"
                            component={Link}
                            to="/agents"
                            leftSection={<IconPlus size="1rem" />}
                          >
                            Create a Writer
                          </Button>
                        </Stack>
                      )}
                    </Box>
                  </Box>

                  {/* Separator */}
                  <Divider orientation="vertical" h="100%" />

                  {/* Reviewer Section */}
                  <Box style={{ width: '400px', height: '100%' }}>
                    <Box
                      p="lg"
                      style={{
                        border: '2px dotted var(--mantine-color-gray-4)',
                        borderRadius: 'var(--mantine-radius-md)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Box
                        style={{
                          textAlign: 'center',
                          padding: '2rem 0',
                          borderBottom: '1px solid var(--mantine-color-gray-2)',
                        }}
                      >
                        <Title order={3} size="h3">
                          Your Content Reviewer
                        </Title>
                        <Text size="sm" c="dimmed" mt="xs">
                          Will review and improve your content
                        </Text>
                      </Box>

                      {reviewers.length > 0 ? (
                        <Box style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                          <Stack gap="md" mt="xl">
                            {reviewers.map((reviewer) => {
                              const config = reviewer.getConfig();
                              const isSelected = selectedReviewer?.getConfig().id === config.id;
                              return (
                                <Card
                                  key={config.id}
                                  padding="md"
                                  radius="md"
                                  onClick={() => setSelectedReviewer(reviewer)}
                                  style={{
                                    cursor: 'pointer',
                                    border: isSelected
                                      ? '2px solid var(--mantine-color-blue-5)'
                                      : '1px solid var(--mantine-color-gray-3)',
                                    backgroundColor: 'transparent',
                                  }}
                                >
                                  <Group>
                                    <Avatar
                                      size="md"
                                      src={config.avatar}
                                      color={isSelected ? 'blue' : 'gray'}
                                    >
                                      {config.name.charAt(0)}
                                    </Avatar>
                                    <div>
                                      <Text fw={500} size="lg">
                                        {config.name}
                                      </Text>
                                      <Group gap={5} mt={3}>
                                        {config.expertise?.slice(0, 2).map((skill) => (
                                          <Badge
                                            key={skill}
                                            size="sm"
                                            variant="dot"
                                            color={isSelected ? 'blue' : 'gray'}
                                          >
                                            {skill}
                                          </Badge>
                                        ))}
                                      </Group>
                                    </div>
                                  </Group>
                                </Card>
                              );
                            })}
                          </Stack>
                        </Box>
                      ) : (
                        <Stack justify="center" align="center" style={{ flex: 1 }}>
                          <Text c="dimmed">No content reviewers available</Text>
                          <Button
                            variant="light"
                            component={Link}
                            to="/agents"
                            leftSection={<IconPlus size="1rem" />}
                          >
                            Create a Reviewer
                          </Button>
                        </Stack>
                      )}
                    </Box>
                  </Box>
                </Group>

                {/* Add navigation buttons */}
                <Group justify="center" mt="auto" pb="md">
                  <Button variant="default" onClick={prevStep}>
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    disabled={!selectedWriter || !selectedReviewer}
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan' }}
                  >
                    Continue
                  </Button>
                </Group>
              </Stack>
            </Stepper.Step>

            <Stepper.Step
              label="Generate"
              description="Create content structure"
              icon={<IconWand size="1.2rem" />}
            >
              <Box maw={1000} mx="auto" mt="xl">
                <Stack gap="xl">
                  <Stack gap="xs" ta="center">
                    <Title order={1} size="3rem" fw={900}>
                      Let's get it to a plan
                    </Title>
                    <Group justify="center">
                      <Text c="dimmed" size="md" maw={600} mx="auto">
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

                      <Group justify="center" mt="xl">
                        <Button variant="default" size="md" onClick={prevStep}>
                          Back
                        </Button>
                        {generatedBlocks && (
                          <Button
                            onClick={() => {
                              if (generatedBlocks) {
                                configManager.save('contentBlocks', generatedBlocks);
                                configManager.save('selectedWriter', selectedWriter?.getConfig());
                                configManager.save('selectedReviewer', selectedReviewer?.getConfig());
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
            </Stepper.Step>
          </Stepper>
        </Stack>
      </Container>
    </>
  );
}
