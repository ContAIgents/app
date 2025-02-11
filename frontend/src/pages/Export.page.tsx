import { useEffect, useState } from 'react';
import { IconLock } from '@tabler/icons-react';
import { Button, Container, Group, Stack, Text, Textarea, Title, Tooltip } from '@mantine/core';
import { ConfigManager } from '@/services/config/ConfigManager';
import { Comment, ContentBlock } from '@/types/content';

export function ExportPage() {
  const [finalContent, setFinalContent] = useState('');

  useEffect(() => {
    const configManager = new ConfigManager('editor_');
    const contentBlocks: ContentBlock[] = configManager.load('contentBlocks') || [];
    console.log(contentBlocks);
    const finalContent = contentBlocks.map((block: ContentBlock) => block.content).join('\n');
    setFinalContent(finalContent);
  }, []);

  const handleExport = (format: string) => {
    console.log(`Exporting as ${format}`);
    // Add your export logic here
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" mb="md">
          <div>
            <Title order={1}>Final Content</Title>
            <Text c="dimmed" size="sm">
              Export your content in various formats
            </Text>
          </div>
        </Group>
        <Group align="stretch" style={{ width: '100%' }}>
          <Textarea
            value={finalContent}
            autosize
            style={{ height: '100%', flex: 1, marginRight: '20px' }}
          />

          <Stack gap="md" align="stretch">
            <Button onClick={() => handleExport('pdf')}>Export as PDF</Button>
            <Button onClick={() => handleExport('text')}>Export as Text</Button>
            <Button onClick={() => handleExport('blog')}>Export as Blog</Button>

            <Tooltip label="Coming Soon!">
              <Button variant="light" disabled onClick={() => handleExport('podcast')}>
                Export as Podcast <IconLock size="1rem" />
              </Button>
            </Tooltip>
            <Tooltip label="Coming Soon!">
              <Button variant="light" disabled onClick={() => handleExport('image')}>
                Export as Image <IconLock size="1rem" />
              </Button>
            </Tooltip>
            <Tooltip label="Coming Soon!">
              <Button variant="light" disabled onClick={() => handleExport('video')}>
                Export as Video <IconLock size="1rem" />
              </Button>
            </Tooltip>
          </Stack>
        </Group>
      </Stack>
    </Container>
  );
}
