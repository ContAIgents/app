import { Container, Title, Paper, Stack, Text, Button, Group, TextInput } from '@mantine/core';

export function KnowledgeBase() {
  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">Knowledge Base</Title>

      <TextInput
        placeholder="Search knowledge base..."
        mb="lg"
      />
      
      <Stack gap="md">
        <Paper shadow="sm" p="md" withBorder>
          <Group justify="space-between" align="center">
            <div>
              <Text size="lg" fw={500}>Project Documentation</Text>
              <Text size="sm" c="dimmed">Last updated: 2 hours ago</Text>
            </div>
            <Group>
              <Button variant="light">Edit</Button>
              <Button variant="subtle" color="red">Delete</Button>
            </Group>
          </Group>
        </Paper>

        <Paper shadow="sm" p="md" withBorder>
          <Group justify="space-between" align="center">
            <div>
              <Text size="lg" fw={500}>API Guidelines</Text>
              <Text size="sm" c="dimmed">Last updated: 1 day ago</Text>
            </div>
            <Group>
              <Button variant="light">Edit</Button>
              <Button variant="subtle" color="red">Delete</Button>
            </Group>
          </Group>
        </Paper>

        <Paper shadow="sm" p="md" withBorder>
          <Group justify="space-between" align="center">
            <div>
              <Text size="lg" fw={500}>Best Practices</Text>
              <Text size="sm" c="dimmed">Last updated: 3 days ago</Text>
            </div>
            <Group>
              <Button variant="light">Edit</Button>
              <Button variant="subtle" color="red">Delete</Button>
            </Group>
          </Group>
        </Paper>
      </Stack>

      <Button fullWidth mt="xl">Add New Document</Button>
    </Container>
  );
}