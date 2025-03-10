import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Group,
  PasswordInput,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { SelectCreatable } from '@/components/common/SelectCreatable';
import { AnthropicProvider } from '@/services/llm/AnthropicProvider';
import { DeepSeekProvider } from '@/services/llm/DeepSeekProvider';
import { GoogleProvider } from '@/services/llm/GoogleProvider';
import { HuggingFaceProvider } from '@/services/llm/HuggingFaceProvider';
import { LLMFactory } from '@/services/llm/LLMFactory';
import { OllamaProvider } from '@/services/llm/OllamaProvider';
import { OpenAIProvider } from '@/services/llm/OpenAIProvider';
import { OpenRouterProvider } from '@/services/llm/OpenRouterProvider';
import { ReplicateProvider } from '@/services/llm/ReplicateProvider';

interface LlmConfigModalProps {
  onClose: () => void;
  onSave: () => void;
}

const providers = {
  OpenAI: OpenAIProvider.providerConfig,
  Anthropic: AnthropicProvider.providerConfig,
  Google: GoogleProvider.providerConfig,
  DeepSeek: DeepSeekProvider.providerConfig,
  HuggingFace: HuggingFaceProvider.providerConfig,
  Ollama: OllamaProvider.providerConfig,
  Replicate: ReplicateProvider.providerConfig,
  OpenRouter: OpenRouterProvider.providerConfig,
};

interface AddProviderSectionProps {
  selectedProvider: string | null;
  config: Record<string, any>;
  saved: boolean;
  error: string | null;
  onProviderChange: (value: string | null) => void;
  onConfigChange: (field: string, value: string) => void;
  onSave: () => void;
}

function AddProviderSection({
  selectedProvider,
  config,
  saved,
  error,
  onProviderChange,
  onConfigChange,
  onSave,
}: AddProviderSectionProps) {
  const provider = selectedProvider ? providers[selectedProvider as keyof typeof providers] : null;

  return (
    <Stack>
      <Select
        label="Add New Provider"
        placeholder="Choose a provider"
        data={Object.keys(providers)}
        value={selectedProvider}
        onChange={onProviderChange}
        required
      />

      {selectedProvider && provider && (
        <>
          {saved && (
            <Alert color="teal" radius="md">
              Provider is configured and ready to use
            </Alert>
          )}

          {provider.configFields.map((field) => {
            const props = {
              key: field.name,
              label: field.label,
              required: field.required,
              value: config[field.name] || '',
              onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                onConfigChange(field.name, event.currentTarget.value),
            };

            if (field.type === 'password') {
              return <PasswordInput {...props} />;
            }
            if (field.type === 'select') {
              return field.allowCustom ? (
                <SelectCreatable
                  key={field.name}
                  label={field.label}
                  value={config[field.name] || ''}
                  onChange={(value) => onConfigChange(field.name, value)}
                  options={field.options || []}
                  required={field.required}
                />
              ) : (
                <Select
                  {...props}
                  data={field.options || []}
                  onChange={(value) => onConfigChange(field.name, value || '')}
                />
              );
            }
            return <TextInput {...props} type={field.type} />;
          })}

          {error && (
            <Alert color="red" radius="md">
              {error}
            </Alert>
          )}

          <Button onClick={onSave}>Save Configuration</Button>
        </>
      )}
    </Stack>
  );
}

export function LlmConfigModal({ onClose, onSave }: LlmConfigModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configurations, setConfigurations] = useState(LLMFactory.getConfigurations());

  useEffect(() => {
    setConfigurations(LLMFactory.getConfigurations());
  }, []);

  const handleProviderChange = (value: string | null) => {
    setSelectedProvider(value);
    if (value && configurations.providers[value]) {
      setConfig(configurations.providers[value].config);
    } else {
      setConfig({});
    }
    setSaved(false);
    setError(null);
  };

  const handleConfigChange = (field: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (!selectedProvider) {
        setError('Please select a provider');
        return;
      }

      const llm = LLMFactory.getProvider(selectedProvider);
      llm.configure(config);

      setConfigurations(LLMFactory.getConfigurations());
      setSaved(true);
      setError(null);
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    }
  };

  const handleSetDefault = (providerName: string) => {
    LLMFactory.setDefaultProvider(providerName);
    setConfigurations(LLMFactory.getConfigurations());
  };

  return (
    <Stack>
      <Alert color="blue" radius="md" mb="lg">
        <Text fw={500} mb={4}>
          Privacy Notice
        </Text>
        <Text size="sm">
          Your LLM credentials are never stored on our servers. When using the CLI, configurations
          are stored locally in your filesystem. In browser-only mode, credentials are temporarily
          stored in your browser's localStorage.
        </Text>
      </Alert>
      <Alert color="blue" radius="md" mb="md">
            <Text size="sm">
              Don't have an API key? Get a free trial key from{' '}
              <Text component="a" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" c="blue" td="underline">
                Google AI Studio
              </Text>
            </Text>
          </Alert>
      <Stack gap="md">
        <Text fw={500}>Configured Providers</Text>
        {Object.entries(configurations.providers).map(([name, _]) => (
          <Group key={name} justify="apart">
            <Group>
              <Text>{name}</Text>
              {configurations.defaultProvider === name && <Badge color="blue">Default</Badge>}
            </Group>
            <Group>
              <Button
                variant="subtle"
                onClick={() => {
                  setSelectedProvider(name);
                  setConfig(configurations.providers[name].config);
                }}
              >
                Edit
              </Button>
              <Button
                variant="subtle"
                color="blue"
                disabled={configurations.defaultProvider === name}
                onClick={() => handleSetDefault(name)}
              >
                Set as Default
              </Button>
            </Group>
          </Group>
        ))}
      </Stack>

      <AddProviderSection
        selectedProvider={selectedProvider}
        config={config}
        saved={saved}
        error={error}
        onProviderChange={handleProviderChange}
        onConfigChange={handleConfigChange}
        onSave={handleSave}
      />
    </Stack>
  );
}
