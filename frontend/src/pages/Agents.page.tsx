import { useEffect, useState } from 'react';
import { IconCloud, IconEdit, IconLock, IconUsers } from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ActionIcon,
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
  Rating,
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
import { AgentFormModal } from '@/components/AgentForm/AgentFormModal';
import { OnboardingNavigation } from '../components/OnboardingNavigation/OnboardingNavigation';
import { Agent } from '../services/agents/Agent';
import { AgentManager } from '../services/agents/AgentManager';
import { AgentConfig, AgentRole, ToneOfVoice, WritingStyle } from '../services/agents/types';
import { ConfigManager } from '../services/config/ConfigManager';
import { LLMFactory } from '../services/llm/LLMFactory';
import { PROVIDER_MODELS } from '../services/llm/types';

// Static Data moved outside the component
const dummyCommunityAgents: AgentConfig[] = [
  {
    id: 'community-1',
    name: 'Tech Stack Architect',
    role: 'content_writer',
    expertise: ['System Design', 'Cloud Architecture', 'Scalability'],
    systemPrompt:
      'Expert in modern tech stack analysis and architectural decision-making for scalable systems.',
    writingStyle: 'professional',
    tone: 'neutral',
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'community-2',
    name: 'AI/ML Specialist',
    role: 'content_writer',
    expertise: ['Machine Learning', 'Neural Networks', 'MLOps'],
    systemPrompt:
      'Specialized in explaining complex AI/ML concepts and their practical business applications.',
    writingStyle: 'professional',
    tone: 'neutral',
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'community-3',
    name: 'Blockchain Strategist',
    role: 'content_writer',
    expertise: ['Web3', 'Smart Contracts', 'DeFi'],
    systemPrompt:
      'Expert in blockchain technology, cryptocurrency ecosystems, and decentralized applications.',
    writingStyle: 'professional',
    tone: 'neutral',
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'community-4',
    name: 'DevOps Engineer',
    role: 'content_writer',
    expertise: ['CI/CD', 'Infrastructure', 'Kubernetes'],
    systemPrompt:
      'Specialized in modern DevOps practices, cloud infrastructure, and deployment strategies.',
    writingStyle: 'professional',
    tone: 'neutral',
    createdAt: 0,
    updatedAt: 0,
  },
];

const dummyCloudAgents: AgentConfig[] = [
  {
    id: 'cloud-1',
    name: 'VC Pitch Consultant',
    role: 'content_writer',
    expertise: ['Pitch Decks', 'Market Analysis', 'Growth Strategy'],
    systemPrompt:
      'Expert in crafting compelling startup narratives and venture capital pitch materials.',
    writingStyle: 'professional',
    tone: 'neutral',
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'cloud-2',
    name: 'Product Strategy Lead',
    role: 'content_writer',
    expertise: ['Product Management', 'Go-to-Market', 'User Experience'],
    systemPrompt: 'Specialized in product strategy, market positioning, and growth frameworks.',
    writingStyle: 'professional',
    tone: 'neutral',
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'cloud-3',
    name: 'Deep Tech Analyst',
    role: 'content_writer',
    expertise: ['Quantum Computing', 'Robotics', 'Edge AI'],
    systemPrompt: 'Expert in analyzing emerging technologies and their market implications.',
    writingStyle: 'professional',
    tone: 'neutral',
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'cloud-4',
    name: 'Technical Due Diligence',
    role: 'content_reviewer',
    expertise: ['Code Quality', 'Architecture Review', 'Tech Stack Analysis'],
    systemPrompt:
      'Specialized in technical assessment and due diligence for technology investments.',
    writingStyle: 'professional',
    tone: 'neutral',
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'cloud-5',
    name: 'Sustainability Tech Expert',
    role: 'content_writer',
    expertise: ['CleanTech', 'Carbon Footprint', 'Green AI'],
    systemPrompt: 'Expert in sustainable technology solutions and environmental impact assessment.',
    writingStyle: 'professional',
    tone: 'neutral',
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'cloud-6',
    name: 'Market Intelligence Agent',
    role: 'content_writer',
    expertise: ['Competitive Analysis', 'Market Trends', 'Industry Research'],
    systemPrompt:
      'Specialized in market research and competitive intelligence for technology sectors.',
    writingStyle: 'professional',
    tone: 'neutral',
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'cloud-7',
    name: 'Compliance Guardian',
    role: 'content_reviewer',
    expertise: ['GDPR', 'SOC2', 'ISO27001'],
    systemPrompt:
      'Expert in technology compliance, security standards, and regulatory requirements.',
    writingStyle: 'professional',
    tone: 'neutral',
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'cloud-8',
    name: 'Innovation Scout',
    role: 'content_writer',
    expertise: ['Emerging Tech', 'Patent Analysis', 'R&D Trends'],
    systemPrompt:
      'Specialized in identifying and analyzing breakthrough technologies and innovation patterns.',
    writingStyle: 'professional',
    tone: 'neutral',
    createdAt: 0,
    updatedAt: 0,
  },
];

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

