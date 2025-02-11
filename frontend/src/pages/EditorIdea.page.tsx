import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
  DroppableProvided,
} from '@hello-pangea/dnd';
import {
  IconCircleCheck,
  IconEdit,
  IconGripVertical,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Collapse,
  Container,
  Divider,
  Group,
  Modal,
  Paper,
  rem,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
  Center,
  Box,
  Stepper,
} from '@mantine/core';
import { IconBulb, IconPencil, IconUsers, IconWand } from '@tabler/icons-react';
import { ContentBlock } from '@/types/content';
import { Agent } from '../services/agents/Agent';
import { AgentManager } from '../services/agents/AgentManager';
import { ConfigManager } from '../services/config/ConfigManager';
import { CONTENT_TYPES, getStructuredBlocks } from './Ideahub';

export function EditorIdea() {
  const navigate = useNavigate();
  const [contentType, setContentType] = useState<string | null>(null);
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBlocks, setGeneratedBlocks] = useState<ContentBlock[] | null>(null);
  const [showPlotModal, setShowPlotModal] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [selectedWriter, setSelectedWriter] = useState<Agent | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const configManager = new ConfigManager('editor_');

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

    // Set first writer if available and none selected
    if (availableWriters.length > 0 && !selectedWriter) {
      setSelectedWriter(availableWriters[0]);
    }

    // Set first reviewer if available and none selected
    if (availableReviewers.length > 0 && !selectedReviewer) {
      setSelectedReviewer(availableReviewers[0]);
    }
  }, []); // Empty dependency array for initial load only

  // Add a function to check if we can proceed
  const canProceed = (): boolean => {
    return !!(contentType && idea.trim() && selectedWriter && selectedReviewer);
  };

  const handleGenerateIdea = async () => {
    if (!canProceed()) {
      // Optionally show a notification to user about missing requirements
      return;
    }

    setIsGenerating(true);
    try {
      const contentBlocks = await selectedWriter.generateStructuredBlocks(contentType, idea);
      setGeneratedBlocks(contentBlocks);
      setShowPlotModal(true);
    } catch (error) {
      console.error('Failed to generate blocks:', error);
      setGeneratedBlocks(
        getStructuredBlocks(contentType, idea).map((block) => ({
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

  return (
    <>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          <Title order={1}>Content Creation Hub</Title>

          <Stepper
            active={activeStep}
            onStepClick={setActiveStep}
            allowNextStepsSelect={false}
          >
            <Stepper.Step
              label="Choose Type"
              description="Select content type"
              icon={<IconBulb size="1.2rem" />}
            >
              <Paper shadow="sm" p="xl" withBorder mt="xl">
                <Stack gap="md">
                  <Text size="lg" fw={500}>
                    What would you like to create?
                  </Text>
                  <SimpleGrid cols={{ base: 4, sm: 6, md: 9 }} spacing="md">
                    {CONTENT_TYPES.map((type) => (
                      <Card
                        key={type.value}
                        shadow="sm"
                        padding="sm"
                        radius="md"
                        withBorder
                        style={{
                          cursor: type.disabled ? 'not-allowed' : 'pointer',
                          opacity: type.disabled ? 0.5 : 1,
                        }}
                        onClick={() => {
                          if (!type.disabled) {
                            setContentType(type.value);
                            nextStep();
                          }
                        }}
                        bg={contentType === type.value ? 'blue.1' : undefined}
                      >
                        <Stack gap="xs" align="center">
                          <type.icon size={rem(24)} />
                          <Text size="sm" fw={500} ta="center">
                            {type.label}
                          </Text>
                          <Text size="xs" c="dimmed" ta="center" style={{ minHeight: rem(32) }}>
                            {type.description}
                          </Text>
                          {type.disabled && (
                            <Badge
                              color="yellow"
                              size="xs"
                              style={{ position: 'absolute', top: 5, right: 5 }}
                            >
                              Soon
                            </Badge>
                          )}
                        </Stack>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Stack>
              </Paper>
            </Stepper.Step>

            <Stepper.Step
              label="Share Idea"
              description="Describe your content"
              icon={<IconPencil size="1.2rem" />}
            >
              <Box maw={800} mx="auto" mt="xl">
                <Stack gap="xl">
                  <Center>
                    <Title order={2}>What's your idea?</Title>
                  </Center>
                  
                  <Text c="dimmed" ta="center" size="lg">
                    Describe your content idea in detail. The more specific you are, the better results you'll get.
                  </Text>

                  <Textarea
                    placeholder="For example: Write a comprehensive guide about modern JavaScript best practices, covering topics like ES6+ features, async/await, and common pitfalls to avoid..."
                    minRows={8}
                    size="xl"
                    radius="md"
                    autoFocus
                    value={idea}
                    onChange={(event) => setIdea(event.currentTarget.value)}
                    styles={{
                      input: {
                        fontSize: '1.2rem',
                        lineHeight: '1.6',
                        padding: '1rem',
                      },
                    }}
                  />

                  <Group justify="center" mt="xl">
                    <Button variant="default" onClick={prevStep}>
                      Back
                    </Button>
                    <Button onClick={nextStep} disabled={!idea.trim()}>
                      Continue
                    </Button>
                  </Group>
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
                    <Button
                      onClick={nextStep}
                      disabled={!selectedWriter || !selectedReviewer}
                    >
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
                    Let's create a structured outline for your content. Our AI will analyze your idea and break it down into meaningful sections.
                  </Text>

                  <Paper withBorder p="md" radius="md" w="100%">
                    <Stack gap="xs">
                      <Text fw={500}>Content Type:</Text>
                      <Text>{CONTENT_TYPES.find(t => t.value === contentType)?.label}</Text>
                      
                      <Text fw={500} mt="md">Your Idea:</Text>
                      <Text>{idea}</Text>
                      
                      <Text fw={500} mt="md">Your Team:</Text>
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

                              <Stack spacing="xs" style={{ flex: 1 }}>
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
