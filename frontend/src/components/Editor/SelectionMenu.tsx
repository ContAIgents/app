import { Menu, Button, Text, Modal, Textarea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconWand, IconTextSpellcheck, IconBrain } from '@tabler/icons-react';
import { useState } from 'react';

interface SelectionMenuProps {
  selection: string;
  onRephrase: (text: string, instructions: string) => Promise<void>;
  onGrammarCheck: (text: string) => Promise<void>;
  onExplain: (text: string) => Promise<void>;
}

export const SelectionMenu: React.FC<SelectionMenuProps> = ({
  selection,
  onRephrase,
  onGrammarCheck,
  onExplain,
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [instructions, setInstructions] = useState('');

  const handleRephrase = async () => {
    await onRephrase(selection, instructions);
    close();
    setInstructions('');
  };

  return (
    <>
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Button size="xs" variant="light">Edit</Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item 
            leftSection={<IconWand size={14} />}
            onClick={open}
          >
            Rephrase
          </Menu.Item>
          <Menu.Item 
            leftSection={<IconTextSpellcheck size={14} />}
            onClick={() => onGrammarCheck(selection)}
          >
            Grammar Check
          </Menu.Item>
          <Menu.Item 
            leftSection={<IconBrain size={14} />}
            onClick={() => onExplain(selection)}
          >
            Explain Simply
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Modal opened={opened} onClose={close} title="Rephrase Instructions">
        <Textarea
          placeholder="How would you like this rephrased? (e.g., make it more formal, simplify it, etc.)"
          value={instructions}
          onChange={(e) => setInstructions(e.currentTarget.value)}
          minRows={3}
          mb="md"
        />
        <Button onClick={handleRephrase}>Rephrase</Button>
      </Modal>
    </>
  );
};
