import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Paper,
  Stack,
  Textarea,
  Button,
  Group,
  Badge,
  SimpleGrid,
  Card,
  Text,
  rem,
  Modal,
  ActionIcon,
  TextInput,
  Collapse,
} from '@mantine/core';
import { ConfigManager } from '../services/config/ConfigManager';
import { 
  IconArticle, 
  IconBook, 
  IconBrandBlogger, 
  IconMicrophone, 
  IconVideo, 
  IconFileText,
  IconCircleCheck,
  IconEdit,
  IconTrash,
  IconPlus,
  IconGripVertical,
} from '@tabler/icons-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface ContentBlock {
  id: number;
  title: string;
  content: string;
  comments: any[];
}

const CONTENT_TYPES = [
  { value: 'blog', label: 'Blog Post', icon: IconBrandBlogger, description: 'Create engaging blog content' },
  { value: 'documentation', label: 'Documentation', icon: IconBook, description: 'Technical documentation and guides' },
  { value: 'article', label: 'Article', icon: IconArticle, description: 'In-depth articles and analysis' },
  { value: 'podcast', label: 'Podcast Script', icon: IconMicrophone, description: 'Engaging podcast scripts', disabled: true },
  { value: 'reel', label: 'Social Media Reel', icon: IconVideo, description: 'Short-form video content', disabled: true },
  { value: 'whitepaper', label: 'Whitepaper', icon: IconFileText, description: 'Professional whitepapers', disabled: true },
];

const getStructuredBlocks = (type: string, idea: string) => {
  const dummyComments = [
    {
      timestamp: new Date().toISOString(),
      user: 'AI Assistant',
      comment: 'Consider expanding this section with more specific examples.',
      id: 1,
    },
    {
      timestamp: new Date().toISOString(),
      user: 'Editor',
      comment: 'The tone here aligns well with our style guide.',
      id: 2,
    },
    {
      timestamp: new Date().toISOString(),
      user: 'Technical Reviewer',
      comment: 'Make sure to fact-check these statistics.',
      id: 3,
    }
  ];

  const structures = {
    blog: [
      { 
        id: 1, 
        title: 'Introduction', 
        content: '# Introduction\n' + idea, 
        comments: [dummyComments[0]]
      },
      { 
        id: 2, 
        title: 'The Current State of AI', 
        content: '# The Current State of AI\nDiscuss the current landscape...', 
        comments: [dummyComments[1], dummyComments[2]]
      },
      { 
        id: 3, 
        title: 'Key Challenges and Opportunities', 
        content: '# Key Challenges and Opportunities\nExplore the main challenges...', 
        comments: [dummyComments[0], dummyComments[1]]
      },
      { 
        id: 4, 
        title: 'Real-World Applications', 
        content: '# Real-World Applications\nPresent concrete examples...', 
        comments: [dummyComments[2]]
      },
      { 
        id: 5, 
        title: 'Future Implications', 
        content: '# Future Implications\nAnalyze potential future developments...', 
        comments: [dummyComments[1]]
      },
      { 
        id: 6, 
        title: 'Conclusion', 
        content: '# Conclusion\nSummarize key points and provide final thoughts...', 
        comments: [dummyComments[0]]
      },
    ],
    documentation: [
      { 
        id: 1, 
        title: 'Overview', 
        content: '# Overview\n' + idea, 
        comments: [dummyComments[0], dummyComments[1]]
      },
      { 
        id: 2, 
        title: 'Getting Started', 
        content: '# Getting Started\nStep-by-step guide...', 
        comments: [dummyComments[2]]
      },
      { 
        id: 3, 
        title: 'Core Concepts', 
        content: '# Core Concepts\nKey concepts and terminology...', 
        comments: [dummyComments[0]]
      },
      { 
        id: 4, 
        title: 'Advanced Usage', 
        content: '# Advanced Usage\nDetailed examples...', 
        comments: [dummyComments[1]]
      },
      { 
        id: 5, 
        title: 'Troubleshooting', 
        content: '# Troubleshooting\nCommon issues and solutions...', 
        comments: [dummyComments[2]]
      },
    ],
    article: [
      { 
        id: 1, 
        title: 'Executive Summary', 
        content: '# Executive Summary\n' + idea, 
        comments: [dummyComments[0], dummyComments[2]]
      },
      { 
        id: 2, 
        title: 'Background', 
        content: '# Background\nContextual information...', 
        comments: [dummyComments[1]]
      },
      { 
        id: 3, 
        title: 'Analysis', 
        content: '# Analysis\nIn-depth analysis...', 
        comments: [dummyComments[0]]
      },
      { 
        id: 4, 
        title: 'Key Findings', 
        content: '# Key Findings\nMain discoveries...', 
        comments: [dummyComments[2]]
      },
      { 
        id: 5, 
        title: 'Recommendations', 
        content: '# Recommendations\nActionable insights...', 
        comments: [dummyComments[1], dummyComments[0]]
      },
    ],
  };
  
  return structures[type as keyof typeof structures] || [{ id: 1, title: 'Content', content: idea, comments: [] }];
};

