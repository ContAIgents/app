import { ConfigManager } from '../config/ConfigManager';

export interface KnowledgeBaseDocument {
  id: string;
  content: string;
  updatedAt: number;
}

export class KnowledgeBaseManager {
  private configManager: ConfigManager;

  constructor() {
    this.configManager = new ConfigManager('knowledge_base_');
  }
  public async getRelevantData({
    context,
    targetAudience,
  }: {
    context?: string;
    targetAudience?: string;
  }): Promise<string> {
    const doc = this.getDefaultDocument();
    return doc.content;
  }

  public getDefaultDocument(): KnowledgeBaseDocument {
    const doc = this.configManager.load<KnowledgeBaseDocument>('default');
    if (!doc) {
      return {
        id: 'default',
        content: 'Welcome to the Knowledge Base',
        updatedAt: Date.now(),
      };
    }
    return doc;
  }

  public saveDefaultDocument(content: string): void {
    const doc: KnowledgeBaseDocument = {
      id: 'default',
      content,
      updatedAt: Date.now(),
    };
    this.configManager.save('default', doc);
  }
}
