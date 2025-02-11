import { useState } from 'react';
import { Modal, Stack, Text, Textarea, Button, Group } from '@mantine/core';
import { modals } from '@mantine/modals';

interface ModalContentProps {
  onSubmit: (instructions: string) => void;
  onCancel: () => void;
}

function ModalContent({ onSubmit, onCancel }: ModalContentProps) {
  const [instructions, setInstructions] = useState('');
  
  return (
    <Stack>
      <Text size="sm">
        Provide specific instructions for the reviewer to focus on during this review:
      </Text>

      <Textarea
        placeholder="e.g., Please focus on technical accuracy and code examples"
        minRows={3}
        value={instructions}
        onChange={(e) => setInstructions(e.currentTarget.value)}
      />

      <Group justify="right" mt="md">
        <Button 
          variant="light" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit(instructions)}
          disabled={!instructions.trim()}
        >
          Submit Request
        </Button>
      </Group>
    </Stack>
  );
}

export function getReviewInstructionsFromUser() {
  return new Promise<string>((resolve, reject) => {
    modals.open({
      title: "Request Re-review",
      size: "md",
      onClose: () => reject(new Error('Modal closed')),
      children: (
        <ModalContent
          onSubmit={(instructions) => {
            modals.closeAll();
            resolve(instructions);
          }}
          onCancel={() => {
            modals.closeAll();
            reject(new Error('Modal closed'));
          }}
        />
      ),
    });
  });
}
