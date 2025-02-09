import React, { useEffect, useState } from 'react';
import { Container, Group, Paper, Stack, Avatar, Text, Box } from '@mantine/core';
import RichTextEditorComponent from '../components/Editor';
import { TableOfContents } from '@/components/TableOfContents';
import { ConfigManager } from '../services/config/ConfigManager';
import { IContentBlock } from '@/AppContext';

const COMMENT_WIDTH = 280; // Fixed width for comments section
const TOC_WIDTH = 200; // Fixed width for table of contents

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
    <div style={{ 
      height: '100vh', 
      display: 'flex',
      overflow: 'hidden' // Prevent body scroll
    }}>
      {/* Fixed TOC sidebar */}
      <Paper 
        style={{ 
          width: TOC_WIDTH,
          height: '100vh',
          borderRight: '1px solid var(--mantine-color-gray-3)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* TOC Header */}
        <Box p="md" style={{ 
          borderBottom: '1px solid var(--mantine-color-gray-3)',
          backgroundColor: 'var(--mantine-color-body)'
        }}>
          <Text size="sm" fw={700}>Table of Contents</Text>
        </Box>
        
        {/* Scrollable TOC Content */}
        <Box p="md" style={{ 
          flex: 1,
          overflowY: 'auto'
        }}>
          <TableOfContents links={tocLinks} />
        </Box>
      </Paper>

      {/* Main content area with independent scroll */}
      <div 
        role="main"
        style={{ 
          flex: 1,
          height: '100vh',
          overflowY: 'auto',
          padding: 'var(--mantine-spacing-xl)'
        }}
      >
        <Container size="xl">
          <Stack gap="md">
            {contentBlocks.map((block) => (
              <Group 
                key={block.id} 
                id={`section-${block.id}`} 
                align="flex-start" 
                noWrap
                style={{ scrollMarginTop: '2rem' }}
              >
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
        </Container>
      </div>
    </div>
  );
};
``;
