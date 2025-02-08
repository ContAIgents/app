import { useState, useEffect } from 'react';
import { Container, Title, Paper, Select, TextInput, PasswordInput, Button, Stack, Alert } from '@mantine/core';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { LLMFactory } from '../services/llm/LLMFactory';
import { OpenAIProvider } from '../services/llm/OpenAIProvider';

export function LlmConfig() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const providers = {
    'OpenAI': OpenAIProvider.providerConfig,
  };

  const provider = selectedProvider ? providers[selectedProvider as keyof typeof providers] : null;

  useEffect(() => {
    if (selectedProvider) {
      const llm = LLMFactory.getProvider(selectedProvider);
      setConfig(llm.getConfig());
    }
  }, [selectedProvider]);

  const handleProviderChange = (value: string | null) => {
    setSelectedProvider(value);
  };

  const handleConfigChange = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (!selectedProvider || !provider) {
        throw new Error('Please select a provider');
      }

      const llm = LLMFactory.getProvider(selectedProvider);
      llm.configure(config);

      setSaved(true);
      setError(null);
      
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
      setSaved(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="xl">LLM Configuration</Title>

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
                  return (
                    <Select
                      {...props}
                      data={field.options || []}
                      onChange={(value) => handleConfigChange(field.name, value || '')}
                    />
                  );
                }
                return <TextInput {...props} type={field.type} />;
              })}

              <Button onClick={handleSave} mt="md">
                Save Configuration
              </Button>

              {saved && (
                <Alert icon={<IconCheck size="1rem" />} title="Success!" color="green">
                  Configuration saved successfully
                </Alert>
              )}

              {error && (
                <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red">
                  {error}
                </Alert>
              )}
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
