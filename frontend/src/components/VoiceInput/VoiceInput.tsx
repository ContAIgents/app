import { Group, Paper, Text, Tooltip } from '@mantine/core';
import { IconMicrophone } from '@tabler/icons-react';
import classes from './VoiceInput.module.css';

interface VoiceInputProps {
  disabled?: boolean;
  tooltipLabel?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  disabled = true,
  tooltipLabel = 'Coming Soon: Voice Instructions',
}) => {
  return (
    <Tooltip label={tooltipLabel}>
      <Paper
        p="sm"
        mb="md"
        style={{
          border: '1px solid var(--mantine-color-gray-3)',
          borderRadius: 'var(--mantine-radius-md)',
          opacity: disabled ? 0.7 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconMicrophone 
              size="1.2rem" 
              style={{ color: 'var(--mantine-color-gray-6)' }}
            />
            <Text size="sm" c="dimmed">Instruct with Voice</Text>
          </Group>
          
          {/* Wave Animation */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '2px', 
            height: '20px' 
          }}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={classes.waveBar}
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </Group>
      </Paper>
    </Tooltip>
  );
};
