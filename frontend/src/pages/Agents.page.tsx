import { Container, Title, Paper, Stack, Text, Button, Group } from '@mantine/core';

export function Agents() {
  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">AI Agents</Title>
      
      <Stack gap="md">
        <Paper shadow="sm" p="md" withBorder>
          <Group justify="space-between" align="center">
            <div>
              <Text size="lg" fw={500}>Content Generator</Text>
              <Text size="sm" c="dimmed">Generates blog posts and articles using AI</Text>
            </div>
            <Button variant="light">Configure</Button>
          </Group>
        </Paper>

        <Paper shadow="sm" p="md" withBorder>
          <Group justify="space-between" align="center">
            <div>
              <Text size="lg" fw={500}>Research Assistant</Text>
              <Text size="sm" c="dimmed">Helps with research and data analysis</Text>
            </div>
            <Button variant="light">Configure</Button>
          </Group>
        </Paper>

        <Paper shadow="sm" p="md" withBorder>
          <Group justify="space-between" align="center">
            <div>
              <Text size="lg" fw={500}>Code Assistant</Text>
              <Text size="sm" c="dimmed">Assists with code generation and review</Text>
            </div>
            <Button variant="light">Configure</Button>
          </Group>
        </Paper>
      </Stack>

      <Button fullWidth mt="xl">Add New Agent</Button>
    </Container>
  );
}