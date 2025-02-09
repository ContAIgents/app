import React, { useEffect, useState } from 'react';
import { Container, Group, Paper, Stack } from '@mantine/core';
import RichTextEditorComponent from '../components/Editor';
import { TableOfContents } from '@/components/TableOfContents';
import { ConfigManager } from '../services/config/ConfigManager';
import { IContentBlock } from '@/AppContext';

export const EditorPage: React.FC = () => {
  const [contentBlocks, setContentBlocks] = useState<IContentBlock[]>([]);
  const configManager = new ConfigManager('editor_');

  useEffect(() => {
    const loadContent = () => {
      const blocks = configManager.load<IContentBlock[]>('contentBlocks') || [];
      setContentBlocks(blocks);
    };
    loadContent();
  }, []);

  const handleUpdate = (id: number, content: string) => {
    const updatedBlocks = contentBlocks.map(block =>
      block.id === id ? { ...block, content } : block
    );
    setContentBlocks(updatedBlocks);
    configManager.save('contentBlocks', updatedBlocks);
  };

  // Generate table of contents links from content blocks
  const tocLinks = contentBlocks.map((block) => ({
    label: block.title,
    link: `#section-${block.id}`,
    order: 1
  }));

  return (
    <Container size="xl" py="xl" style={{ height: 'calc(100vh - 80px)' }}>
      <Stack h="100%" gap="md" style={{ flexDirection: 'row' }}>
        <Paper p="md">
          <TableOfContents links={tocLinks} />
        </Paper>
        <Stack h="100%" gap="md" style={{ flex: 2 }}>
          {contentBlocks.map((editor) => (
            <Group key={editor.id} id={`section-${editor.id}`}>
              <Paper p="md" style={{ flex: 1 }}>
                <RichTextEditorComponent
                  content={editor.content}
                  onUpdate={(content) => handleUpdate(editor.id, content)}
                />
              </Paper>
              <Stack gap="md">
                {editor?.comments?.map(({user, comment, id}) => (
                  <Paper key={id} p="md">
                    <div>
                      <strong>{user}</strong>
                      <p>{comment}</p>
                    </div>
                  </Paper>
                ))}
              </Stack>
            </Group>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
};
``;
