import { useEffect, useState } from 'react';
import { IconCloud, IconLock, IconUsers } from '@tabler/icons-react';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Modal,
  MultiSelect,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { OnboardingNavigation } from '../components/OnboardingNavigation/OnboardingNavigation';
import { Agent } from '../services/agents/Agent';
import { AgentManager } from '../services/agents/AgentManager';
import { AgentConfig } from '../services/agents/types';

export function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [formData, setFormData] = useState<Partial<AgentConfig>>({
    expertise: [],
    writingStyle: 'professional',
    tone: 'neutral',
  });

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
    const missingRole = getMissingRole();
    setSelectedAgent(null);
    setFormData({
      ...formData,
      role: missingRole || 'content_writer' // Default to writer if both roles exist
    });
    open();
  };

  const validateAgents = () => {
    const hasRequired = agentManager.hasRequiredAgents();
    if (!hasRequired) {
      // You might want to add some error state here
      return false;
    }
    return true;
  };

  const renderAgentCard = (
    config: AgentConfig,
    isDisabled = false,
    onEdit?: (agent: Agent) => void
  ) => (
    <Card
      key={config.id}
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      opacity={isDisabled ? 0.7 : 1}
    >
      <Group>
        <Avatar
          size="xl"
          src={config.avatar}
          color={config.role === 'content_writer' ? 'blue' : 'green'}
        >
          {config.name.charAt(0)}
        </Avatar>
        <div style={{ flex: 1 }}>
          <Group align="center" gap="xs">
            <Text fw={500} size="lg">
              {config.name}
            </Text>
            {config.expertise?.map((skill) => (
              <Badge key={skill} size="sm" variant="light">
                {skill}
              </Badge>
            ))}
          </Group>
          <Text c="dimmed" size="sm">
            {config.role === 'content_writer' ? 'Content Writer' : 'Content Reviewer'}
          </Text>
          <Text size="sm" mt="xs" lineClamp={2}>
            {config.systemPrompt}
          </Text>
        </div>
        {onEdit && (
          <Button variant="light" onClick={() => onEdit(new Agent(config))}>
            Edit
          </Button>
        )}
        {isDisabled && (
          <Tooltip label="Coming Soon!">
            <Button variant="light" disabled>
              <IconLock size="1rem" />
            </Button>
          </Tooltip>
        )}
      </Group>
    </Card>
  );

  const dummyCommunityAgents = [
    {
      id: 'community-1',
      name: 'Tech Stack Architect',
      role: 'content_writer',
      expertise: ['System Design', 'Cloud Architecture', 'Scalability'],
      systemPrompt:
        'Expert in modern tech stack analysis and architectural decision-making for scalable systems.',
    },
    {
      id: 'community-2',
      name: 'AI/ML Specialist',
      role: 'content_writer',
      expertise: ['Machine Learning', 'Neural Networks', 'MLOps'],
      systemPrompt:
        'Specialized in explaining complex AI/ML concepts and their practical business applications.',
    },
    {
      id: 'community-3',
      name: 'Blockchain Strategist',
      role: 'content_writer',
      expertise: ['Web3', 'Smart Contracts', 'DeFi'],
      systemPrompt:
        'Expert in blockchain technology, cryptocurrency ecosystems, and decentralized applications.',
    },
    {
      id: 'community-4',
      name: 'DevOps Engineer',
      role: 'content_writer',
      expertise: ['CI/CD', 'Infrastructure', 'Kubernetes'],
      systemPrompt:
        'Specialized in modern DevOps practices, cloud infrastructure, and deployment strategies.',
    },
  ];

  const dummyCloudAgents = [
    {
      id: 'cloud-1',
      name: 'VC Pitch Consultant',
      role: 'content_writer',
      expertise: ['Pitch Decks', 'Market Analysis', 'Growth Strategy'],
      systemPrompt:
        'Expert in crafting compelling startup narratives and venture capital pitch materials.',
    },
    {
      id: 'cloud-2',
      name: 'Product Strategy Lead',
      role: 'content_writer',
      expertise: ['Product Management', 'Go-to-Market', 'User Experience'],
      systemPrompt: 'Specialized in product strategy, market positioning, and growth frameworks.',
    },
    {
      id: 'cloud-3',
      name: 'Deep Tech Analyst',
      role: 'content_writer',
      expertise: ['Quantum Computing', 'Robotics', 'Edge AI'],
      systemPrompt: 'Expert in analyzing emerging technologies and their market implications.',
    },
    {
      id: 'cloud-4',
      name: 'Technical Due Diligence',
      role: 'content_reviewer',
      expertise: ['Code Quality', 'Architecture Review', 'Tech Stack Analysis'],
      systemPrompt:
        'Specialized in technical assessment and due diligence for technology investments.',
    },
    {
      id: 'cloud-5',
      name: 'Sustainability Tech Expert',
      role: 'content_writer',
      expertise: ['CleanTech', 'Carbon Footprint', 'Green AI'],
      systemPrompt:
        'Expert in sustainable technology solutions and environmental impact assessment.',
    },
    {
      id: 'cloud-6',
      name: 'Market Intelligence Agent',
      role: 'content_writer',
      expertise: ['Competitive Analysis', 'Market Trends', 'Industry Research'],
      systemPrompt:
        'Specialized in market research and competitive intelligence for technology sectors.',
    },
    {
      id: 'cloud-7',
      name: 'Compliance Guardian',
      role: 'content_reviewer',
      expertise: ['GDPR', 'SOC2', 'ISO27001'],
      systemPrompt:
        'Expert in technology compliance, security standards, and regulatory requirements.',
    },
    {
      id: 'cloud-8',
      name: 'Innovation Scout',
      role: 'content_writer',
      expertise: ['Emerging Tech', 'Patent Analysis', 'R&D Trends'],
      systemPrompt:
        'Specialized in identifying and analyzing breakthrough technologies and innovation patterns.',
    },
  ];

  // Sample options for various fields
  const expertiseSuggestions = [
    'Technical Writing',
    'Blockchain',
    'AI/ML',
    'Cloud Computing',
    'DevOps',
    'Web Development',
    'Mobile Development',
    'System Design',
    'Product Management',
    'Digital Marketing',
    'Content Strategy',
  ];

  const writingStyles = [
    { value: 'professional', label: 'Professional & Formal' },
    { value: 'conversational', label: 'Conversational & Friendly' },
    { value: 'technical', label: 'Technical & Detailed' },
    { value: 'storytelling', label: 'Narrative & Story-driven' },
    { value: 'educational', label: 'Educational & Explanatory' },
  ];

  const toneOptions = [
    { value: 'neutral', label: 'Neutral & Balanced' },
    { value: 'enthusiastic', label: 'Enthusiastic & Energetic' },
    { value: 'humorous', label: 'Humorous & Light' },
    { value: 'authoritative', label: 'Authoritative & Confident' },
    { value: 'empathetic', label: 'Empathetic & Understanding' },
  ];

  const getMissingRole = (): AgentRole | null => {
    const hasWriter = agents.some(agent => agent.getConfig().role === 'content_writer');
    const hasReviewer = agents.some(agent => agent.getConfig().role === 'content_reviewer');
    
    if (!hasWriter) return 'content_writer';
    if (!hasReviewer) return 'content_reviewer';
    return null;
  };

  const getStyleOptions = (role: AgentRole) => {
    if (role === 'content_reviewer') {
      return [
        { value: 'professional', label: 'Thorough & Detailed' },
        { value: 'conversational', label: 'Constructive & Supportive' },
        { value: 'technical', label: 'Technical & Precise' },
        { value: 'storytelling', label: 'Context-Focused' },
        { value: 'educational', label: 'Educational & Guiding' },
      ];
    }
    return writingStyles;
  };

  return (
    <Container size="lg" py="xl">
      <Stack spacing="xl">
        {/* Your Workspace Section */}
        <div>
          <Group justify="space-between" mb="md">
            <div>
              <Title order={1}>Your AI Workspace</Title>
              <Text c="dimmed" size="sm">
                Configure your personal AI agents for your specific needs
              </Text>
            </div>
            <Button onClick={handleAdd}>Add New Agent</Button>
          </Group>
          {validateAgents() ? (
            <Alert color="teal" radius="md" mb="lg">
              <Group justify="space-between" align="center">
                <Text size="sm" fw={500}>
                  ✓ Great job! You're ready to get going.
                </Text>
                <OnboardingNavigation
                  nextPath="/knowledgeBase"
                  onNext={validateAgents}
                  nextLabel="Continue to Knowledge Base"
                />
              </Group>
            </Alert>
          ) : (
            <Text c="red" size="sm" mt="xs">
              * At least one Content Writer and one Content Reviewer are required
            </Text>
          )}

          {agents.length === 0 ? (
            <Paper p="xl" withBorder>
              <Stack align="center" spacing="md">
                <Text size="lg" fw={500}>
                  No Agents Created Yet
                </Text>
                <Text c="dimmed" ta="center">
                  Start by creating your first AI agent. You'll need at least one Content Writer and
                  one Content Reviewer to proceed.
                </Text>
                <Button onClick={handleAdd}>Create Your First Agent</Button>
              </Stack>
            </Paper>
          ) : (
            <SimpleGrid cols={2} spacing="lg">
              {agents.map((agent) => renderAgentCard(agent.getConfig(), false, handleEdit))}
            </SimpleGrid>
          )}
        </div>

        <Divider />

        {/* Community Agents Section */}
        <div>
          <Group mb="md">
            <IconUsers size="1.5rem" />
            <div>
              <Title order={2}>Community Agents</Title>
              <Text c="dimmed" size="sm">
                Pre-configured agents with specialized skills (Coming Soon)
              </Text>
            </div>
          </Group>

          <SimpleGrid cols={2} spacing="lg">
            {dummyCommunityAgents.map((agent) => renderAgentCard(agent as AgentConfig, true))}
          </SimpleGrid>
        </div>

        <Divider />

        {/* Cloud Agents Section */}
        <div>
          <Group mb="md">
            <IconCloud size="1.5rem" />
            <div>
              <Title order={2}>Cloud Agents</Title>
              <Text c="dimmed" size="sm">
                Premium agents with advanced capabilities (Coming Soon)
              </Text>
            </div>
          </Group>

          <SimpleGrid cols={2} spacing="lg">
            {dummyCloudAgents.map((agent) => renderAgentCard(agent as AgentConfig, true))}
          </SimpleGrid>
        </div>
      </Stack>

      <Modal
        opened={opened}
        onClose={close}
        title={selectedAgent ? 'Edit Agent' : 'New Agent'}
        size="lg"
      >
        <Stack spacing="md">
          <TextInput
            label="Name"
            placeholder="e.g., Tech Blogger Sarah"
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
          <MultiSelect
            label="Areas of Expertise"
            placeholder="Select or create new tags"
            data={expertiseSuggestions}
            value={formData.expertise || []}
            onChange={(value) => setFormData({ ...formData, expertise: value })}
            searchable
            creatable
            getCreateLabel={(query) => `+ Create "${query}"`}
          />
          <Select
            label={formData.role === 'content_reviewer' ? "Review Style" : "Writing Style"}
            placeholder={formData.role === 'content_reviewer' ? "Choose the primary review style" : "Choose the primary writing style"}
            data={getStyleOptions(formData.role || 'content_writer')}
            value={formData.writingStyle}
            onChange={(value) => setFormData({ ...formData, writingStyle: value })}
          />
          <Select
            label="Tone of Voice"
            placeholder="Select the tone for communication"
            data={toneOptions}
            value={formData.tone}
            onChange={(value) => setFormData({ ...formData, tone: value })}
          />
          <Textarea
            label="Persona Definition"
            placeholder="Describe the agent's personality, expertise, and approach. For example: 'Sarah is an experienced tech blogger who explains complex concepts through real-world analogies. She maintains a friendly, approachable tone while ensuring technical accuracy.'"
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
