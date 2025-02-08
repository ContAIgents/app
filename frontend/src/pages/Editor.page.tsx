import { useState } from 'react';
import { Container, Title, Paper, Group, Button, Stack } from '@mantine/core';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export function EditorPage() {
  const [content, setContent] = useState('<p>Start typing here...</p>');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
    ],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  const handleSave = () => {
    console.log('Saving content:', content);
  };

  return (
    <Container size="xl" py="xl" style={{ height: 'calc(100vh - 80px)' }}>
      <Stack h="100%">
        <Group justify="space-between" align="center">
          <Title order={1}>Rich Text Editor</Title>
          <Button onClick={handleSave}>Save</Button>
        </Group>

        <Paper 
          shadow="sm" 
          p="md" 
          withBorder 
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <RichTextEditor editor={editor} style={{ flex: 1 }}>
            <RichTextEditor.Toolbar sticky>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Underline />
                <RichTextEditor.Strikethrough />
                <RichTextEditor.ClearFormatting />
                <RichTextEditor.Code />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.H1 />
                <RichTextEditor.H2 />
                <RichTextEditor.H3 />
                <RichTextEditor.H4 />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Blockquote />
                <RichTextEditor.Hr />
                <RichTextEditor.BulletList />
                <RichTextEditor.OrderedList />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />
              </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar>

            <RichTextEditor.Content />
          </RichTextEditor>
        </Paper>
      </Stack>
    </Container>
  );
}
