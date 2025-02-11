import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
  DroppableProvided,
} from '@hello-pangea/dnd';
import {
  IconArticle,
  IconBook,
  IconBrandBlogger,
  IconCircleCheck,
  IconEdit,
  IconFileText,
  IconGripVertical,
  IconMicrophone,
  IconPlus,
  IconTrash,
  IconVideo,
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
} from '@mantine/core';
import { ContentBlock } from '@/types/content';
import { Agent } from '../services/agents/Agent';
import { AgentManager } from '../services/agents/AgentManager';
import { ConfigManager } from '../services/config/ConfigManager';
import { BaseLLM } from '../services/llm/BaseLLM';
import { LLMFactory } from '../services/llm/LLMFactory';

const CONTENT_TYPES = [
  {
    value: 'blog',
    label: 'Blog Post',
    icon: IconBrandBlogger,
    description: 'Create engaging blog content',
  },
  {
    value: 'documentation',
    label: 'Documentation',
    icon: IconBook,
    description: 'Technical documentation and guides',
  },
  {
    value: 'article',
    label: 'Article',
    icon: IconArticle,
    description: 'In-depth articles and analysis',
  },
  {
    value: 'podcast',
    label: 'Podcast',
    icon: IconMicrophone,
    description: 'Expand your ideas into engaging podcast about any topics in minutes',
    disabled: true,
  },
  {
    value: 'reel',
    label: 'Social Media Reel',
    icon: IconVideo,
    description: 'Create short, attention-grabbing social media content from your ideas',
    disabled: true,
  },
  {
    value: 'whitepaper',
    label: 'Whitepaper',
    icon: IconFileText,
    description: 'Professional whitepapers',
    disabled: true,
  },
];

const getStructuredBlocks = (type: string, idea: string) => {
  const structures = {
    blog: [
      {
        id: 1,
        title: 'Introduction',
        content: '',
        description:
          'Set the context and hook the reader with a compelling opening that introduces your main topic.',
        comments: [],
      },
      {
        id: 2,
        title: 'The Current State of AI',
        content: '',
        description:
          'Provide an overview of the current AI landscape, including recent developments and key players.',
        comments: [],
      },
      {
        id: 3,
        title: 'Key Challenges and Opportunities',
        content: '',
        description:
          'Analyze major obstacles in AI development and potential areas for growth and innovation.',
        comments: [],
      },
      {
        id: 4,
        title: 'Real-World Applications',
        content: '',
        description:
          'Showcase practical implementations and success stories of AI in various industries.',
        comments: [],
      },
      {
        id: 5,
        title: 'Future Implications',
        content: '',
        description:
          'Explore potential future developments and their impact on society and technology.',
        comments: [],
      },
      {
        id: 6,
        title: 'Conclusion',
        content: '',
        description: 'Summarize key points and provide actionable insights or final thoughts.',
        comments: [],
      },
    ],
    documentation: [
      {
        id: 1,
        title: 'Overview',
        content: '',
        description: 'Provide a high-level introduction to the system or feature being documented.',
        comments: [],
      },
      {
        id: 2,
        title: 'Getting Started',
        content: '',
        description:
          'Guide users through initial setup and basic usage with clear, step-by-step instructions.',
        comments: [],
      },
      {
        id: 3,
        title: 'Core Concepts',
        content: '',
        description:
          'Explain fundamental concepts and terminology essential for understanding the system.',
        comments: [],
      },
      {
        id: 4,
        title: 'Advanced Usage',
        content: '',
        description: 'Cover complex features and advanced implementation scenarios.',
        comments: [],
      },
      {
        id: 5,
        title: 'Troubleshooting',
        content: '',
        description: 'Address common issues and provide solutions to typical problems.',
        comments: [],
      },
    ],
    article: [
      {
        id: 1,
        title: 'Executive Summary',
        content: '',
        description: 'Provide a brief overview of the main points and key findings.',
        comments: [],
      },
      {
        id: 2,
        title: 'Background',
        content: '',
        description: 'Present relevant context and historical information about the topic.',
        comments: [],
      },
      {
        id: 3,
        title: 'Analysis',
        content: '',
        description: 'Examine the topic in detail, including data, research, and expert insights.',
        comments: [],
      },
      {
        id: 4,
        title: 'Key Findings',
        content: '',
        description: 'Highlight the most important discoveries and conclusions from the analysis.',
        comments: [],
      },
      {
        id: 5,
        title: 'Recommendations',
        content: '',
        description: 'Provide actionable suggestions based on the analysis and findings.',
        comments: [],
      },
    ],
  };

  return (
    structures[type as keyof typeof structures] || [
      {
        id: 1,
        title: 'Content',
        content: '',
        description: 'Add your content here...',
        comments: [],
      },
    ]
  );
};

