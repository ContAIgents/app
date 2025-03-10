import { useCallback, useEffect, useState } from 'react';
import { IconPlus, IconUserPlus, IconUsers } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AgentFormModal } from '@/components/AgentForm/AgentFormModal';
import type { Agent } from '@/services/agents/Agent';
import { AgentManager } from '@/services/agents/AgentManager';
import { AgentRole } from '@/services/agents/types';

interface TeamUpStepProps {
  onNext?: (data: {selectedWriter?: Agent, selectedReviewer?: Agent}) => void;
}

export function TeamUpStep({ onNext }: TeamUpStepProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [creatingRole, setCreatingRole] = useState<AgentRole | null>(null);
  const [writers, setWriters] = useState<Agent[]>([]);
  const [reviewers, setReviewers] = useState<Agent[]>([]);
  const [selectedWriter, setSelectedWriter] = useState<Agent | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<Agent | null>(null);

  const loadAgents = useCallback(() => {
    const agentManager = new AgentManager();
    const allAgents = agentManager.getAllAgents();

    setWriters(allAgents.filter((agent) => agent.getConfig().role === 'content_writer'));
    setReviewers(allAgents.filter((agent) => agent.getConfig().role === 'content_reviewer'));
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const handleCreateAgent = (role: AgentRole) => {
    setCreatingRole(role);
    open();
  };

  const handleSaveAgent = (agent: Agent) => {
    loadAgents(); // Refresh the lists after creating a new agent

    // Auto-select the newly created agent
    if (agent.getConfig().role === 'content_writer') {
      setSelectedWriter(agent);
    } else {
      setSelectedReviewer(agent);
    }

    close();
  };

  // Call onNext when both agents are selected
  const handleAgentSelection = (isWriter: boolean, agent: Agent) => {
    if (isWriter) {
      setSelectedWriter(agent);
      // If reviewer is already selected, proceed to next step
      // if (selectedReviewer && onNext) {
      //   onNext({ selectedWriter, selectedReviewer });
      // }
    } else {
      setSelectedReviewer(agent);
      // If writer is already selected, proceed to next step
      // if (selectedWriter && onNext) {
      //   onNext({ selectedWriter, selectedReviewer });
      // }
    }
  };

  return (
    <Stack gap="xl" style={{ height: 'calc(100vh - 200px)', overflow: 'hidden' }}>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Title order={1} size="2rem" mb="md">
          Team Up with AI
        </Title>
        <Text c="dimmed" size="xl" maw={600}>
          Choose your AI collaborators to bring your content to life
        </Text>
      </Box>

      <Group align="flex-start" gap="xl" justify="center" style={{ flex: 1 }}>
        {/* Writer Section */}
        <Box style={{ width: '400px', height: '100%' }}>
          <Box
            p="lg"
            style={{
              border: '2px dotted var(--mantine-color-gray-4)',
              borderRadius: 'var(--mantine-radius-md)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              style={{
                textAlign: 'center',
                padding: '2rem 0',
                borderBottom: '1px solid var(--mantine-color-gray-2)',
              }}
            >
              <Title order={3} size="h3">
                Your Content Writer
              </Title>
              <Text size="sm" c="dimmed" mt="xs">
                Will create your content with expertise
              </Text>
            </Box>

            <Box style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
              {writers.length > 0 ? (
                <Stack gap="md" mt="xl">
                  {writers.map((writer) => {
                    const config = writer.getConfig();
                    const isSelected = selectedWriter?.getConfig().id === config.id;
                    return (
                      <Card
                        key={config.id}
                        padding="md"
                        radius="md"
                        onClick={() => handleAgentSelection(true, writer)}
                        style={{
                          cursor: 'pointer',
                          border: isSelected
                            ? '2px solid var(--mantine-color-blue-5)'
                            : '1px solid var(--mantine-color-gray-3)',
                          backgroundColor: 'transparent',
                        }}
                      >
                        <Group>
                          <Avatar
                            size="md"
                            src={config.avatar}
                            color={isSelected ? 'blue' : 'gray'}
                          >
                            {config.name.charAt(0)}
                          </Avatar>
                          <div>
                            <Text fw={500} size="lg">
                              {config.name}
                            </Text>
                            <Group gap={5} mt={3}>
                              {config.expertise?.slice(0, 2).map((skill) => (
                                <Badge
                                  key={skill}
                                  size="sm"
                                  variant="dot"
                                  color={isSelected ? 'blue' : 'gray'}
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </Group>
                          </div>
                        </Group>
                      </Card>
                    );
                  })}
                </Stack>
              ) : (
                <Stack justify="center" align="center" style={{ flex: 1 }}>
                  <IconUsers size="3rem" style={{ color: 'var(--mantine-color-gray-3)' }} />
                  <Text c="dimmed" ta="center">
                    No content writers available
                  </Text>
                </Stack>
              )}
            </Box>

            <Button
              variant="light"
              size="md"
              onClick={() => handleCreateAgent('content_writer')}
              leftSection={<IconUserPlus size="1rem" />}
              fullWidth
              mt="md"
            >
              Create Writer
            </Button>
          </Box>
        </Box>

        {/* Separator */}
        <Divider orientation="vertical" h="100%" />

        {/* Reviewer Section */}
        <Box style={{ width: '400px', height: '100%' }}>
          <Box
            p="lg"
            style={{
              border: '2px dotted var(--mantine-color-gray-4)',
              borderRadius: 'var(--mantine-radius-md)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              style={{
                textAlign: 'center',
                padding: '2rem 0',
                borderBottom: '1px solid var(--mantine-color-gray-2)',
              }}
            >
              <Title order={3} size="h3">
                Your Content Reviewer
              </Title>
              <Text size="sm" c="dimmed" mt="xs">
                Will review and improve your content
              </Text>
            </Box>

            <Box style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
              {reviewers.length > 0 ? (
                <Stack gap="md" mt="xl">
                  {reviewers.map((reviewer) => {
                    const config = reviewer.getConfig();
                    const isSelected = selectedReviewer?.getConfig().id === config.id;
                    return (
                      <Card
                        key={config.id}
                        padding="md"
                        radius="md"
                        onClick={() => handleAgentSelection(false, reviewer)}
                        style={{
                          cursor: 'pointer',
                          border: isSelected
                            ? '2px solid var(--mantine-color-blue-5)'
                            : '1px solid var(--mantine-color-gray-3)',
                          backgroundColor: 'transparent',
                        }}
                      >
                        <Group>
                          <Avatar
                            size="md"
                            src={config.avatar}
                            color={isSelected ? 'blue' : 'gray'}
                          >
                            {config.name.charAt(0)}
                          </Avatar>
                          <div>
                            <Text fw={500} size="lg">
                              {config.name}
                            </Text>
                            <Group gap={5} mt={3}>
                              {config.expertise?.slice(0, 2).map((skill) => (
                                <Badge
                                  key={skill}
                                  size="sm"
                                  variant="dot"
                                  color={isSelected ? 'blue' : 'gray'}
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </Group>
                          </div>
                        </Group>
                      </Card>
                    );
                  })}
                </Stack>
              ) : (
                <Stack justify="center" align="center" style={{ flex: 1 }}>
                  <IconUsers size="3rem" style={{ color: 'var(--mantine-color-gray-3)' }} />
                  <Text c="dimmed" ta="center">
                    No content reviewers available
                  </Text>
                </Stack>
              )}
            </Box>

            <Button
              variant="light"
              size="md"
              onClick={() => handleCreateAgent('content_reviewer')}
              leftSection={<IconUserPlus size="1rem" />}
              fullWidth
              mt="md"
            >
              Create Reviewer
            </Button>
          </Box>
        </Box>
      </Group>

      {/* Add navigation at the bottom */}
      {selectedWriter && selectedReviewer && (
        <Group justify="center">
          <Button
            onClick={() => {
              console.log('selectedWriter', selectedWriter);
              console.log('selectedReviewer', selectedReviewer);
              if (onNext) onNext({selectedReviewer, selectedWriter});
              return true;
            }}
            size="md"
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
          >
            Continue
          </Button>
        </Group>
      )}
      {opened && (
        <AgentFormModal
          opened
          onClose={close}
          initialAgent={null}
          onSave={handleSaveAgent}
          defaultRole={creatingRole}
          key={creatingRole} // Ensure the modal is re-rendered when role changes
        />
      )}
    </Stack>
  );
}
