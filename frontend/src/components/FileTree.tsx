import { Group, Text, UnstyledButton } from '@mantine/core';
import { IconFile, IconFolder } from '@tabler/icons-react';
import { FileTree as FileTreeType, FileTreeNode } from '@/types/files';

interface FileTreeProps {
  tree: FileTreeType;
  onSelect: (path: string) => void;
  selectedPath: string | null;
}

export function FileTree({ tree, onSelect, selectedPath }: FileTreeProps) {
  const renderNode = (node: FileTreeNode, level = 0) => {
    const isSelected = node.path === selectedPath;
    const icon = node.type === 'directory' ? <IconFolder size="1.1rem" /> : <IconFile size="1.1rem" />;

    return (
      <div key={node.path}>
        <UnstyledButton
          onClick={() => node.type === 'file' && onSelect(node.path)}
          sx={(theme) => ({
            display: 'block',
            width: '100%',
            padding: theme.spacing.xs,
            borderRadius: theme.radius.sm,
            color: isSelected ? theme.colors.blue[7] : theme.colors.gray[7],
            backgroundColor: isSelected ? theme.colors.blue[0] : 'transparent',
            '&:hover': {
              backgroundColor: theme.colors.gray[0],
            },
          })}
        >
          <Group spacing="sm" style={{ marginLeft: level * 20 }}>
            {icon}
            <Text size="sm">{node.name}</Text>
          </Group>
        </UnstyledButton>
        {node.children?.map((child) => renderNode(child, level + 1))}
      </div>
    );
  };

  return <div>{tree.map((node) => renderNode(node))}</div>;
}