export function EditorIdea() {
  const navigate = useNavigate();
  const [contentType, setContentType] = useState<string | null>(null);
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBlocks, setGeneratedBlocks] = useState<ContentBlock[] | null>(null);
  const [showPlotModal, setShowPlotModal] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const configManager = new ConfigManager('editor_');

  const handleGenerateIdea = () => {
    if (!contentType || !idea.trim()) return;

    setIsGenerating(true);
    try {
      const contentBlocks = getStructuredBlocks(contentType, idea);
      setGeneratedBlocks(contentBlocks);
      setShowPlotModal(true);
    } catch (error) {
      console.error('Failed to generate content blocks:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprovePlot = () => {
    if (generatedBlocks) {
      configManager.save('contentBlocks', generatedBlocks);
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
    
    setGeneratedBlocks(blocks => 
      blocks?.map(block => 
        block.id === blockId ? { ...block, ...updates } : block
      ) ?? null
    );
  };

  const handleAddBlock = () => {
    if (!generatedBlocks) return;
    
    const newBlock: ContentBlock = {
      id: Math.max(...generatedBlocks.map(b => b.id)) + 1,
      title: 'New Section',
      content: '# New Section\nAdd your content here...',
      comments: []
    };
    
    setGeneratedBlocks([...generatedBlocks, newBlock]);
    setEditingBlockId(newBlock.id);
  };

  const handleDeleteBlock = (blockId: number) => {
    if (!generatedBlocks || generatedBlocks.length <= 1) return;
    
    setGeneratedBlocks(blocks => 
      blocks?.filter(block => block.id !== blockId) ?? null
    );
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination || !generatedBlocks) return;

    const items = Array.from(generatedBlocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setGeneratedBlocks(items);
  };

  return (
    <>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          <Title order={1}>Content Creation Hub</Title>

          <Paper shadow="sm" p="xl" withBorder>
            <Stack gap="md">
              <Text size="lg" fw={500}>What would you like to create?</Text>
              <SimpleGrid cols={3}>
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
                    <Text size="sm" c="dimmed">{type.description}</Text>
                    {type.disabled && (
                      <Badge color="yellow" style={{ position: 'absolute', top: 10, right: 10 }}>
                        Coming Soon
                      </Badge>
                    )}
                  </Card>
                ))}
              </SimpleGrid>

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
                  disabled={!contentType || !idea.trim()}
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
        title={
          <Title order={3}>Content Structure</Title>
        }
      >
        <Stack gap="md">
          <Text>
            Review and customize your content structure. You can reorder sections by dragging them, 
            edit their titles, or add new sections as needed.
          </Text>

          <Paper withBorder p="md">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sections">
                {(provided) => (
                  <Stack gap="xs" ref={provided.innerRef} {...provided.droppableProps}>
                    {generatedBlocks?.map((block, index) => (
                      <Draggable key={block.id} draggableId={String(block.id)} index={index}>
                        {(provided) => (
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

                              {editingBlockId === block.id ? (
                                <TextInput
                                  value={block.title}
                                  onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                                  onBlur={() => setEditingBlockId(null)}
                                  onKeyDown={(e) => e.key === 'Enter' && setEditingBlockId(null)}
                                  autoFocus
                                  style={{ flex: 1 }}
                                />
                              ) : (
                                <Text fw={500} style={{ flex: 1 }}>{block.title}</Text>
                              )}

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
            <Button 
              onClick={handleApprovePlot}
              leftSection={<IconCircleCheck size={16} />}
            >
              Proceed to Editor
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
