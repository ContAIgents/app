import { Box, Button, Paper, Text } from '@mantine/core';
import { IconBook } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { TableOfContents } from './TableOfContents';

interface TableOfContentsSidebarProps {
  links: { label: string; link: string; order: number }[];
  width: number;
}

export function TableOfContentsSidebar({ links, width }: TableOfContentsSidebarProps) {
  return (
    <Paper
      shadow="xs"
      style={{
        width,
        height: '100vh',
        borderRight: '1px solid var(--mantine-color-default-border)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* TOC Header */}
      <Box
        p="md"
        style={{
          borderBottom: '1px solid var(--mantine-color-default-border)',
          backgroundColor: 'var(--mantine-color-body)',
        }}
      >
        <Text size="sm" fw={700}>
          Table of Contents
        </Text>
      </Box>

      {/* Scrollable TOC Content */}
      <Box
        p="md"
        style={{
          flex: 1,
          overflowY: 'auto',
        }}
      >
        <TableOfContents links={links} />
      </Box>

      {/* Knowledge Base Section */}
      <Box
        style={{
          borderTop: '1px solid var(--mantine-color-default-border)',
          backgroundColor: 'var(--mantine-color-body)',
        }}
      >
        <Box>
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
      </Box>
    </Paper>
  );
}