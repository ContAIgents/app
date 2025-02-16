import fs from 'fs/promises';
import path from 'path';

export class FileService {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || process.cwd();
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

  private async buildFileTree(dir: string): Promise<any> {
    console.log(`Building file tree for directory: ${dir}`);
    const entries = await fs.readdir(dir, { withFileTypes: true });
    console.log(`Found ${entries.length} entries in ${dir}`);
    const items = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(this.baseDir, fullPath);
        console.log(`Processing entry: ${entry.name}, type: ${entry.isDirectory() ? 'directory' : 'file'}`);
        
        if (entry.isDirectory()) {
          const children = await this.buildFileTree(fullPath);
          console.log(`Finished processing directory: ${entry.name}, found ${children.length} children`);
          return {
            name: entry.name,
            path: relativePath,
            type: 'directory',
            children
          };
        }
        return {
          name: entry.name,
          path: relativePath,
          type: 'file'
        };
      })
    );
    console.log(`Finished building file tree for ${dir}, returning ${items.length} items`);
    return items;
  }
}
