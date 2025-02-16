import fs from 'fs/promises';
import path from 'path';

export interface FileInfo {
  name: string;
  path: string;
  lastModified: Date;
}

export class FileService {
  private contentDir = 'content';

  constructor() {
    // Ensure content directory exists
    fs.mkdir(this.contentDir, { recursive: true }).catch(console.error);
  }

  async listFiles(): Promise<FileInfo[]> {
    try {
      const files = await fs.readdir(this.contentDir);
      const fileInfos = await Promise.all(
        files
          .filter(file => file.endsWith('.md'))
          .map(async (file) => {
            const filePath = path.join(this.contentDir, file);
            const stats = await fs.stat(filePath);
            return {
              name: file,
              path: filePath,
              lastModified: stats.mtime
            };
          })
      );
      return fileInfos;
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  async readFile(filePath: string): Promise<string> {
    const fullPath = path.join(this.contentDir, filePath);
    return fs.readFile(fullPath, 'utf-8');
  }

  async saveFile(params: { path: string; content: string }): Promise<void> {
    const fullPath = path.join(this.contentDir, params.path);
    await fs.writeFile(fullPath, params.content, 'utf-8');
  }
}
