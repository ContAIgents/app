import express from 'express';
import cors from 'cors';
import { FileService } from './services/fileService.js';
import fileRoutes from './routes/fileRoutes.js';

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
    // Mount the file routes under /api
    this.app.use('/api', fileRoutes);

    // Fallback route for the frontend
    this.app.get('*', (_req, res) => {
      res.redirect('http://localhost:5173');
    });
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server running at http://localhost:${this.port}`);
    });
  }
}
