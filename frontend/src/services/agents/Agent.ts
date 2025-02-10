import { KnowledgeBaseManager } from '../knowledgeBase/KnowledgeBaseManager';
import { LLMFactory } from '../llm/LLMFactory';
import { AgentConfig, AgentRole } from './types';

interface ContentBlock {
  id: number;
  title: string;
  description: string;
  shortDescription: string;
  content: string;
  comments: any[];
}

export class Agent {
  private config: AgentConfig;

  constructor(config: Partial<AgentConfig>) {
    this.config = {
      id: config.id || crypto.randomUUID(),
      name: config.name || 'New Agent',
      role: config.role || 'content_writer',
      systemPrompt:
        config.systemPrompt || this.getDefaultSystemPrompt(config.role || 'content_writer'),
      expertise: config.expertise || [],
      writingStyle: config.writingStyle || 'professional',
      tone: config.tone || 'neutral',
      createdAt: config.createdAt || Date.now(),
      updatedAt: config.updatedAt || Date.now(),
    };
  }

  private getDefaultSystemPrompt(role: AgentRole): string {
    const prompts = {
      content_writer:
        'You are a professional content writer focused on creating engaging and informative content.',
      content_reviewer:
        'You are a detail-oriented content reviewer focused on improving quality and consistency.',
    };
    return prompts[role];
  }

  public getConfig(): AgentConfig {
    return { ...this.config };
  }

  public update(updates: Partial<AgentConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
      updatedAt: Date.now(),
    };
  }

  public async generateStructuredBlocks(
    contentType: string,
    idea: string
  ): Promise<ContentBlock[]> {
    // Load knowledge base from KnowledgeBaseManager
    const knowledgeBaseManager = new KnowledgeBaseManager();
    const defaultDoc = knowledgeBaseManager.getDefaultDocument();
    const knowledgeBase = defaultDoc.content;

    
    const llm = (() => {
      const providers = LLMFactory.getAvailableProviders();
      for (const providerName of providers) {
        try {
          const provider = LLMFactory.getProvider(providerName);
          if (provider.isConfigured()) {
            return provider;
          }
        } catch (error) {
          console.error(`Error checking ${providerName} configuration:`, error);
        }
      }
      throw new Error('No configured LLM provider found');
    })();

    const systemPrompt = `You are an expert content strategist and writer. Your task is to create a detailed content structure.
Format your response as a JSON array of content blocks. Each block must have:
- id (number)
- title (string)
- description (detailed section purpose, 1-2 sentences)
- shortDescription (brief context for AI, helps maintain consistency)
- content (empty string)
- comments (empty array)

Ensure the structure is comprehensive and follows best practices for ${contentType} content.`;

    const writerPersona = `Acting as ${this.config.name}, an expert ${this.config.expertise.join(', ')} 
with a ${this.config.writingStyle} writing style and ${this.config.tone} tone.`;

    const prompt = `${systemPrompt}

${writerPersona}

Content Type: ${contentType}
Main Idea: ${idea}

Knowledge Base:
${knowledgeBase}

Generate a structured outline following the specified JSON format. Ensure each section builds logically on the previous one.`;

    try {
      const response = await llm.executePrompt(prompt, { temperature: 0.7 });
      const blocks = JSON.parse(response.content);

      // Validate the structure
      const isValid = blocks.every(
        (block: any) =>
          typeof block.id === 'number' &&
          typeof block.title === 'string' &&
          typeof block.description === 'string' &&
          typeof block.shortDescription === 'string' &&
          typeof block.content === 'string' &&
          Array.isArray(block.comments)
      );

      if (!isValid) {
        throw new Error('Invalid block structure received from LLM');
      }

      return blocks;
    } catch (error) {
      console.error('Failed to generate blocks:', error);
      throw error;
    }
  }
}
