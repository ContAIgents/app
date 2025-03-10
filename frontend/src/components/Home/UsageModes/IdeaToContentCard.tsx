import { IconBrain } from '@tabler/icons-react';
import { Paper, Text, ThemeIcon, Title, Stack } from '@mantine/core';

export function IdeaToContentCard() {
  return (
    <Paper withBorder p="xl" radius="md">
      <ThemeIcon size={40} radius="md" variant="light" color="blue" mb="md">
        <IconBrain size={24} />
      </ThemeIcon>
      <Title order={3} size="h3" mb="sm">
        Idea to Content
      </Title>
      <Text size="sm" c="dimmed" mb="md">
        Transform your ideas into polished content with AI assistance. Perfect for creating new
        content from scratch.
      </Text>
      <Stack gap="xs">
        <Text size="sm" fw={500}>Choose your preferred mode:</Text>
        <Stack gap={8}>
          <Text size="sm">Browser-only mode:</Text>
          <Text size="sm" c="dimmed">• Click on "Start Creating Now"</Text>
        </Stack>
        <Stack gap={8}>
          <Text size="sm">Or start locally with CLI:</Text>
          <Paper
            p="xs"
            bg="dark.7"
            c="gray.4"
            style={{ fontFamily: 'monospace' }}
            withBorder
            radius="sm"
          >
            $ npx contaigents
          </Paper>
        </Stack>
      </Stack>
      <Stack gap="xs" mt="md">
        <Text size="sm" fw={500}>Features:</Text>
        <Text size="sm" c="dimmed">• Define your vision and target audience</Text>
        <Text size="sm" c="dimmed">• AI-powered content structure suggestions</Text>
        <Text size="sm" c="dimmed">• Supports fully in browser mode, no data will be send to our servers (Some LLMs are not supported)</Text>
        <Text size="sm" c="dimmed">• Customizable AI writers and reviewers for different writing styles</Text>
        <Text size="sm" c="dimmed">• Automated content generation and review</Text>
        <Text size="sm" c="dimmed">• Export to multiple formats for various platforms</Text>
      </Stack>
    </Paper>
  );
}