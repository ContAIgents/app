import { FileService } from "./fileService";
import { LLMFactory } from "./llm/LLMFactory";

export interface AgentConfig {
  llm: string;
}

export class AgentService {
  private fileService: FileService;
  private configPath: string = "reviewer-config.json";

  constructor() {
    this.fileService = new FileService();
  }

  async loadConfig(): Promise<AgentConfig> {
    try {
      const configStr = await this.fileService.readFile(this.configPath);
      return JSON.parse(configStr);
    } catch (error) {
      throw new Error("Failed to load LLM configuration");
    }
  }

  async generateResponse(prompt: string): Promise<string> {
    const config = await this.loadConfig();
    console.log("Loaded config: ", config);
    const llm = LLMFactory.getProvider(config.llm);
    if (!llm) {
      throw new Error("No provider configured");
    }
    const response = await llm.executePrompt(prompt);
    console.log("Response: ", response);

    return response.content;
  }
}
