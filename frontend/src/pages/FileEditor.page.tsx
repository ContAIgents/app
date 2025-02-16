import { useEffect, useState } from 'react';
import { Container, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { FileTree as FileTreeType } from '@/types/files';
import MarkdownEditor from '@/components/MarkdownEditor';
import { FileTree } from '@/components/FileTree';

export function FileEditorPage() {
  const [fileTree, setFileTree] = useState<FileTreeType | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    fetchFileTree();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      fetchFileContent(selectedFile);
    }
  }, [selectedFile]);

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

    try {
      await fetch(`http://localhost:3000/api/files/${selectedFile}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="xl">File Editor</Title>
      <Group align="flex-start" gap="md">
        <Paper withBorder p="md" style={{ width: 300 }}>
          {fileTree && (
            <FileTree
              tree={fileTree}
              onSelect={(path) => setSelectedFile(path)}
              selectedPath={selectedFile}
            />
          )}
        </Paper>
        <Stack style={{ flex: 1 }}>
          {selectedFile ? (
            <MarkdownEditor
              content={content}
              onUpdate={handleContentUpdate}
            />
          ) : (
            <Text>Select a file to edit</Text>
          )}
        </Stack>
      </Group>
    </Container>
  );
}