import { useEffect, useState } from 'react';
import { IconLock, IconFileText, IconDownload } from '@tabler/icons-react';
import { Button, Container, Stack, Text, Title, Tooltip, Group } from '@mantine/core';
import ExportCard from '@/components/Export/ExportCard';
import MarkdownEditorComponent from '@/components/MarkdownEditor';
import { ConfigManager } from '@/services/config/ConfigManager';
import { ContentBlock } from '@/types/content';

export function ExportPage() {
  const [finalContent, setFinalContent] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const configManager = new ConfigManager('editor_');

  useEffect(() => {
    const contentBlocks = configManager.load<ContentBlock[]>('contentBlocks') || [];
    const combinedContent = contentBlocks
      .map((block) => `## ${block.title}\n\n${block.content}`)
      .join('\n\n');
    setFinalContent(combinedContent);
  }, []);

  const handleExport = (format: string) => {
    console.log(`Exporting as ${format}`);
  };

  const downloadMarkdown = async () => {
    try {
      setIsDownloading(true);
      const blob = new Blob([finalContent], { type: 'text/markdown' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const date = new Date().toISOString().split('T')[0];
      link.download = `content-${date}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Failed to download markdown:', error);
      // You might want to add a notification here
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xs">
        Final Preview
      </Title>
      <Text c="dimmed" size="sm" mb="xl">
        Your content is ready! Choose your preferred format and share your creativity with the
        world.
      </Text>

      <div style={{ display: 'flex', gap: '1rem' }}>
        {/* Main Content - Left Side */}
        <div style={{ flex: '1 1 75%' }}>
          <div
            style={{
              border: '1px solid var(--mantine-color-gray-3)',
              borderRadius: 'var(--mantine-radius-md)',
              // height: 'calc(100vh - 250px)',
              overflow: 'auto',
              height: '100%',
            }}
          >
            <MarkdownEditorComponent
              content={finalContent}
              onUpdate={() => {}} // No-op since it's read-only
              disabled={true} // Always disabled for preview only
            />
          </div>
        </div>

        {/* Export Options - Right Side */}
        <Stack style={{ flex: '0 0 25%' }} gap="md">
          <Group grow>
            <Button 
              size="md"
              leftSection={<IconFileText size="1rem" />}
              onClick={() => handleExport('pdf')}
            >
              Export PDF
            </Button>
            <Button
              size="md"
              variant="light"
              leftSection={<IconDownload size="1rem" />}
              onClick={downloadMarkdown}
              loading={isDownloading}
            >
              Export MD
            </Button>
          </Group>

          <Tooltip label="Coming Soon!">
            <Button
              variant="light"
              disabled
              size="md"
              fullWidth
              onClick={() => handleExport('newsletter')}
            >
              Send Newsletter <IconLock size="1rem" />
            </Button>
          </Tooltip>

          <ExportCard
            title="No Limits to Creativity"
            content="Use generative AI to create impressive videos based on your content"
            imageSrc="https://siteefy.com/wp-content/uploads/2023/09/Synthesia.png"
            onBtnClick={() => {}}
            buttonText="Generate Video"
            isLocked={true}
            isPremium={true}
          />

          <ExportCard
            title="Social Together"
            content="Share your thoughts with your friends and followers"
            onBtnClick={() => {}}
            imageSrc="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPdb_m0eYeQQNGk796cpoGFfcHbCiVm4vRUg&s"
            buttonText="Share on Social Media"
            isLocked={true}
            isPremium={false}
          />
          <ExportCard
            title="Create Podcast"
            content="Use popular voice models/ services like Elevenlabs to create a podcast"
            onBtnClick={() => {}}
            imageSrc="https://nomusica.com/wp-content/uploads/2024/11/ElevenLabs.jpg"
            buttonText="Create Podcast"
            isLocked={true}
            isPremium={true}
          />

          <Tooltip label="Coming Soon!">
            <Button variant="light" disabled onClick={() => handleExport('image')}>
              Create Shorts <IconLock size="1rem" />
            </Button>
          </Tooltip>

          <Tooltip label="Coming Soon!">
            <Button variant="light" disabled onClick={() => handleExport('video')}>
              Create Reels <IconLock size="1rem" />
            </Button>
          </Tooltip>

          <ExportCard
            title="Create Blog"
            content="Directly create a Medium post draft"
            onBtnClick={() => {}}
            imageSrc="https://miro.medium.com/v2/resize:fit:1400/0*sG6BT7e579CET2QA"
            buttonText="Create Blog"
            isLocked={true}
            isPremium={false}
          />

          <ExportCard
            title="No Limits to Creativity"
            content="Use generative AI to create an image from your content"
            onBtnClick={() => {}}
            buttonText="Generate Image"
            isLocked={true}
            isPremium={true}
          />
        </Stack>
      </div>
    </Container>
  );
}
