import { Container, Title, Paper, Button, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import { KnowledgeBaseManager } from '../services/knowledgeBase/KnowledgeBaseManager';

export function KnowledgeBaseEdit() {
  const navigate = useNavigate();
  const knowledgeBaseManager = new KnowledgeBaseManager();
  const [content, setContent] = useState('');

  const editor = useEditor({
    extensions: [StarterKit, Link],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    const doc = knowledgeBaseManager.getDefaultDocument();
    setContent(doc.content);
    editor?.commands.setContent(doc.content);
  }, [editor]);

  const handleSave = () => {
    knowledgeBaseManager.saveDefaultDocument(content);
    navigate('/knowledgeBase');
  };

  const handleCancel = () => {
    navigate('/knowledgeBase');
  };

  return (
    <Container size="xl" py="xl" style={{ height: 'calc(100vh - 80px)' }}>
      <Paper shadow="sm" p="md" withBorder style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Group justify="space-between" mb="md">
          <Title order={2}>Edit Knowledge Base</Title>
          <Group>
            <Button variant="light" onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </Group>
        </Group>

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
    </Container>
  );
}