import { useEffect, useState } from 'react';
import { Container, Title, SimpleGrid, Card, Text, Button, Group, Avatar, Modal, TextInput, Select, Textarea, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Agent } from '../services/agents/Agent';
import { AgentManager } from '../services/agents/AgentManager';
import { AgentConfig } from '../services/agents/types';

export function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [formData, setFormData] = useState<Partial<AgentConfig>>({});
  
  const agentManager = new AgentManager();

  useEffect(() => {
    setAgents(agentManager.getAllAgents());
  }, []);

  const handleSave = () => {
    if (selectedAgent) {
      const updated = agentManager.updateAgent(selectedAgent.getConfig().id, formData);
      if (updated) {
        setAgents(agentManager.getAllAgents());
      }
    } else {
      agentManager.createAgent(formData);
      setAgents(agentManager.getAllAgents());
    }
    close();
    setSelectedAgent(null);
    setFormData({});
  };

  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData(agent.getConfig());
    open();
  };

  const handleAdd = () => {
    setSelectedAgent(null);
    setFormData({});
    open();
  };

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>AI Agents</Title>
        <Button onClick={handleAdd}>Add New Agent</Button>
      </Group>

      <SimpleGrid cols={2} spacing="lg">
        {agents.map((agent) => {
          const config = agent.getConfig();
          return (
            <Card key={config.id} shadow="sm" padding="lg" radius="md" withBorder>
              <Group>
                <Avatar 
                  size="xl" 
                  src={config.avatar} 
                  color={config.role === 'content_writer' ? 'blue' : 'green'}
                >
                  {config.name.charAt(0)}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <Text fw={500} size="lg">{config.name}</Text>
                  <Text c="dimmed" size="sm">
                    {config.role === 'content_writer' ? 'Content Writer' : 'Content Reviewer'}
                  </Text>
                </div>
                <Button variant="light" onClick={() => handleEdit(agent)}>
                  Edit
                </Button>
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>

      <Modal opened={opened} onClose={close} title={selectedAgent ? 'Edit Agent' : 'New Agent'}>
        <Stack spacing="md">
          <TextInput
            label="Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Select
            label="Role"
            data={[
              { value: 'content_writer', label: 'Content Writer' },
              { value: 'content_reviewer', label: 'Content Reviewer' },
            ]}
            value={formData.role || 'content_writer'}
            onChange={(value) => setFormData({ ...formData, role: value as AgentRole })}
          />
          <Textarea
            label="Persona Definition"
            value={formData.systemPrompt || ''}
            onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
            minRows={4}
          />
          <Button onClick={handleSave}>Save</Button>
        </Stack>
      </Modal>
    </Container>
  );
}
