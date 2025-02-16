export interface FileInfo {
  path: string;
  name: string;
  type: string;
  relativePath: string;
}

export interface FileTree {
  name: string;
  path: string;
  type: 'directory' | 'file';
  children?: FileTree[];
}