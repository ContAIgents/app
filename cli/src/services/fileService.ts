import fs from 'fs';
import path from 'path';
import { FileContent } from '../types';

export class FileService {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.env.HOME || process.env.USERPROFILE || '', '.ai-content');
    this.ensureBaseDir();
  }

  private ensureBaseDir(): void {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async saveFile({ path: filePath, content }: FileContent): Promise<void> {
    const fullPath = path.join(this.baseDir, filePath);
    const dirPath = path.dirname(fullPath);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    await fs.promises.writeFile(fullPath, content);
  }

  async readFile(filePath: string): Promise<string> {
    const fullPath = path.join(this.baseDir, filePath);
    return fs.promises.readFile(fullPath, 'utf-8');
  }

  async fileExists(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.baseDir, filePath);
    return fs.existsSync(fullPath);
  }
}