const generateStructuredBlocks = async (
  type: string,
  idea: string,
  writer: Agent,
  knowledgeBase: string = ''
): Promise<ContentBlock[]> => {
  const llm = (() => {
    // Try to find first configured provider
    const providers = LLMFactory.getAvailableProviders();
    for (const providerName of providers) {
      try {
        const provider = LLMFactory.getProvider(providerName);
        if (provider.isConfigured()) {
          return provider;
        }
      } catch (error) {
        console.error(`Error checking ${providerName} configuration:`, error);
      }
    }
    throw new Error('No configured LLM provider found');
  })();

  const systemPrompt = `You are an expert content strategist and writer. Your task is to create a detailed content structure.
Format your response as a JSON array of content blocks. Each block must have:
- id (number)
- title (string)
- description (brief context for AI, helps maintain consistency)
- content (empty string)
- comments (empty array)

Ensure the structure is comprehensive and follows best practices for ${type} content.`;
  const writerPersona = `Acting as ${writer.getConfig().name}, an expert ${writer.getConfig().expertise?.join(', ') || 'content writer'}

with the following characteristics:
${writer.getConfig().characteristics?.join('\n') || 'No specific characteristics provided'}`;

  const prompt = `${systemPrompt}

${writerPersona}

Content Type: ${type}
Main Idea: ${idea}

Knowledge Base:
${knowledgeBase}

Generate a structured outline following the specified JSON format. Ensure each section builds logically on the previous one.`;

  try {
    const response = await llm.executePrompt(prompt, { temperature: 0.7 });
    const blocks = JSON.parse(response.content);

    // Validate the structure
    const isValid = blocks.every(
      (block: any) =>
        typeof block.id === 'number' &&
        typeof block.title === 'string' &&
        typeof block.description === 'string' &&
        typeof block.content === 'string' &&
        Array.isArray(block.comments)
    );

    if (!isValid) {
      throw new Error('Invalid block structure received from LLM');
    }

    return blocks;
  } catch (error) {
    console.error('Failed to generate blocks:', error);
    // Fallback to default structure
    return getStructuredBlocks(type, idea);
  }
};

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
  const configManager = new ConfigManager('editor_');

  useEffect(() => {
    const agentManager = new AgentManager();
    const allAgents = agentManager.getAllAgents();
    setAgents(allAgents);
  }, []);

  const handleGenerateIdea = async () => {
    if (!contentType || !idea.trim() || !selectedWriter) return;

    setIsGenerating(true);
    try {
      const contentBlocks = await selectedWriter.generateStructuredBlocks(contentType, idea);
      setGeneratedBlocks(contentBlocks);
      setShowPlotModal(true);
    } catch (error) {
      console.error('Failed to generate blocks:', error);
      // Fallback to default structure
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

  return (
    <>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          <Title order={1}>Content Creation Hub</Title>

          <Paper shadow="sm" p="xl" withBorder>
            <Stack gap="md">
              <Text size="lg" fw={500}>
                What would you like to create?
              </Text>
              <SimpleGrid cols={{ base: 3, sm: 4, md: 6 }} spacing="lg">
                {CONTENT_TYPES.map((type) => (
                  <Card
                    key={type.value}
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                    style={{
                      cursor: type.disabled ? 'not-allowed' : 'pointer',
                      opacity: type.disabled ? 0.5 : 1,
                    }}
                    onClick={() => !type.disabled && setContentType(type.value)}
                    bg={contentType === type.value ? 'blue.1' : undefined}
                  >
                    <type.icon size={rem(32)} style={{ marginBottom: rem(10) }} />
                    <Text fw={500}>{type.label}</Text>
                    <Text size="sm" c="dimmed">
                      {type.description}
                    </Text>
                    {type.disabled && (
                      <Badge color="yellow" style={{ position: 'absolute', top: 10, right: 10 }}>
                        Coming Soon
                      </Badge>
                    )}
                  </Card>
                ))}
              </SimpleGrid>

              {contentType && (
                <>
                  <Divider label="Select Your Team" labelPosition="center" />

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
                </>
              )}

              <Textarea
                label="Share your idea"
                placeholder="Describe your content idea in detail..."
                minRows={5}
                value={idea}
                onChange={(event) => setIdea(event.currentTarget.value)}
                required
              />

              <Group justify="apart" mt="md">
                <Badge color="blue">AI Assisted</Badge>
                <Button
                  onClick={handleGenerateIdea}
                  loading={isGenerating}
                  disabled={!contentType || !idea.trim() || !selectedWriter || !selectedReviewer}
                >
                  Generate Content Structure
                </Button>
              </Group>
            </Stack>
          </Paper>
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
