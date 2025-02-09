import React, { useEffect, useState } from 'react';
import { Container, Group, Paper, Stack, Avatar, Text, Box } from '@mantine/core';
import RichTextEditorComponent from '../components/Editor';
import { TableOfContents } from '@/components/TableOfContents';
import { ConfigManager } from '../services/config/ConfigManager';
import { IContentBlock } from '@/AppContext';

const COMMENT_WIDTH = 280; // Fixed width for comments section

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

  // Helper function to get avatar color based on user role
  const getAvatarColor = (user: string) => {
    switch (user) {
      case 'AI Assistant':
        return 'blue';
      case 'Editor':
        return 'green';
      case 'Technical Reviewer':
        return 'orange';
      default:
        return 'gray';
    }
  };

  // Helper function to get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Container size="xl" py="xl" style={{ height: 'calc(100vh - 80px)' }}>
      <Stack h="100%" gap="md" style={{ flexDirection: 'row' }}>
        {/* Table of Contents */}
        <Paper p="md" style={{ width: '200px', flexShrink: 0 }}>
          <TableOfContents links={tocLinks} />
        </Paper>

        {/* Main Content Area */}
        <Stack h="100%" gap="md" style={{ flex: 1 }}>
          {contentBlocks.map((block) => (
            <Group key={block.id} id={`section-${block.id}`} align="flex-start" noWrap>
              {/* Editor Section */}
              <Paper 
                p="md" 
                style={{ 
                  flex: 1,
                  minHeight: '300px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Text size="lg" fw={500} mb="md">{block.title}</Text>
                <Box style={{ flex: 1 }}>
                  <RichTextEditorComponent
                    content={block.content}
                    onUpdate={(content) => handleUpdate(block.id, content)}
                  />
                </Box>
              </Paper>

              {/* Comments Section */}
              <Paper 
                p="md" 
                style={{ 
                  width: COMMENT_WIDTH,
                  flexShrink: 0,
                  alignSelf: 'stretch'
                }}
              >
                <Text size="sm" fw={500} c="dimmed" mb="md">Comments</Text>
                <Stack gap="md">
                  {block?.comments?.map(({user, comment, id, timestamp}) => (
                    <Paper 
                      key={id} 
                      p="md" 
                      withBorder
                      shadow="sm"
                      radius="md"
                    >
                      <Group gap="sm" mb="xs">
                        <Avatar 
                          color={getAvatarColor(user)} 
                          radius="xl"
                          size="sm"
                        >
                          {getInitials(user)}
                        </Avatar>
                        <Box style={{ flex: 1 }}>
                          <Text size="sm" fw={500}>{user}</Text>
                          <Text size="xs" c="dimmed">
                            {new Date(timestamp).toLocaleDateString()}
                          </Text>
                        </Box>
                      </Group>
                      <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                        {comment}
                      </Text>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            </Group>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
};
``;
