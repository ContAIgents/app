import { useEffect, useState } from 'react';
import { Container, Group, Paper, Stack, Text, Title, Button } from '@mantine/core';
import { FileTree as FileTreeType } from '@/types/files';
import MarkdownEditor from '@/components/MarkdownEditor';
import { FileTree } from '@/components/FileTree';
import { IconRefresh } from '@tabler/icons-react';

export function FileEditorPage() {
  const [fileTree, setFileTree] = useState<FileTreeType | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchFileTree = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/files/tree');
      const data = await response.json();
      setFileTree(data);
    } catch (error) {
      console.error('Failed to fetch file tree:', error);
    }
  };

  const fetchFileContent = async (path: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/files/${path}`);
      const data = await response.json();
      setContent(data.content);
    } catch (error) {
      console.error('Failed to fetch file content:', error);
    }
  };

  const handleContentUpdate = async (newContent: string) => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      await fetch(`http://localhost:3000/api/files/${selectedFile}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });
      setContent(newContent);
    } catch (error) {
      console.error('Failed to save file:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFileTree();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      fetchFileContent(selectedFile);
    }
  }, [selectedFile]);

  return (
    <Container size="xl" py="xl">
      <Group position="apart" mb="xl">
        <Title order={2}>File Editor</Title>
        <Button
          leftIcon={<IconRefresh size="1.1rem" />}
          variant="light"
          onClick={fetchFileTree}
          loading={loading}
        >
          Refresh Files
        </Button>
      </Group>
      
      <Group align="flex-start" spacing="md" noWrap>
        <Paper withBorder p="md" style={{ width: 300, minHeight: '70vh' }}>
          <Title order={4} mb="md">Files</Title>
          {fileTree ? (
            <FileTree
              tree={fileTree}
              onSelect={(path) => setSelectedFile(path)}
              selectedPath={selectedFile}
            />
          ) : (
            <Text c="dimmed">Loading files...</Text>
          )}
        </Paper>

        <Stack style={{ flex: 1, minHeight: '70vh' }}>
          {selectedFile ? (
            <Paper withBorder p="md" style={{ height: '100%' }}>
              <MarkdownEditor
                content={content}
                onUpdate={handleContentUpdate}
                disableAIFeatures={true}
              />
            </Paper>
          ) : (
            <Paper 
              withBorder 
              p="xl" 
              style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <Text c="dimmed">Select a file to edit</Text>
            </Paper>
          )}
        </Stack>
      </Group>
    </Container>
  );
}
