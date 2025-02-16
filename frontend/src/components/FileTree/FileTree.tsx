import { IconChevronDown, IconFile, IconFolder } from '@tabler/icons-react';
import { Group } from '@mantine/core';
import { FileTreeNode } from '@/types/files';
import { useState } from 'react';

interface FileTreeProps {
  tree?: FileTreeNode;
  onSelect: (path: string) => void;
  selectedPath: string | null;
}

interface TreeNodeProps {
  node: FileTreeNode;
  onSelect: (path: string) => void;
  selectedPath: string | null;
  level: number;
}

function TreeNode({ node, onSelect, selectedPath, level }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = node.path === selectedPath;
  const isDirectory = node.type === 'directory';

  const handleClick = () => {
    if (isDirectory) {
      setIsExpanded(!isExpanded);
    } else {
      onSelect(node.path);
    }
  };

  return (
    <div style={{ marginLeft: `${level * 20}px` }}>
      <Group 
        gap={5}
        onClick={handleClick}
        style={{
          padding: '4px 8px',
          cursor: 'pointer',
          backgroundColor: isSelected ? 'var(--mantine-color-blue-1)' : 'transparent',
          borderRadius: 4,
          '&:hover': {
            backgroundColor: 'var(--mantine-color-gray-1)'
          }
        }}
      >
        {isDirectory && (
          <IconChevronDown
            size={16}
            style={{
              transform: isExpanded ? 'rotate(-180deg)' : 'none',
              transition: 'transform 200ms ease',
            }}
          />
        )}
        {isDirectory ? <IconFolder size={18} /> : <IconFile size={18} />}
        <span>{node.name}</span>
      </Group>

      {isDirectory && isExpanded && node.children && (
        <div>
          {node.children.map((child, index) => (
            <TreeNode
              key={child.path}
              node={child}
              onSelect={onSelect}
              selectedPath={selectedPath}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ tree, onSelect, selectedPath }: FileTreeProps) {
  if (!tree) {
    return null;
  }

  return (
    <div style={{ padding: '8px' }}>
      <TreeNode
        node={tree}
        onSelect={onSelect}
        selectedPath={selectedPath}
        level={0}
      />
    </div>
  );
}
