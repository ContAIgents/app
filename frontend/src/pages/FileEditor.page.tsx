import { useEffect, useState } from 'react';
import { Container, Grid, Paper, Group, Stack, Text, ActionIcon, Tooltip } from '@mantine/core';
import { IconInfoCircle, IconMicrophone } from '@tabler/icons-react';
import { FileTree } from '@/components/FileTree/FileTree';
import MarkdownEditorComponent from '@/components/MarkdownEditor';
import { FileTreeType } from '@/types/files';
import { Agent } from '@/services/agents/Agent';
import { ConfigManager } from '@/services/config/ConfigManager';
import { CommentCard } from '@/components/CommentCard/CommentCard';
import { VoiceInput } from '@/components/VoiceInput/VoiceInput';
import { getReviewInstructionsFromUser } from '@/components/ReviewInstructionsModal/ReviewInstructionsModal';
import { Comment } from '@/types/content';
import { IBlockStatus } from '@/types/editor';

const COMMENT_WIDTH = 280;

export function FileEditorPage() {
  const [fileTree, setFileTree] = useState<FileTreeType | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [blockStatus, setBlockStatus] = useState<IBlockStatus>({
    isLoading: false,
    error: null,
    reviewStatus: 'pending',
    isInitialReview: true,
  });
  
  const configManager = new ConfigManager('file_editor_');
  const [selectedWriter, setSelectedWriter] = useState<Agent | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<Agent | null>(null);

  useEffect(() => {
    // Load agents from config
    const writerConfig = configManager.load('selectedWriter');
    const reviewerConfig = configManager.load('selectedReviewer');
    if (writerConfig) setSelectedWriter(new Agent(writerConfig));
    if (reviewerConfig) setSelectedReviewer(new Agent(reviewerConfig));

    // Fetch file tree
    fetch('http://localhost:3000/api/files/tree')
      .then(res => res.json())
      .then(data => {
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
      
      // Load comments for this file
      const savedComments = configManager.load<Comment[]>(`comments_${path}`) || [];
      setComments(savedComments);
    } catch (error) {
      console.error('Error loading file:', error);
    }
  };

  const handleRequestReview = async (commentId: number) => {
    if (!selectedReviewer || !selectedFile) return;

    try {
      setBlockStatus(prev => ({ ...prev, reviewStatus: 'reviewing' }));

      // Update comment to loading state
      setComments(comments.map(c =>
        c.id === commentId ? { ...c, status: 'loading' } : c
      ));

      const instructions = await getReviewInstructionsFromUser();
      const reviewResponse = await selectedReviewer.generateReview(
        { id: 1, title: selectedFile, content: fileContent },
        instructions
      );

      setComments(comments.map(c =>
        c.id === commentId
          ? {
              ...c,
              comment: reviewResponse,
              status: 'success',
              user: selectedReviewer.getConfig().name,
            }
          : c
      ));

      setBlockStatus(prev => ({ ...prev, reviewStatus: 'pending' }));
      
      // Save comments
      configManager.save(`comments_${selectedFile}`, comments);
    } catch (error) {
      console.error('Review generation failed:', error);
      setBlockStatus(prev => ({ ...prev, reviewStatus: 'error' }));
      setComments(comments.map(c =>
        c.id === commentId ? { ...c, status: 'error' } : c
      ));
    }
  };

  const handleContentGeneration = async (comment: Comment) => {
    if (!selectedWriter || !selectedFile) return;

    setBlockStatus(prev => ({ ...prev, isLoading: true }));

    try {
      const rewrittenContent = await selectedWriter.rewrite(
        { id: 1, title: selectedFile, content: fileContent },
        fileContent,
        comment.comment || ''
      );

      setFileContent(rewrittenContent);
      setBlockStatus(prev => ({
        ...prev,
        isLoading: false,
        reviewStatus: 'completed',
      }));
    } catch (error) {
      setBlockStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        reviewStatus: 'error',
      }));
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
        <Grid.Col span={6}>
          <Paper withBorder p="md">
            {selectedFile ? (
              <>
                <Group justify="apart" mb="md">
                  <Group gap="xs">
                    <Text size="lg" fw={500}>{selectedFile}</Text>
                    <Tooltip label="File information" position="right" multiline w={300}>
                      <ActionIcon variant="subtle" color="gray" size="sm">
                        <IconInfoCircle size="1rem" />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                  {blockStatus.reviewStatus === 'reviewing' && (
                    <Group gap="xs">
                      <Text size="sm" c="dimmed">Review in progress...</Text>
                    </Group>
                  )}
                </Group>
                <MarkdownEditorComponent
                  content={fileContent}
                  onUpdate={(content) => setFileContent(content)}
                  disabled={blockStatus.isLoading}
                />
              </>
            ) : (
              <div>Select a file to edit</div>
            )}
          </Paper>
        </Grid.Col>
        <Grid.Col span={3}>
          <Paper withBorder p="md" style={{ width: COMMENT_WIDTH }}>
            <Text size="sm" fw={500} c="dimmed" mb="md">
              Reviewer Comments
            </Text>

            <Group gap={0} mb="md">
              <VoiceInput />
            </Group>

            <Stack gap="md">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  block={{ id: 1, title: selectedFile || '', content: fileContent }}
                  blockStatus={blockStatus}
                  setContentBlocks={() => {}}
                  onRequestReview={(_, commentId) => handleRequestReview(commentId)}
                  onSimulateContentGeneration={handleContentGeneration}
                  onUpdateComment={(commentId, newComment) => {
                    setComments(comments.map(c =>
                      c.id === commentId ? { ...c, comment: newComment } : c
                    ));
                    configManager.save(`comments_${selectedFile}`, comments);
                  }}
                />
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
