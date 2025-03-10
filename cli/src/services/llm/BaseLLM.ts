import { FileService } from "../fileService.js";
import {
  LLMInterface,
  PromptOptions,
  PromptResponse,
  ProviderConfig,
} from "./types";

export abstract class BaseLLM implements LLMInterface {
  protected config: Record<string, any> = {};
  protected readonly storageKey: string;
  protected readonly fileService: FileService = new FileService();

  constructor(protected readonly providerConfig: ProviderConfig) {
    this.storageKey = `./.config/llm_config/${providerConfig.name.toLowerCase()}.json`;
    this.loadConfig();
  }

  abstract executePrompt(
    prompt: string,
    options?: PromptOptions
  ): Promise<PromptResponse>;

  async executePrompts(
    prompts: string[],
    options?: PromptOptions
  ): Promise<PromptResponse[]> {
    return Promise.all(
      prompts.map((prompt) => this.executePrompt(prompt, options))
    );
  }

  configure(config: Record<string, any>): void {
    this.config = config;
    this.fileService.saveFile({
      path: this.storageKey,
      content: JSON.stringify(config),
    });
  }

  getConfig(): Record<string, any> {
    return this.config;
  }

  isConfigured(): boolean {
    return this.providerConfig.configFields
      .filter((field) => field.required)
      .every((field) => Boolean(this.config[field.name]));
  }

  protected async loadConfig(): Promise<void> {
    const savedConfig = await this.fileService
      .readFile(this.storageKey)
      .then((data) => {
        try {
          this.config = JSON.parse(data);
        } catch (error) {
          console.error("Failed to load config from localStorage:", error);
          this.config = {};
        }
      })
      .catch((error) => {
        console.error("Failed to load config from localStorage:", error);
        this.config = {};
      });
  }
}
