import express from 'express';
import cors from 'cors';
import { FileService } from './services/fileService';
import apiRoutes from './routes/api';

export class Server {
  private app: express.Application;
  private port: number;
  public fileService: FileService;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.fileService = new FileService();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    this.app.use('/api', apiRoutes);
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server running at http://localhost:${this.port}`);
    });
  }
}
