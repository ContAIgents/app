import { ConfigManager } from '@/services/config/ConfigManager';
import { ContentBlock } from '@/types/content';
import { KnowledgeBaseManager } from '../knowledgeBase/KnowledgeBaseManager';
import { LLMFactory } from '../llm/LLMFactory';
import { AgentConfig, AgentRole } from './types';

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
IMPORTANT: Respond ONLY with a valid JSON array, no additional text or markdown formatting.
The response must be a raw JSON array of content blocks. Each block must have:
- id (number)
- title (string)
- description (detailed section purpose, 1-2 sentences)
- shortDescription (brief context for AI, helps maintain consistency)
- content (empty string)
- comments (empty array)

Ensure the structure is comprehensive and follows best practices for ${contentType} content.`;

    const writerPersona = `Acting as ${this.config.name}, an expert ${(this.config.expertise ?? []).join(', ')}
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
      // console.log('response: ', response);
      const blocks = JSON.parse(response.content);
      // console.log('blocks: ', blocks);

      // Validate the structure
      const isValid = blocks.every(
        (block: ContentBlock) =>
          typeof block.id === 'number' &&
          typeof block.title === 'string' &&
          typeof block.shortDescription === 'string' &&
          typeof block.content === 'string'
      );

      if (!isValid) {
        console.error(
          'Invalid block structure:',
          blocks.find(
            (block: ContentBlock) =>
              typeof block.id !== 'number' ||
              typeof block.title !== 'string' ||
              typeof block.shortDescription !== 'string' ||
              typeof block.content !== 'string'
          )
        );
        throw new Error('Invalid block structure received from LLM');
      }

      return blocks;
    } catch (error) {
      console.error('Failed to generate blocks:', error);
      throw error;
    }
  }

  public async expand(block: ContentBlock): Promise<string> {
    const configManager = new ConfigManager('editor_');
    const knowledgeBaseManager = new KnowledgeBaseManager();

    // Get context from ConfigManager
    const contentType = configManager.load<string>('contentType');
    const idea = configManager.load<string>('idea');
    const contentBlocks = configManager.load<ContentBlock[]>('contentBlocks') || [];

    // Get knowledge base
    const defaultDoc = knowledgeBaseManager.getDefaultDocument();
    const knowledgeBase = defaultDoc.content;

    const llm = LLMFactory.getConfiguredProvider();

    const systemPrompt = `You are an expert content writer. Your task is to expand a specific section of content.
You will be provided with the overall context and the specific section to work on.
Generate detailed, well-structured content that maintains consistency with the overall document flow.

Writing Guidelines:
- Write in a ${this.config.writingStyle} style
- Maintain a ${this.config.tone} tone
- Focus on accuracy and clarity
- Include relevant examples and explanations
- Ensure the content flows naturally from previous sections
- Stay within the scope of the section's description`;

    const writerPersona = `Acting as ${this.config.name}, an expert ${(this.config.expertise ?? []).join(', ')}
with a ${this.config.writingStyle} writing style and ${this.config.tone} tone.

${this.config.systemPrompt}`;

    // Get the position of the current block in the outline
    const blockIndex = contentBlocks.findIndex((b) => b.id === block.id);
    const previousBlock = blockIndex > 0 ? contentBlocks[blockIndex - 1] : null;
    const nextBlock = blockIndex < contentBlocks.length - 1 ? contentBlocks[blockIndex + 1] : null;

    const prompt = `${systemPrompt}

${writerPersona}

CONTEXT
Content Type: ${contentType}
Main Idea: ${idea}

DOCUMENT STRUCTURE
${contentBlocks.map((b) => `- ${b.title}: ${b.shortDescription}`).join('\n')}

CURRENT SECTION
Title: ${block.title}
Description: ${block.shortDescription}

${previousBlock ? `Previous Section: ${previousBlock.title}` : 'This is the first section'}
${nextBlock ? `Next Section: ${nextBlock.title}` : 'This is the final section'}

KNOWLEDGE BASE CONTEXT
${knowledgeBase}

TASK
Generate comprehensive content for this section that:
1. Aligns with the section's purpose and description
2. Maintains consistency with the overall document flow
3. Incorporates relevant information from the knowledge base
4. Uses appropriate formatting (headers, lists, paragraphs)
5. Provides specific examples and explanations where needed

Generate the content now:`;

    try {
      // console.log("generating content for block:",prompt);
      // return prompt;
      const response = await llm.executePrompt(prompt, {
        temperature: 0.7,
        maxTokens: 2000, // Adjust based on your needs
      });

      return response.content;
    } catch (error) {
      console.error('Failed to expand content:', error);
      throw error;
    }
  }

  public async rewrite(
    block: ContentBlock,
    currentValue: string,
    reviewerSuggestion: string
  ): Promise<string> {
    const configManager = new ConfigManager('editor_');
    const knowledgeBaseManager = new KnowledgeBaseManager();

    // Get context from ConfigManager
    const contentType = configManager.load<string>('contentType');
    const idea = configManager.load<string>('idea');
    const contentBlocks = configManager.load<ContentBlock[]>('contentBlocks') || [];

    // Get knowledge base
    const defaultDoc = knowledgeBaseManager.getDefaultDocument();
    const knowledgeBase = defaultDoc.content;

    const llm = LLMFactory.getConfiguredProvider();

    const systemPrompt = `You are an expert content writer. Your task is to rewrite a specific section of content based on reviewer feedback.
You will be provided with the current content, reviewer suggestions, and overall context.
Generate improved content that addresses the reviewer's feedback while maintaining document consistency.

Writing Guidelines:
- Write in a ${this.config.writingStyle} style
- Maintain a ${this.config.tone} tone
- Address all points from the reviewer's feedback
- Preserve valuable elements from the current content
- Ensure improved clarity and readability
- Maintain consistency with the document's overall flow`;

    const writerPersona = `Acting as ${this.config.name}, an expert ${(this.config.expertise ?? []).join(', ')}
with a ${this.config.writingStyle} writing style and ${this.config.tone} tone.

${this.config.systemPrompt}`;

    // Get the position of the current block in the outline
    const blockIndex = contentBlocks.findIndex((b) => b.id === block.id);
    const previousBlock = blockIndex > 0 ? contentBlocks[blockIndex - 1] : null;
    const nextBlock = blockIndex < contentBlocks.length - 1 ? contentBlocks[blockIndex + 1] : null;

    const prompt = `${systemPrompt}

${writerPersona}

CONTEXT
Content Type: ${contentType}
Main Idea: ${idea}

DOCUMENT STRUCTURE
${contentBlocks.map((b) => `- ${b.title}: ${b.shortDescription}`).join('\n')}

CURRENT SECTION
Title: ${block.title}
Context: ${block.shortDescription}

${previousBlock ? `Previous Section: ${previousBlock.title}` : 'This is the first section'}
${nextBlock ? `Next Section: ${nextBlock.title}` : 'This is the final section'}

CURRENT CONTENT
${currentValue}

REVIEWER FEEDBACK
${reviewerSuggestion}

KNOWLEDGE BASE CONTEXT
${knowledgeBase}

TASK
Rewrite this section's content to:
1. Address all points from the reviewer's feedback
2. Maintain or improve the existing good elements
3. Ensure better clarity and readability
4. Keep consistency with the overall document flow
5. Use appropriate formatting (headers, lists, paragraphs)
6. Incorporate relevant knowledge base information

Generate the improved content now:`;

    try {
      const response = await llm.executePrompt(prompt, {
        temperature: 0.7,
        maxTokens: 2000,
      });

      return response.content;
    } catch (error) {
      console.error('Failed to rewrite content:', error);
      throw error;
    }
  }
}
