import { IconChevronDown, IconFile, IconFolder } from '@tabler/icons-react';
import { Group, Tree } from '@mantine/core';
import { FileTree as FileTreeType } from '@/types/files';

interface FileTreeProps {
  tree: FileTreeType;
  onSelect: (path: string) => void;
  selectedPath: string | null;
}

export function FileTree({ tree, onSelect, selectedPath }: FileTreeProps) {
  const transformToTreeItems = (node: FileTreeType): {
    value: string;
    label: string;
    children?: Array<{
      value: string;
      label: string;
      children?: Array<any>;
    }>;
  } => ({
    value: node.path,
    label: node.name,
    children: node.children?.map(transformToTreeItems),
  });

  return (
    <Tree
      data={[transformToTreeItems(tree)]}
      onNodeClick={(value) => onSelect(value)}
      selectedValue={selectedPath}
      defaultOpenedValues={[tree.path]}
      levelOffset={23}
      renderNode={({ node, expanded, hasChildren, elementProps }) => (
        <Group gap={5} {...elementProps}>
          {hasChildren ? (
            <>
              <IconChevronDown
                size={16}
                style={{
                  transform: expanded ? 'rotate(-180deg)' : 'none',
                  transition: 'transform 200ms ease',
                }}
              />
              <IconFolder size={18} />
            </>
          ) : (
            <IconFile size={18} />
          )}
          <span>{node.label}</span>
        </Group>
      )}
    />
  );
}
