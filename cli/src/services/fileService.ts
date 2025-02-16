import fs from 'fs/promises';
import path from 'path';

export class FileService {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || process.cwd();
  }

  async saveFile({ path: filePath, content }: { path: string; content: string }): Promise<void> {
    try {
      const fullPath = path.join(this.baseDir, filePath);
      const dirPath = path.dirname(fullPath);
      
      // Ensure directory exists
      await fs.mkdir(dirPath, { recursive: true });
      
      // Write file
      await fs.writeFile(fullPath, content, 'utf-8');
    } catch (error) {
      console.error('Error saving file:', error);
      throw new Error(`Failed to save file: ${filePath}`);
    }
  }

  async readFile(filePath: string): Promise<string> {
    try {
      const fullPath = path.join(this.baseDir, filePath);
      console.log('Reading file:', fullPath);
      const content = await fs.readFile(fullPath, 'utf-8');
      return content;
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error(`Failed to read file: ${filePath}`);
    }
  }

  async getFileTree(): Promise<any> {
    try {
      const tree = await this.buildFileTree(this.baseDir);
      return tree;
    } catch (error) {
      console.error('Error getting file tree:', error);
      throw error;
    }
  }

  private async buildFileTree(
    dir: string, 
    skipDirs: string[] = ['node_modules', 'dist', 'bin']
  ): Promise<any> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const items = await Promise.all(
      entries
        .filter(entry => {
          // Skip hidden files/directories and specified directories
          if (entry.name.startsWith('.')) return false;
          if (entry.isDirectory() && skipDirs.includes(entry.name)) return false;
          return true;
        })
        .map(async (entry) => {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.relative(this.baseDir, fullPath);
          
          if (entry.isDirectory()) {
            const children = await this.buildFileTree(fullPath, skipDirs);
            return {
              name: entry.name,
              path: relativePath,
              type: 'directory',
              children
            };
          }
          if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
            return {
              name: entry.name,
              path: relativePath,
              type: 'file'
            };
          }
          return null;
        })
    );
    return items.filter(item => item !== null);
  }
}
