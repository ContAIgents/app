import { Container, Title, Paper, Button, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import { KnowledgeBaseManager } from '../services/knowledgeBase/KnowledgeBaseManager';
import MarkdownEditorComponent from '@/components/MarkdownEditor';

const PLACEHOLDER_CONTENT = `
# Welcome to Your Knowledge Base

This is a sample knowledge base to help you get started. Your actual knowledge base should contain information specific to your needs, such as:

- Company/brand information
- Style guidelines
- Content rules
- Industry-specific knowledge
- Common terminology and phrases

The more detailed and structured your knowledge base is, the better your AI assistant will understand your requirements.

Feel free to modify this content or start from scratch to create a knowledge base that suits your specific needs.
`;

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
    const initialContent = doc.content === 'Welcome to the Knowledge Base' 
      ? PLACEHOLDER_CONTENT 
      : doc.content;
    setContent(initialContent);
    editor?.commands.setContent(initialContent);
  }, [editor]);

  const handleSave = () => {
    knowledgeBaseManager.saveDefaultDocument(content);
    navigate('/knowledgeBase');
  };

  return (
    <Container size="xl" h="calc(100vh - 80px)" py="xl">
      <Paper shadow="sm" p="md" withBorder h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
        <Group justify="space-between" mb="md">
          <Title order={2}>Edit Knowledge Base</Title>
          <Group>
            <Button variant="light" onClick={() => navigate('/knowledgeBase')}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </Group>
        </Group>

        <MarkdownEditorComponent
          content={content}
          onUpdate={(newContent) => setContent(newContent)}
          disableAIFeatures={true}
        />
      </Paper>
    </Container>
  );
}
