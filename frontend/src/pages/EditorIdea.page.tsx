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
} from '@mantine/core';
import { ConfigManager } from '../services/config/ConfigManager';
import { IconArticle, IconBook, IconBrandBlogger, IconMicrophone, IconVideo, IconFileText } from '@tabler/icons-react';

const CONTENT_TYPES = [
  { value: 'blog', label: 'Blog Post', icon: IconBrandBlogger, description: 'Create engaging blog content' },
  { value: 'documentation', label: 'Documentation', icon: IconBook, description: 'Technical documentation and guides' },
  { value: 'article', label: 'Article', icon: IconArticle, description: 'In-depth articles and analysis' },
  { value: 'podcast', label: 'Podcast Script', icon: IconMicrophone, description: 'Engaging podcast scripts', disabled: true },
  { value: 'reel', label: 'Social Media Reel', icon: IconVideo, description: 'Short-form video content', disabled: true },
  { value: 'whitepaper', label: 'Whitepaper', icon: IconFileText, description: 'Professional whitepapers', disabled: true },
];

const getStructuredBlocks = (type: string, idea: string) => {
  const structures = {
    blog: [
      { id: 1, title: 'Introduction', content: '# Introduction\n' + idea, comments: [] },
      { id: 2, title: 'The Current State of AI', content: '# The Current State of AI\nDiscuss the current landscape...', comments: [] },
      { id: 3, title: 'Key Challenges and Opportunities', content: '# Key Challenges and Opportunities\nExplore the main challenges...', comments: [] },
      { id: 4, title: 'Real-World Applications', content: '# Real-World Applications\nPresent concrete examples...', comments: [] },
      { id: 5, title: 'Future Implications', content: '# Future Implications\nAnalyze potential future developments...', comments: [] },
      { id: 6, title: 'Conclusion', content: '# Conclusion\nSummarize key points and provide final thoughts...', comments: [] },
    ],
    documentation: [
      { id: 1, title: 'Overview', content: '# Overview\n' + idea, comments: [] },
      { id: 2, title: 'Getting Started', content: '# Getting Started\nStep-by-step guide...', comments: [] },
      { id: 3, title: 'Core Concepts', content: '# Core Concepts\nKey concepts and terminology...', comments: [] },
      { id: 4, title: 'Advanced Usage', content: '# Advanced Usage\nDetailed examples...', comments: [] },
      { id: 5, title: 'Troubleshooting', content: '# Troubleshooting\nCommon issues and solutions...', comments: [] },
    ],
    article: [
      { id: 1, title: 'Executive Summary', content: '# Executive Summary\n' + idea, comments: [] },
      { id: 2, title: 'Background', content: '# Background\nContextual information...', comments: [] },
      { id: 3, title: 'Analysis', content: '# Analysis\nIn-depth analysis...', comments: [] },
      { id: 4, title: 'Key Findings', content: '# Key Findings\nMain discoveries...', comments: [] },
      { id: 5, title: 'Recommendations', content: '# Recommendations\nActionable insights...', comments: [] },
    ],
  };
  
  return structures[type as keyof typeof structures] || [{ id: 1, title: 'Content', content: idea, comments: [] }];
};

export function EditorIdea() {
  const navigate = useNavigate();
  const [contentType, setContentType] = useState<string | null>(null);
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const configManager = new ConfigManager('editor_');

  const handleGenerateIdea = () => {
    if (!contentType || !idea.trim()) return;

    setIsGenerating(true);
    try {
      const contentBlocks = getStructuredBlocks(contentType, idea);
      configManager.save('contentBlocks', contentBlocks);
      navigate('/editor');
    } catch (error) {
      console.error('Failed to generate content blocks:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
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
  );
}
