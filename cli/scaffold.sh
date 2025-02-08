#!/bin/bash

# create-ai-content-ecosystem.sh

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Creating AI Content Ecosystem project...${NC}"

# Create project directory
PROJECT_NAME="ai-content-ecosystem"
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# Create project structure
mkdir -p src/{types,services,routes} bin

# Initialize npm project
echo -e "${BLUE}Initializing npm project...${NC}"
npm init -y

# Update package.json
cat > package.json << EOF
{
  "name": "ai-content-ecosystem",
  "version": "1.0.0",
  "description": "Modular AI Content Ecosystem",
  "main": "dist/index.js",
  "bin": {
    "ai-content": "./bin/cli.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
EOF

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install express cors dotenv commander
npm install --save-dev typescript ts-node @types/express @types/node @types/cors

# Create tsconfig.json
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "es2018",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOF

# Create source files
# types/index.ts
cat > src/types/index.ts << EOF
export interface FileContent {
  content: string;
  path: string;
}

export interface LLMConfig {
  provider: string;
  apiKey: string;
  model: string;
}

export interface Worker {
  id: string;
  name: string;
  description: string;
  config: any;
}
EOF

# services/fileService.ts
cat > src/services/fileService.ts << EOF
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
EOF

# server.ts
cat > src/server.ts << EOF
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
      console.log(\`Server running at http://localhost:\${this.port}\`);
    });
  }
}
EOF

# routes/api.ts
cat > src/routes/api.ts << EOF
import { Router } from 'express';
import { FileService } from '../services/fileService';

const router = Router();
const fileService = new FileService();

router.post('/files', async (req, res) => {
  try {
    const { path, content } = req.body;
    await fileService.saveFile({ path, content });
    res.status(200).json({ message: 'File saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save file' });
  }
});

router.get('/files/:path', async (req, res) => {
  try {
    const content = await fileService.readFile(req.params.path);
    res.status(200).json({ content });
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

export default router;
EOF

# index.ts
cat > src/index.ts << EOF
import { Server } from './server';

const server = new Server();
server.start();
EOF

# Create CLI file
cat > bin/cli.js << EOF
#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');

program
  .version('1.0.0')
  .description('AI Content Ecosystem CLI')
  .action(() => {
    require(path.join(__dirname, '../dist/index.js'));
  });

program.parse(process.argv);
EOF

# Make CLI file executable
chmod +x bin/cli.js

# Create .gitignore
cat > .gitignore << EOF
node_modules/
dist/
.env
.DS_Store
EOF

# Initialize git repository
git init

# Build the project
echo -e "${BLUE}Building the project...${NC}"
npm run build

# Create symbolic link
echo -e "${BLUE}Creating symbolic link...${NC}"
npm link

echo -e "${GREEN}Project setup complete!${NC}"
echo -e "${GREEN}You can now run the CLI using: ai-content${NC}"
echo -e "${BLUE}To start development:${NC}"
echo -e "1. cd $PROJECT_NAME"
echo -e "2. npm run dev"