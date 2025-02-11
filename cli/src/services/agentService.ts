import { AgentConfig } from "../types";
import { FileService } from "./fileService";
import { LLMFactory } from "./llm/LLMFactory";

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

  async generateResponse(agent_name: string, prompt: string): Promise<string> {
    const config = await this.loadConfig();
    console.log("Loaded config: ", config);
    const llm = LLMFactory.getProvider(config.llm);
    if (!llm) {
      throw new Error("No provider configured");
    }
    let agentConfig;
    try {
      const agentConfigStr = await this.fileService.readFile(
        `${agent_name}-config.json`
      );
      agentConfig = JSON.parse(agentConfigStr);
      console.log("Agent config: ", agentConfig);
      if (!agentConfig) {
        throw new Error("Invalid agent configuration");
      }
    } catch (error) {
      throw new Error("Failed to load agent configuration");
    }

    const response = await llm.executePrompt(prompt, agentConfig.systemPrompt);
    console.log("Response: ", response);

    return response.content;
  }
}
