import { IconMarkdown } from '@tabler/icons-react';
import { Paper, Text, ThemeIcon, Title, Stack } from '@mantine/core';

export function MarkdownIDECard() {
  return (
    <Paper withBorder p="xl" radius="md">
      <ThemeIcon size={40} radius="md" variant="light" color="violet" mb="md">
        <IconMarkdown size={24} />
      </ThemeIcon>
      <Title order={3} size="h3" mb="sm">
        Markdown Project IDE
      </Title>
      <Text size="sm" c="dimmed" mb="md">
        Enhance existing markdown projects with a single command. Works like your favorite IDE
        with AI superpowers.
      </Text>
      <Stack gap="xs">
        <Text size="sm">Run from your project directory:</Text>
        <Paper
          p="xs"
          bg="dark.7"
          c="gray.4"
          style={{ fontFamily: 'monospace' }}
          withBorder
          radius="sm"
        >
          $ npx contaigents develop
        </Paper>
      </Stack>
      <Stack gap="xs" mt="md">
        <Text size="sm" fw={500}>Features:</Text>
        <Text size="sm" c="dimmed">• One-command project enhancement</Text>
        <Text size="sm" c="dimmed">• Realtime sync with Local file system</Text>
        <Text size="sm" c="dimmed">• Advanced tree like mindmap view for better contextual awareness on directory structure (coming soon)</Text>
      </Stack>
    </Paper>
  );
}