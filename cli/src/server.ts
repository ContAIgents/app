import express from 'express';
import cors from 'cors';
import { FileService } from './services/fileService.js';

export class Server {
  private app = express();
  private port = 3000;
  private fileService = new FileService();

  constructor() {
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    this.app.post('/api/files', async (req, res) => {
      try {
        const { path, content } = req.body;
        await this.fileService.saveFile({ path, content });
        res.status(200).json({ message: 'File saved successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to save file' });
      }
    });

    this.app.get('/api/files/:path', async (req, res) => {
      try {
        const content = await this.fileService.readFile(req.params.path);
        res.status(200).json({ content });
      } catch (error) {
        res.status(404).json({ error: 'File not found' });
      }
    });

    this.app.get('/api/files', async (_req, res) => {
      try {
        const files = await this.fileService.listFiles();
        res.status(200).json({ files });
      } catch (error) {
        res.status(500).json({ error: 'Failed to list files' });
      }
    });
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server running at http://localhost:${this.port}`);
    });
  }
}
