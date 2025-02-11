import { useEffect, useState } from 'react';
import { IconLock } from '@tabler/icons-react';
import { Button, Container, Group, Stack, Text, Textarea, Title, Tooltip } from '@mantine/core';
import ExportCard from '@/components/Export/ExportCard';
import { ConfigManager } from '@/services/config/ConfigManager';
import { ContentBlock } from '@/types/content';

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
            <Button onClick={() => handleExport('pdf')}>Export as PDF </Button>
            <Tooltip label="Coming Soon!">
              <Button variant="light" disabled onClick={() => handleExport('image')}>
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
              content="Directly post to Medium "
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
            <ExportCard
              title="Create Podcast"
              content="Use Elevenlabs to create a podcast"
              onBtnClick={() => {}}
              imageSrc="https://nomusica.com/wp-content/uploads/2024/11/ElevenLabs.jpg"
              buttonText="Create Podcast"
              isLocked={true}
              isPremium={true}
            />
          </Stack>
        </Group>
      </Stack>
    </Container>
  );
}
