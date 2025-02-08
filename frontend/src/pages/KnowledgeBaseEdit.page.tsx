import { Container, Title, Paper, Button, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import { KnowledgeBaseManager } from '../services/knowledgeBase/KnowledgeBaseManager';

const PLACEHOLDER_CONTENT = `
<h1>Knowledge Base</h1>

<p>Welcome to your AI assistant's knowledge base. This is where you can provide context and information that your AI will use when generating content. Here are some suggestions for what to include:</p>

<h2>Company/Brand Information</h2>
<ul>
  <li>Company overview and mission</li>
  <li>Brand voice and tone guidelines</li>
  <li>Key products or services</li>
</ul>

<h2>Style Guidelines</h2>
<ul>
  <li>Writing style preferences</li>
  <li>Formatting conventions</li>
  <li>Common terminology and phrases</li>
</ul>

<h2>Content Rules</h2>
<ul>
  <li>Topics to focus on</li>
  <li>Topics to avoid</li>
  <li>Specific requirements or restrictions</li>
</ul>

<p>Feel free to modify this template to match your specific needs. The more detailed and structured your knowledge base is, the better your AI assistant will understand your requirements.</p>
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

        <RichTextEditor editor={editor} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <RichTextEditor.Toolbar sticky>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
              <RichTextEditor.Strikethrough />
              <RichTextEditor.ClearFormatting />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.H1 />
              <RichTextEditor.H2 />
              <RichTextEditor.H3 />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.BulletList />
              <RichTextEditor.OrderedList />
              <RichTextEditor.Link />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>

          <RichTextEditor.Content style={{ flex: 1 }} />
        </RichTextEditor>
      </Paper>
    </Container>
  );
}
