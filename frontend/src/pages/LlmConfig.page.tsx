import { useEffect, useState } from 'react';
import { IconCheck } from '@tabler/icons-react';
import {
  Alert,
  Container,
  Paper,
  PasswordInput,
  Select,
  Stack,
  TextInput,
  Title,
  Text,
} from '@mantine/core';
import { AnthropicProvider } from '@/services/llm/AnthropicProvider';
import { DeepSeekProvider } from '@/services/llm/DeepSeekProvider';
import { GoogleProvider } from '@/services/llm/GoogleProvider';
import { HuggingFaceProvider } from '@/services/llm/HuggingFaceProvider';
import { OllamaProvider } from '@/services/llm/OllamaProvider';
import { OpenAIProvider } from '@/services/llm/OpenAIProvider';
import { OnboardingNavigation } from '../components/OnboardingNavigation/OnboardingNavigation';
import { LLMFactory } from '../services/llm/LLMFactory';

export function LlmConfig() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial configuration when component mounts
  useEffect(() => {
    // Try to find a configured provider
    for (const providerName of Object.keys(providers)) {
      try {
        const llm = LLMFactory.getProvider(providerName);
        if (llm.isConfigured()) {
          setSelectedProvider(providerName);
          setConfig(llm.getConfig());
          setSaved(true);
          break;
        }
      } catch (error) {
        console.error(`Error checking ${providerName} configuration:`, error);
      }
    }
  }, []);

  // Existing provider selection effect
  useEffect(() => {
    if (selectedProvider) {
      const llm = LLMFactory.getProvider(selectedProvider);
      setConfig(llm.getConfig());
    }
  }, [selectedProvider]);

  const providers = {
    OpenAI: OpenAIProvider.providerConfig,
    Anthropic: AnthropicProvider.providerConfig,
    Google: GoogleProvider.providerConfig,
    DeepSeek: DeepSeekProvider.providerConfig,
    HuggingFace: HuggingFaceProvider.providerConfig,
    Ollama: OllamaProvider.providerConfig,
  };

  const provider = selectedProvider ? providers[selectedProvider as keyof typeof providers] : null;

  const handleProviderChange = (value: string | null) => {
    setSelectedProvider(value);
    if (value) {
      const llm = LLMFactory.getProvider(value);
      setConfig(llm.getConfig()); // Load existing config if available
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

  const validateAndSave = async () => {
    try {
      if (!selectedProvider || !provider) {
        setError('Please select a provider');
        return false;
      }

      const llm = LLMFactory.getProvider(selectedProvider);
      llm.configure(config);

      // // Test the configuration
      // await llm.executePrompt('test');

      setSaved(true);
      setError(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
      return false;
    }
  };

  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="xl">
        LLM Configuration
      </Title>

      <Alert color="blue" radius="md" mb="lg">
        <Text fw={500} mb={4}>Privacy Notice</Text>
        <Text size="sm">
          Your LLM credentials are never stored on our servers. When using the CLI, configurations are stored locally in your filesystem. 
          In browser-only mode, credentials are temporarily stored in your browser's localStorage.
        </Text>
      </Alert>

      <Paper shadow="sm" p="xl" withBorder>
        <Stack>
          <Select
            label="Select LLM Provider"
            placeholder="Choose a provider"
            data={Object.keys(providers)}
            value={selectedProvider}
            onChange={handleProviderChange}
            required
          />

          {provider && (
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
                    handleConfigChange(field.name, event.currentTarget.value),
                };

                if (field.type === 'password') {
                  return <PasswordInput {...props} />;
                }
                if (field.type === 'select') {
                  return field.allowCustom ? (
                    <Select
                      {...props}
                      data={field.options || []}
                      searchable
                      onChange={(value) => handleConfigChange(field.name, value || '')}
                    />
                  ) : (
                    <Select
                      {...props}
                      data={field.options || []}
                      onChange={(value) => handleConfigChange(field.name, value || '')}
                    />
                  );
                }
                return <TextInput {...props} type={field.type} />;
              })}

              <OnboardingNavigation
                nextPath="/agents"
                onNext={validateAndSave}
                nextLabel="Save & Continue"
              />
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
