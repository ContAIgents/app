import { useEffect, useState } from 'react';
import { IconDownload, IconFileText, IconFolder, IconLock } from '@tabler/icons-react';
import { Button, Container, Group, Menu, Stack, Text, Title, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
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

  const handleExport = async (format: string) => {
    if (format === 'md') {
      await downloadMarkdown();
    } else {
      // Show coming soon tooltip - handled by button tooltip
    }
  };

  const handleSave = async (format: string) => {
    if (format === 'md') {
      try {
        setIsDownloading(true);
        const date = new Date().toISOString().split('T')[0];
        const filename = `content-${date}.md`;

        const response = await fetch('http://localhost:3000/api/files', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: `content/${filename}`,
            content: finalContent,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        notifications.show({
          title: 'Success',
          message: `Content saved as ${filename}`,
          color: 'green',
          autoClose: 3000,
        });
      } catch (error) {
        console.error('Failed to save file:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to save content locally',
          color: 'red',
          autoClose: 5000,
        });
      } finally {
        setIsDownloading(false);
      }
    }
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
              overflow: 'auto',
              height: '100%',
            }}
          >
            <MarkdownEditorComponent
              content={finalContent}
              onUpdate={() => {}}
              disabled={true} // Always disabled for preview only
            />
          </div>
        </div>

        {/* Export Options - Right Side */}
        <Stack style={{ flex: '0 0 25%' }} gap="md">
          <Group grow>
            <Menu shadow="md">
              <Menu.Target>
                <Button
                  size="sm"
                  leftSection={<IconDownload size="1rem" />}
                  loading={isDownloading}
                >
                  Export
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item onClick={() => handleExport('md')}>
                  <Group>
                    <IconFileText size="1rem" />
                    <span>Markdown</span>
                  </Group>
                </Menu.Item>
                <Tooltip label="Coming Soon!">
                  <Menu.Item disabled>
                    <Group>
                      <IconFileText size="1rem" />
                      <span>PDF</span>
                    </Group>
                  </Menu.Item>
                </Tooltip>
              </Menu.Dropdown>
            </Menu>

            <Menu shadow="md">
              <Menu.Target>
                <Button size="sm" variant="light" leftSection={<IconFolder size="1rem" />}>
                  Save Locally
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item onClick={() => handleSave('md')}>
                  <Group>
                    <IconFileText size="1rem" />
                    <span>Markdown</span>
                  </Group>
                </Menu.Item>
                <Tooltip label="Coming Soon!">
                  <Menu.Item disabled>
                    <Group>
                      <IconFileText size="1rem" />
                      <span>PDF</span>
                    </Group>
                  </Menu.Item>
                </Tooltip>
              </Menu.Dropdown>
            </Menu>
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
            title="Generate Video"
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