const reviewStyles = [
  { value: 'professional', label: 'Thorough & Detailed' },
  { value: 'conversational', label: 'Constructive & Supportive' },
  { value: 'technical', label: 'Technical & Precise' },
  { value: 'storytelling', label: 'Context-Focused' },
  { value: 'educational', label: 'Educational & Guiding' },
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

const llmOptions = Object.entries(PROVIDER_MODELS).map(([provider, models]) => ({
  group: provider,
  items: models.map((model) => ({
    value: `${provider}:${model}`,
    label: model,
  })),
}));

const skillOptions = [
  {
    value: 'web_search',
    label: 'Web Search',
    description: 'Can search and analyze real-time web content',
  },
  {
    value: 'web_scraping',
    label: 'Web Scraping',
    description: 'Can extract structured data from websites',
  },
  {
    value: 'video_analysis',
    label: 'Video Learning',
    description: 'Can analyze and learn from video content',
  },
  {
    value: 'image_analysis',
    label: 'Image Analysis',
    description: 'Can understand and analyze images',
  },
  {
    value: 'data_analysis',
    label: 'Data Analysis',
    description: 'Can process and analyze structured data',
  },
  {
    value: 'pdf_processing',
    label: 'PDF Processing',
    description: 'Can extract and analyze PDF documents',
  },
  {
    value: 'research_synthesis',
    label: 'Research Synthesis',
    description: 'Can combine information from multiple sources',
  },
  {
    value: 'math_computation',
    label: 'Mathematical Analysis',
    description: 'Can perform complex mathematical calculations',
  },
  {
    value: 'sentiment_analysis',
    label: 'Sentiment Analysis',
    description: 'Can analyze emotional tone in content',
  },
  {
    value: 'translation',
    label: 'Translation',
    description: 'Can translate between multiple languages',
  },
];

const initialFormState: Partial<AgentConfig> = {
  expertise: [],
  writingStyle: 'professional',
  tone: 'neutral',
  llm: (() => {
    const configManager = new ConfigManager('llm_');
    try {
      const providers = LLMFactory.getAvailableProviders().map((name) =>
        LLMFactory.getProvider(name)
      );
      const configuredProvider = providers.find((provider) => provider.isConfigured());
      if (configuredProvider) {
        const config = configuredProvider.getConfig();
        return `${configuredProvider.constructor.name.replace('Provider', '')}:${config.model}`;
      }
    } catch (error) {
      console.error('Failed to load LLM configuration:', error);
    }
    return undefined;
  })(),
};

export function Agents() {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirectUrl = searchParams.get('redirect') || '';

  useEffect(() => {
    const agentManager = new AgentManager();

    setAgents(agentManager.getAllAgents());
  }, []);

  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    open();
  };

  const handleAdd = () => {
    setSelectedAgent(null);
    open();
  };

  const handleSave = (agent: Agent) => {
    const agentManager = new AgentManager();
    if (agentManager.hasRequiredAgents()) {
      return navigate(redirectUrl);
    }
    setAgents(agentManager.getAllAgents());
  };

  const validateAgents = (): boolean => {
    const agentManager = new AgentManager();
    return agentManager.hasRequiredAgents();
  };

  const renderAgentCard = (
    config: AgentConfig,
    isDisabled = false,
    onEdit?: (agent: Agent) => void
  ) => (
    <Card
      key={config.id}
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{
        opacity: isDisabled ? 0.7 : 1,
        maxWidth: '100%',
      }}
    >
      <Group gap="sm" wrap="nowrap">
        <Avatar
          size="lg"
          src={config.avatar}
          color={config.role === 'content_writer' ? 'blue' : 'green'}
        >
          {config.name.charAt(0).toLocaleUpperCase()}
        </Avatar>

        <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
          <Group wrap="nowrap" justify="space-between">
            <Text fw={500} size="sm" lineClamp={1}>
              {config.name}
            </Text>
            {onEdit ? (
              <ActionIcon variant="light" onClick={() => onEdit(new Agent(config))}>
                <IconEdit size="1rem" />
              </ActionIcon>
            ) : (
              isDisabled && (
                <Tooltip label="Coming Soon!">
                  <ActionIcon variant="light" disabled>
                    <IconLock size="1rem" />
                  </ActionIcon>
                </Tooltip>
              )
            )}
          </Group>

          <Group gap="xs">
            <Badge size="xs" variant="light">
              {config.role === 'content_writer' ? 'Writer' : 'Reviewer'}
            </Badge>
            {config.expertise?.slice(0, 2).map((skill) => (
              <Badge key={skill} size="xs" variant="outline">
                {skill}
              </Badge>
            ))}
            {(config.expertise?.length ?? 0) > 2 && (
              <Tooltip label={config.expertise?.slice(2).join(', ')}>
                <Badge size="xs" variant="outline">
                  +{(config.expertise?.length ?? 0) - 2}
                </Badge>
              </Tooltip>
            )}
          </Group>

          <Text size="xs" c="dimmed" lineClamp={2}>
            {config.systemPrompt?.substring(0, 100) + '...'}
          </Text>

          {isDisabled ? (
            <Tooltip label="Community reviews coming soon!" position="right">
              <Rating value={4.5} fractions={2} readOnly size="xs" />
            </Tooltip>
          ) : (
            <Rating value={4.5} fractions={2} readOnly size="xs" />
          )}
        </Stack>
      </Group>
    </Card>
  );

  const getMissingRole = (): AgentRole | null => {
    const hasWriter = agents.some((agent) => agent.getConfig().role === 'content_writer');
    const hasReviewer = agents.some((agent) => agent.getConfig().role === 'content_reviewer');
    if (!hasWriter) return 'content_writer';
    if (!hasReviewer) return 'content_reviewer';
    return null;
  };

  const getStyleOptions = (role: AgentRole) =>
    role === 'content_reviewer' ? reviewStyles : writingStyles;
  const agentManager = new AgentManager();

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Workspace Section */}
        <div>
          <Group justify="space-between" mb="md">
            <div>
              <Title order={1}>Your AI Workforce</Title>
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
              <Stack align="center" gap="md">
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
            {dummyCommunityAgents.map((agent) => renderAgentCard(agent, true))}
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
            {dummyCloudAgents.map((agent) => renderAgentCard(agent, true))}
          </SimpleGrid>
        </div>
      </Stack>

      <AgentFormModal
        key={selectedAgent?.config?.id}
        opened={opened}
        onClose={close}
        initialAgent={selectedAgent}
        onSave={handleSave}
        defaultRole={agentManager.getMissingRole() || undefined}
      />
    </Container>
  );
}
