import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { FileService } from './services/fileService.js';
import fileRoutes from './routes/fileRoutes.js';
import llmRoutes from './routes/llm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Server {
  private app = express();
  private port = 2668;
  private fileService = new FileService();

  constructor() {
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../public')));
  }

  private setupRoutes(): void {
    // Mount the file routes under /api
    this.app.use('/api', fileRoutes);
    this.app.use('/api', llmRoutes);

    // Serve index.html for all other routes (SPA fallback)
    this.app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server running at http://localhost:${this.port}`);
    });
  }
}
