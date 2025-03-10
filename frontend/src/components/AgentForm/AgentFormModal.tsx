import {
  Badge,
  Button,
  Group,
  Modal,
  MultiSelect,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import {
  expertiseSuggestions,
  llmOptions,
  reviewStyles,
  skillOptions,
  toneOptions,
  writingStyles,
} from '../../constants/agent-options';
import { useAgentForm } from '../../hooks/useAgentForm';
import { Agent } from '../../services/agents/Agent';
import { AgentConfig, AgentRole, ToneOfVoice, WritingStyle } from '../../services/agents/types';
import { SelectCreatable } from '../common/SelectCreatable';

interface AgentFormModalProps {
  opened: boolean;
  onClose: () => void;
  initialAgent?: Agent | null;
  onSave: (agent: Agent) => void;
  defaultRole?: AgentRole | null;
}

export function AgentFormModal({
  opened,
  onClose,
  initialAgent,
  onSave,
  defaultRole,
}: AgentFormModalProps) {
  const { formData, updateFormField, handleSave } = useAgentForm({
    initialAgent,
    onSave: (agent) => {
      onSave(agent);
      onClose();
    },
    onClose,
    defaultRole,
  });

  const getStyleOptions = (role: AgentRole) =>
    role === 'content_reviewer' ? reviewStyles : writingStyles;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={initialAgent ? 'Edit Agent' : 'New Agent'}
      size="xl"
    >
      <Stack gap="md">
        <TextInput
          label="Name"
          placeholder="e.g., Tech Blogger Sarah"
          value={formData.name || ''}
          onChange={(e) => updateFormField('name', e.target.value)}
        />
        <Select
          label="Role"
          data={[
            { value: 'content_writer', label: 'Content Writer' },
            { value: 'content_reviewer', label: 'Content Reviewer' },
          ]}
          value={formData.role || defaultRole || 'content_writer'}
          onChange={(value) => updateFormField('role', value as AgentRole)}
        />
        <MultiSelect
          label="Areas of Expertise"
          placeholder="Select or create new tags"
          data={expertiseSuggestions}
          value={formData.expertise || []}
          onChange={(value) => updateFormField('expertise', value)}
          searchable
        />
        <SelectCreatable
          label={formData.role === 'content_reviewer' ? 'Review Style' : 'Writing Style'}
          placeholder={
            formData.role === 'content_reviewer'
              ? 'Select how detailed or concise the reviews should be'
              : 'Choose the primary writing style'
          }
          options={getStyleOptions(formData.role || 'content_writer')?.map((style) => style?.value)}
          value={formData.writingStyle || ''}
          onChange={(value) => updateFormField('writingStyle', value as WritingStyle)}
        />
        <SelectCreatable
          label="Tone of Voice"
          placeholder="Select the tone for communication"
          options={toneOptions.map((tone) => tone?.value)}
          value={formData.tone || ''}
          onChange={(value) => updateFormField('tone', value as ToneOfVoice)}
        />
        <Select
          label="Language Model"
          placeholder="Select the LLM (coming soon)"
          data={llmOptions}
          disabled
          value={formData.llm}
          onChange={(value) => updateFormField('llm', value || undefined)}
        />
        <Textarea
          label="Persona Definition"
          placeholder="Describe the agent's personality, expertise, and approach in detail. Include their background, key strengths, and how they typically handle tasks in their role. For example:

As a seasoned tech journalist with 10+ years of experience, this agent excels in breaking down complex technological concepts for a general audience. They have a knack for spotting emerging trends and can provide insightful analysis on how new technologies might impact various industries. Their writing style is clear and engaging, often using analogies to make difficult concepts more accessible. When reviewing content, they pay close attention to technical accuracy while ensuring the information remains digestible for non-experts."
          value={formData.systemPrompt || ''}
          onChange={(e) => updateFormField('systemPrompt', e.target.value)}
          autosize
          minRows={5}
        />
        <MultiSelect
          label={
            <Group gap="xs">
              <Text>Skills</Text>
              <Badge size="xs">Coming Soon</Badge>
            </Group>
          }
          placeholder="Agent capabilities"
          data={skillOptions}
          disabled
          defaultValue={skillOptions.map((i) => i.value)}
          description="Special capabilities that enhance agent performance"
        />
        <Button onClick={handleSave}>Save</Button>
      </Stack>
    </Modal>
  );
}
