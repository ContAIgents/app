import { ContentBlock } from '@/types/content';
import { ConfigManager } from './config/ConfigManager';
import { KnowledgeBaseManager } from './knowledgeBase/KnowledgeBaseManager';
import { LLMFactory } from './llm/LLMFactory';

export interface ExportAgentConfig {
  id?: string;
  name?: string;
  maxWords?: number;
}

export class ExportAgent {
  public config: ExportAgentConfig;

  constructor(config: ExportAgentConfig) {
    this.config = {
      id: config.id || crypto.randomUUID(),
      name: config.name || 'New Final Agent',
      maxWords: config.maxWords || 500,
    };
  }

  public async generateFinalContent(): Promise<string> {
    const configManager = new ConfigManager('editor_');
    const knowledgeBaseManager = new KnowledgeBaseManager();

    // Get context from ConfigManager
    const contentType = configManager.load<string>('contentType');
    const idea = configManager.load<string>('idea');
    const contentBlocks = configManager.load<ContentBlock[]>('contentBlocks') || [];

    // Get knowledge base
    const defaultDoc = knowledgeBaseManager.getDefaultDocument();
    const knowledgeBase = defaultDoc.content;

    const llm = LLMFactory.getDefaultProvider();
    if (!llm) {
      throw new Error('No provider configured');
    }
    
    const prompt = `You are a concise content creator. Given a few different sections of content, generate a final, cohesive piece of content that combines the main ideas from each section. The final content should be well-structured and easy to read.

CONTEXT
Content Type: ${contentType}
Main Idea: ${idea}

KNOWLEDGE BASE CONTEXT 
${knowledgeBase}

DOCUMENT STRUCTURE TO COMBINE
${contentBlocks
  .map(
    (b) => `
  ${b.id}. ${b.title}
  ${b.content}
  `
  )
  .join('\n')}

Don't forget to include the main ideas from each section and make sure the final content is well-structured and easy to read.
Titles are not required, unless you think they are necessary.
Avoid making excessive changes as they have already been reviewed multiple times; just ensure everything fits well and maintains the flow and connections.
Ensure the final content is well structured, easy to read and understand. 
Remember, you are creating a ${contentType} based on the main idea: ${idea}. Don't add any additional introducing or concluding message in your response
`;

    try {
      const response = await llm.executePrompt(prompt, {
        temperature: 0.7,
        maxTokens: this.config.maxWords,
      });

      return response.content;
    } catch (error) {
      console.error('Failed to generate final content:', error);
      throw error;
    }
  }
}
