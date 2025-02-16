import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Grid, Paper, Group, Stack, Text, ActionIcon, Tooltip, Box, Loader, Button } from '@mantine/core';
import { IconInfoCircle, IconBook, IconWand, IconArrowRight } from '@tabler/icons-react';
import debounce from 'lodash/debounce';
import { notifications } from '@mantine/notifications';
import { FileTree } from '@/components/FileTree/FileTree';
import MarkdownEditorComponent from '@/components/MarkdownEditor';
import { FileTreeNode, FileTreeType } from '@/types/files';
import { Agent } from '@/services/agents/Agent';
import { ConfigManager } from '@/services/config/ConfigManager';
import { CommentCard } from '@/components/CommentCard/CommentCard';
import { VoiceInput } from '@/components/VoiceInput/VoiceInput';
import { getReviewInstructionsFromUser } from '@/components/ReviewInstructionsModal/ReviewInstructionsModal';
import { Comment } from '@/types/content';
import { IBlockStatus } from '@/types/editor';

const COMMENT_WIDTH = 280;
const FILE_TREE_WIDTH = 300; // Increased from 200 to 280

export function FileEditorPage() {
  const navigate = useNavigate();
  const [fileTree, setFileTree] = useState<FileTreeNode | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [blockStatus, setBlockStatus] = useState<IBlockStatus>({
    isLoading: false,
    error: null,
    reviewStatus: 'pending',
    isInitialReview: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const configManager = new ConfigManager('file_editor_');
  const [selectedWriter, setSelectedWriter] = useState<Agent | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<Agent | null>(null);

  // Create debounced save function
  const saveContent = useCallback(
    debounce(async (path: string, content: string) => {
      if (!path) return;

      setIsSaving(true);
      try {
        const response = await fetch(`http://localhost:3000/api/files/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path, content }),
        });

        if (!response.ok) {
          throw new Error('Failed to save file');
        }

        notifications.show({
          title: 'Saved',
          message: 'File saved successfully',
          color: 'green',
        });
      } catch (error) {
        console.error('Error saving file:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to save file',
          color: 'red',
        });
      } finally {
        setIsSaving(false);
      }
    }, 1000), // 1 second debounce
    []
  );

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
        setFileTree({
          name: 'root',
          path: '/',
          type: 'directory' as const,
          children: data
        } as FileTreeNode);
      })
      .catch(console.error);
  }, []);

  const initiateAutoReview = async (path: string, content: string) => {
    if (!selectedReviewer) return;

    try {
      const newCommentId = Date.now();
      setBlockStatus(prev => ({ ...prev, reviewStatus: 'reviewing' }));

      // Add initial loading comment
      setComments([{
        id: newCommentId,
        timestamp: new Date().toISOString(),
        user: selectedReviewer.getConfig().name,
        comment: 'Initiating first review...',
        status: 'loading'
      }]);

      // Generate initial review
      const reviewResponse = await selectedReviewer.generateReview(
        {
          id: 1, title: path, content,
          comments: [],
          description: ''
        },
        'Please review this file and provide feedback.'
      );

      setComments([{
        id: newCommentId,
        timestamp: new Date().toISOString(),
        user: selectedReviewer.getConfig().name,
        comment: reviewResponse,
        status: 'success'
      }]);

      setBlockStatus(prev => ({ ...prev, reviewStatus: 'pending' }));
      
      // Save comments
      configManager.save(`comments_${path}`, comments);
    } catch (error) {
      console.error('Auto-review failed:', error);
      setBlockStatus(prev => ({ ...prev, reviewStatus: 'error' }));
    }
  };

  const handleFileSelect = async (path: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/files/${path}`);
      const data = await response.json();
      setSelectedFile(path);
      setFileContent(data.content);
      
      // Load existing comments for this file
      const savedComments = configManager.load<Comment[]>(`comments_${path}`) || [];
      setComments(savedComments);

      // If no comments exist, initiate auto-review
      if (savedComments.length === 0) {
        initiateAutoReview(path, data.content);
      }
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
        {
          id: 1, title: selectedFile, content: fileContent,
          comments: [],
          description: ''
        },
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
        {
          id: 1, title: selectedFile, content: fileContent,
          comments: [],
          description: ''
        },
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

  const handleContentChange = (newContent: string) => {
    setFileContent(newContent);
    if (selectedFile) {
      saveContent(selectedFile, newContent);
    }
  };

  useEffect(() => {
    return () => {
      saveContent.cancel();
    };
  }, [saveContent]);

  return (
    <>
      <div
        style={{
          height: '100vh',
          display: 'flex',
          overflow: 'hidden',
          backgroundColor: 'var(--mantine-color-body)',
        }}
      >
        <Group
          style={{
            position: 'fixed',
            top: '1rem',
            right: '2rem',
            zIndex: 1000,
            gap: '8px',
          }}
        >
          {isSaving && (
            <Text size="sm" c="dimmed">
              Saving...
            </Text>
          )}
          <Tooltip
            label="Export this file"
            position="bottom"
            multiline
            w={220}
          >
            <Button
              onClick={() => navigate('/export')}
              size="md"
              variant="gradient"
              gradient={{ from: 'indigo', to: 'cyan' }}
              leftSection={<IconWand size="1rem" />}
              rightSection={<IconArrowRight size="1rem" />}
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              Export File
            </Button>
          </Tooltip>
        </Group>

        {/* File Tree Sidebar */}
        <Paper
          shadow="xs"
          style={{
            width: FILE_TREE_WIDTH,
            height: '100vh',
            borderRight: '1px solid var(--mantine-color-default-border)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            p="md"
            style={{
              borderBottom: '1px solid var(--mantine-color-default-border)',
              backgroundColor: 'var(--mantine-color-body)',
            }}
          >
            <Text size="sm" fw={700}>Files</Text>
          </Box>

          <Box style={{ flex: 1, overflowY: 'auto' }}>
            <FileTree 
              tree={fileTree} 
              onSelect={handleFileSelect}
              selectedPath={selectedFile}
            />
          </Box>

          <Box
            style={{
              borderTop: '1px solid var(--mantine-color-default-border)',
              backgroundColor: 'var(--mantine-color-body)',
            }}
          >
            <Button 
              component={Link} 
              to="/knowledgeBase" 
              variant="light" 
              size="sm" 
              fullWidth 
              leftSection={<IconBook size="1rem" />}
            >
              Knowledge Base
            </Button>
          </Box>
        </Paper>

        {/* Main content area */}
        <div
          role="main"
          style={{
            flex: 1,
            height: '100vh',
            overflowY: 'auto',
            padding: 'var(--mantine-spacing-xl)',
            backgroundColor: 'var(--mantine-color-body)',
          }}
        >
          <Container size="xl">
            <Group align="flex-start" style={{ scrollMarginTop: '2rem' }}>
              {/* Editor Section */}
              <Paper
                p="md"
                withBorder={false}
                style={{
                  flex: 1,
                  minHeight: '300px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Group justify="apart" mb="md">
                  <Group gap="xs">
                    <Text size="lg" fw={500}>{selectedFile}</Text>
                    <Tooltip
                      label="File information"
                      position="right"
                      multiline
                      w={300}
                      withArrow
                    >
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        aria-label="File information"
                      >
                        <IconInfoCircle size="1rem" />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                  {blockStatus.reviewStatus === 'reviewing' && (
                    <Group gap="xs">
                      <Loader size="xs" />
                      <Text size="sm" c="dimmed">Review in progress...</Text>
                    </Group>
                  )}
                </Group>

                <Box style={{ flex: 1, position: 'relative' }}>
                  {selectedFile ? (
                    <MarkdownEditorComponent
                      content={fileContent}
                      onUpdate={handleContentChange}
                      disabled={!selectedFile}
                    />
                  ) : (
                    <Text c="dimmed">Select a file to edit</Text>
                  )}
                </Box>

                {blockStatus.error && (
                  <Text c="red" size="sm" mt="xs">{blockStatus.error}</Text>
                )}
              </Paper>

              {/* Comments Section */}
              <Paper
                p="md"
                withBorder={false}
                style={{
                  width: COMMENT_WIDTH,
                  flexShrink: 0,
                  alignSelf: 'stretch',
                }}
              >
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
            </Group>
          </Container>
        </div>
      </div>
    </>
  );
}
