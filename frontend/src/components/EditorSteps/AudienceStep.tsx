import { Box, Button, Stack, Textarea, Text, Title } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { useState } from 'react';

interface AudienceStepProps {
  targetAudience: string;
  setTargetAudience: (value: string) => void;
  onNext: () => void;
}

export function AudienceStep({ targetAudience, setTargetAudience, onNext }: AudienceStepProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Box
      maw={800}
      mx="auto"
      mt={50}
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Stack gap="xl" align="center" style={{ width: '100%' }}>
        <Box mb={20}>
          <Title
            order={1}
            size="2rem"
            ta="center"
            style={{
              transition: 'transform 0.3s ease',
              transform: isFocused ? 'translateY(-20px)' : 'none',
              fontWeight: 600,
            }}
          >
            Who is your target audience?
          </Title>
        </Box>

        <Box style={{ width: '100%', maxWidth: 700, position: 'relative' }}>
          <Textarea
            size="xl"
            radius="md"
            placeholder="e.g., Software developers with 3-5 years experience interested in AI tools..."
            value={targetAudience}
            onChange={(event) => setTargetAudience(event.currentTarget.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autosize
            minRows={3}
            maxRows={8}
            styles={{
              input: {
                fontSize: '1.2rem',
                lineHeight: 1.5,
                padding: '1rem',
                backgroundColor: 'var(--mantine-color-body)',
                border: '1px solid var(--mantine-color-gray-3)',
                '&:focus': {
                  borderColor: 'var(--mantine-color-blue-5)',
                },
              },
            }}
          />

          <Box 
            style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              marginTop: '1rem',
              height: 40, // Fixed height to prevent layout shift
              opacity: targetAudience.trim() ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out',
              pointerEvents: targetAudience.trim() ? 'auto' : 'none'
            }}
          >
            <Button
              variant="gradient"
              gradient={{ from: 'indigo', to: 'cyan' }}
              size="md"
              radius="md"
              onClick={onNext}
            >
              GO
              <IconArrowRight size="1rem" style={{ marginLeft: 8 }} />
            </Button>
          </Box>
        </Box>

        <Text
          c="dimmed"
          size="sm"
          mt="xl"
          style={{
            transition: 'opacity 0.3s ease',
            opacity: isFocused ? 0 : 0.7,
          }}
        >
          Describe your target audience in detail to help AI create more relevant content
        </Text>
      </Stack>
    </Box>
  );
}
