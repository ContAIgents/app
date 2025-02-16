import { useEffect, useState } from 'react';
import { Container, Grid, Paper } from '@mantine/core';
import { FileTree } from '@/components/FileTree/FileTree';
import MarkdownEditorComponent from '@/components/MarkdownEditor';
import { FileTreeType } from '@/types/files';

export function FileEditorPage() {
  const [fileTree, setFileTree] = useState<FileTreeType | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');

  useEffect(() => {
    // Fetch file tree
    fetch('http://localhost:3000/api/files/tree')
      .then(res => res.json())
      .then(data => {
        // Transform the flat array into a tree structure
        const root = {
          name: 'root',
          path: '/',
          type: 'directory',
          children: data
        };
        setFileTree(root);
      })
      .catch(console.error);
  }, []);

  const handleFileSelect = async (path: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/files/${path}`);
      const data = await response.json();
      setSelectedFile(path);
      setFileContent(data.content);
    } catch (error) {
      console.error('Error loading file:', error);
    }
  };

  return (
    <Container fluid mt="md">
      <Grid>
        <Grid.Col span={3}>
          <Paper withBorder>
            <FileTree 
              tree={fileTree} 
              onSelect={handleFileSelect}
              selectedPath={selectedFile}
            />
          </Paper>
        </Grid.Col>
        <Grid.Col span={9}>
          <Paper withBorder p="md">
            {selectedFile ? (
              <MarkdownEditorComponent
                content={fileContent}
                onUpdate={(content) => setFileContent(content)}
              />
            ) : (
              <div>Select a file to edit</div>
            )}
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
