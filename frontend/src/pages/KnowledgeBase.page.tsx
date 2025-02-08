import { Container, Title, Paper, Stack, Text, Button, Group, Tooltip } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { KnowledgeBaseManager } from '../services/knowledgeBase/KnowledgeBaseManager';
import { useEffect, useState } from 'react';

export function KnowledgeBase() {
  const navigate = useNavigate();
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const knowledgeBaseManager = new KnowledgeBaseManager();

  useEffect(() => {
    const doc = knowledgeBaseManager.getDefaultDocument();
    setLastUpdated(doc.updatedAt);
  }, []);

  const handleEdit = () => {
    navigate('/knowledgeBase/edit/default');
  };

  const formatLastUpdated = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">Knowledge Base</Title>
      
      <Stack gap="md">
        <Paper shadow="sm" p="md" withBorder>
          <Group justify="space-between" align="center">
            <div>
              <Text size="lg" fw={500}>Default Knowledge Base</Text>
              <Text size="sm" c="dimmed">Last updated: {formatLastUpdated(lastUpdated)}</Text>
            </div>
            <Button variant="light" onClick={handleEdit}>Edit</Button>
          </Group>
        </Paper>
      </Stack>

      <Group mt="xl" grow>
        <Tooltip label="Coming Soon: Upload and analyze your own documents!" position="top">
          <Button disabled>Upload Document</Button>
        </Tooltip>
        <Tooltip label="Coming Soon: Capture and learn from human expertise!" position="top">
          <Button disabled>Record Human</Button>
        </Tooltip>
      </Group>
    </Container>
  );
}
