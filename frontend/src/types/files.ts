export interface FileInfo {
  path: string;
  name: string;
  type: string;
  relativePath: string;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
}

export type FileTree = FileTreeNode[];
