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
  const [isExpanded, setIsExpanded] = useState(false); // Changed to false
  const isSelected = node.path === selectedPath;
  const isDirectory = node.type === 'directory';

  return (
    <div style={{ marginLeft: `${level * 12}px` }}>
      <Group 
        gap={2}
        onClick={() => {
          isDirectory ? setIsExpanded(!isExpanded) : onSelect(node.path);
        }}
        style={{
          padding: '2px 4px',
          cursor: 'pointer',
          backgroundColor: isSelected ? 'var(--mantine-color-blue-1)' : 'transparent',
          borderRadius: 4,
          fontSize: '0.9rem',
          '&:hover': {
            backgroundColor: 'var(--mantine-color-gray-1)'
          }
        }}
      >
        {isDirectory && (
          <IconChevronDown
            size={14}
            style={{
              transform: isExpanded ? 'rotate(-180deg)' : 'none',
              transition: 'transform 150ms ease',
            }}
          />
        )}
        {isDirectory ? <IconFolder size={14} /> : <IconFile size={14} />}
        <span style={{ fontSize: '0.9rem' }}>{node.name}</span>
      </Group>

      {isDirectory && isExpanded && node.children && (
        <div style={{ marginTop: 2 }}>
          {node.children.map((child) => (
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
  if (!tree) return null;
  
  return (
    <div style={{ padding: '4px' }}>
      <TreeNode node={tree} onSelect={onSelect} selectedPath={selectedPath} level={0} />
    </div>
  );
}
