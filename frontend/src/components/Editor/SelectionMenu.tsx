import { Button, Group, Tooltip, TextInput, Modal, Loader } from '@mantine/core';
import { IconWand, IconTextSpellcheck, IconBrain } from '@tabler/icons-react';
import { useState } from 'react';

interface SelectionMenuProps {
  selection: string;
  onRephrase: (text: string, instructions: string) => Promise<void>;
  onGrammarCheck: (text: string) => Promise<void>;
  onExplain: (text: string) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

export const SelectionMenu: React.FC<SelectionMenuProps> = ({
  selection,
  onRephrase,
  onGrammarCheck,
  onExplain,
  isLoading = false,
  disabled = false
}) => {
  const [rephraseModalOpen, setRephraseModalOpen] = useState(false);
  const [rephraseInstructions, setRephraseInstructions] = useState('');
  const [activeOperation, setActiveOperation] = useState<'rephrase' | 'grammar' | 'eli5' | null>(null);

  const handleRephraseSubmit = async () => {
    setActiveOperation('rephrase');
    try {
      await onRephrase(selection, rephraseInstructions);
    } finally {
      setActiveOperation(null);
      setRephraseModalOpen(false);
      setRephraseInstructions('');
    }
  };

  const handleGrammarCheck = async () => {
    setActiveOperation('grammar');
    try {
      await onGrammarCheck(selection);
    } finally {
      setActiveOperation(null);
    }
  };

  const handleExplain = async () => {
    setActiveOperation('eli5');
    try {
      await onExplain(selection);
    } finally {
      setActiveOperation(null);
    }
  };

  const isButtonDisabled = isLoading || disabled;

  return (
    <>
      <Group gap="xs">
        <Tooltip 
          label="Rewrite the selected text with custom instructions" 
          position="top"
          withArrow
        >
          <Button 
            size="xs" 
            variant="light"
            leftSection={activeOperation === 'rephrase' ? <Loader size={14} /> : <IconWand size={14} />}
            onClick={() => setRephraseModalOpen(true)}
            disabled={isButtonDisabled}
            loading={activeOperation === 'rephrase'}
          >
            Rephrase
          </Button>
        </Tooltip>
        
        <Tooltip 
          label="Fix grammar and improve writing style" 
          position="top"
          withArrow
        >
          <Button 
            size="xs" 
            variant="light"
            leftSection={activeOperation === 'grammar' ? <Loader size={14} /> : <IconTextSpellcheck size={14} />}
            onClick={handleGrammarCheck}
            disabled={isButtonDisabled}
            loading={activeOperation === 'grammar'}
          >
            Grammar
          </Button>
        </Tooltip>
        
        <Tooltip 
          label="Explain this like I'm five years old" 
          position="top"
          withArrow
        >
          <Button 
            size="xs" 
            variant="light"
            leftSection={activeOperation === 'eli5' ? <Loader size={14} /> : <IconBrain size={14} />}
            onClick={handleExplain}
            disabled={isButtonDisabled}
            loading={activeOperation === 'eli5'}
          >
            ELI5
          </Button>
        </Tooltip>
      </Group>

      <Modal
        opened={rephraseModalOpen}
        onClose={() => {
          if (!activeOperation) {
            setRephraseModalOpen(false);
            setRephraseInstructions('');
          }
        }}
        title="How should I rephrase this?"
        size="md"
      >
        <TextInput
          placeholder="e.g., Make it more formal, Use simpler words, Make it shorter..."
          value={rephraseInstructions}
          onChange={(event) => setRephraseInstructions(event.currentTarget.value)}
          mb="md"
          disabled={activeOperation === 'rephrase'}
        />
        <Group justify="flex-end">
          <Button 
            variant="light" 
            onClick={() => {
              setRephraseModalOpen(false);
              setRephraseInstructions('');
            }}
            disabled={activeOperation === 'rephrase'}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRephraseSubmit}
            loading={activeOperation === 'rephrase'}
            disabled={!rephraseInstructions.trim()}
          >
            Rephrase
          </Button>
        </Group>
      </Modal>
    </>
  );
};
