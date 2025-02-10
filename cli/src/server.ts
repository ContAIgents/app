import express from "express";
import cors from "cors";
import { FileService } from "./services/fileService";
import apiRoutes from "./routes/api";

export class Server {
  private app: express.Application;
  private port: number;
  public fileService: FileService;

  constructor(port: number = Number(process.env.PORT) || 3000) {
    this.app = express();
    this.port = port;
    this.fileService = new FileService();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    this.app.use("/api", apiRoutes);
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use(
      (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error(err.stack);
        res.status(500).json({ error: "Something went wrong!" });
      }
    );
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server running at http://localhost:${this.port}`);
    });
  }
}
