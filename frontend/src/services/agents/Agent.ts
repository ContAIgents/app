import { reviewStyles, toneOptions, writingStyles } from '@/constants/agent-options';
import { ConfigManager } from '@/services/config/ConfigManager';
import { ContentBlock, IdeaContent } from '@/types/content';
import { KnowledgeBaseManager } from '../knowledgeBase/KnowledgeBaseManager';
import { LLMFactory } from '../llm/LLMFactory';
import { AgentConfig, AgentRole } from './types';

export class Agent {
  public config: AgentConfig;

  constructor(config: Partial<AgentConfig>) {
    this.config = {
      id: config.id || crypto.randomUUID(),
      name: config.name || 'New Agent',
      // Use the provided role or fall back to content_writer
      role: config.role || 'content_writer',
      systemPrompt:
        config.systemPrompt || this.getDefaultSystemPrompt(config.role || 'content_writer'),
      expertise: config.expertise || [],
      // Set appropriate default style based on role
      writingStyle:
        config.writingStyle || (config.role === 'content_reviewer' ? 'detailed' : 'professional'),
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
  private parseStructuredResponse(content: string): ContentBlock[] {
    const sections = content
      .split('====')
      .map((s) => s.trim())
      .filter(Boolean);
    const blocks: ContentBlock[] = [];

    for (let i = 0; i < sections.length; i += 2) {
      const titleLine = sections[i];
      const description = sections[i + 1];

      if (titleLine && description) {
        const match = titleLine.match(/(\d+)\.\s*(.+)/);
        if (match) {
          blocks.push({
            id: parseInt(match[1]),
            title: match[2].trim(),
            description: description.trim(),
            content: '',
            comments: [],
          });
        }
      }
    }

    return blocks;
  }

  public async generateStructuredBlocks(
    contentType: string,
    idea: string,
    targetAudience: string,
    extraContext?: string
  ): Promise<ContentBlock[]> {
    const styleInstruction =
      writingStyles.find((s) => s.value === this.config.writingStyle)?.systemInstruction || '';
    const toneInstruction =
      toneOptions.find((t) => t.value === this.config.tone)?.systemInstruction || '';

    const km = new KnowledgeBaseManager();
    const knowledgeBase = await km.getRelevantData({
      context: `idea: ${idea} 
      content type: ${contentType}`,
      targetAudience,
    });

    const llm = LLMFactory.getDefaultProvider();
    if (!llm) {
      throw new Error('No provider configured');
    }

    const systemPrompt = `You are an expert content strategist and writer. Your task is to create a detailed content structure.
IMPORTANT: Format your response EXACTLY as shown in the example below, using "====" to separate sections:

EXAMPLE OUTPUT:
1. Introduction
====
Hook readers and set expectations for the content
====
2. Main Benefits
====
Explore the key advantages and their impact
====
3. Implementation Steps
====
Step-by-step guide for practical application
====

Each section MUST have:
1. Number and title on first line
2. Description on third line (1-2 sentences)
3. Sections separated by "====" on their own lines

${styleInstruction}
${toneInstruction}`;

    const writerPersona = `Acting as ${this.config.name}, an expert ${(this.config.expertise ?? []).join(', ')}.
    ${this.config.systemPrompt}`;

    const prompt = `${systemPrompt}

${writerPersona}

Content Type: ${contentType}
Main Idea: ${idea}
Target Audience: ${targetAudience}

REFERENCE INFORMATION (Use this knowledge to inform your writing - DO NOT copy directly):
${knowledgeBase}

${extraContext ? `EXTRA CONTEXT: ${extraContext}` : ''}

Generate a structured outline following the EXACT format shown in the example above.
Ensure each section builds logically on the previous one and is appropriate for the target audience.`;

    try {
      const response = await llm.executePrompt(prompt, { temperature: 0.7 });
      const blocks = this.parseStructuredResponse(response.content);
      return blocks;
    } catch (error) {
      console.error('Failed to generate blocks:', error);
      throw error;
    }
  }

  public async expand(block: ContentBlock): Promise<string> {
    const configManager = new ConfigManager('editor_');

    const ideaContent = configManager.load<IdeaContent>('ideaContent')!;
    const contentBlocks = ideaContent.blocks;

    const llm = LLMFactory.getDefaultProvider();
    if (!llm) {
      throw new Error('No provider configured');
    }

    const systemPrompt = `You are an expert content writer. Your task is to write content for a specific section.
IMPORTANT: 
- Respond ONLY with the section content
- Do not include any explanations, introductions, or meta-commentary
- Do not copy or include the knowledge base content directly - use it as reference information to inform your writing

Content Requirements:
- Write in a ${this.config.writingStyle} style
- Maintain a ${this.config.tone} tone
- Focus on accuracy and clarity
- Include relevant examples where needed
- Ensure content flows naturally
- Use paragraphs and bullet points for organization
- Stay within the section's scope`;

    const styleInstruction =
      writingStyles.find((s) => s.value === this.config.writingStyle)?.systemInstruction || '';
    const toneInstruction =
      toneOptions.find((t) => t.value === this.config.tone)?.systemInstruction || '';

    const writerPersona = `Acting as ${this.config.name}, an expert ${(this.config.expertise ?? []).join(', ')}.
    ${styleInstruction}
    ${toneInstruction}

    ${this.config.systemPrompt}`;

    // Get the position of the current block in the outline
    const blockIndex = contentBlocks.findIndex((b) => b.id === block.id);
    const previousBlock = blockIndex > 0 ? contentBlocks[blockIndex - 1] : null;
    const nextBlock = blockIndex < contentBlocks.length - 1 ? contentBlocks[blockIndex + 1] : null;

    const km = new KnowledgeBaseManager();
    const knowledgeBase = await km.getRelevantData({
      context: block.description,
      targetAudience: ideaContent.targetAudience,
    });

    const prompt = `${systemPrompt}
  
  ${writerPersona}
  
  CONTEXT
  Content Type: ${ideaContent.contentType}
  Main Idea: ${ideaContent.description}
  Target Audience: ${ideaContent.targetAudience}
  
  DOCUMENT STRUCTURE
  ${ideaContent.blocks.map((b) => `- ${b.title}: ${b.description}`).join('\n')}
  
CURRENT SECTION
Title: ${block.title}
Description: ${block.description}

${previousBlock ? `Previous Section: ${previousBlock.title}` : 'This is the first section'}
${nextBlock ? `Next Section: ${nextBlock.title}` : 'This is the final section'}

REFERENCE INFORMATION (Use this knowledge to inform your writing - DO NOT copy directly):
${knowledgeBase}

Write the section content now. Respond ONLY with the content:`;

    try {
      const response = await llm.executePrompt(prompt, {
        temperature: 0.7,
        maxTokens: 2000,
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
    const styleInstruction =
      writingStyles.find((s) => s.value === this.config.writingStyle)?.systemInstruction || '';
    const toneInstruction =
      toneOptions.find((t) => t.value === this.config.tone)?.systemInstruction || '';

    // Get context from ConfigManager
    const contentType = configManager.load<string>('contentType');
    const idea = configManager.load<string>('idea');
    const contentBlocks = configManager.load<ContentBlock[]>('contentBlocks') || [];

    // Get knowledge base
    const knowledgeBaseManager = new KnowledgeBaseManager();
    const knowledgeBase = await knowledgeBaseManager.getRelevantData({
      context: `idea: ${idea} 
      reviewer suggestion: ${reviewerSuggestion}
      content type: ${contentType}`,
    });

    const llm = LLMFactory.getDefaultProvider();
    if (!llm) {
      throw new Error('No provider configured');
    }

    const systemPrompt = `You are an expert content writer. Your task is to rewrite a specific section of content based on reviewer feedback.
IMPORTANT: 
- Respond ONLY with the rewritten content
- Do not include any explanations, introductions, or meta-commentary
- Do not copy or include the knowledge base content directly - use it as reference information to inform your writing

Your rewrite must:
- Address EACH point from the reviewer's feedback as top priority
- Break down and implement every reviewer suggestion
- Use ${this.config.writingStyle} style and ${this.config.tone} tone
- Preserve valuable elements from current content only if they don't conflict with feedback
- Ensure clarity and readability
- Maintain consistency with document flow

${styleInstruction}
${toneInstruction}`;

    const writerPersona = `Acting as ${this.config.name}, an expert ${(this.config.expertise ?? []).join(', ')}.
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
${contentBlocks.map((b) => `- ${b.title}: ${b.description}`).join('\n')}

CURRENT SECTION
Title: ${block.title}
Context: ${block.description}

${previousBlock ? `Previous Section: ${previousBlock.title}` : 'This is the first section'}
${nextBlock ? `Next Section: ${nextBlock.title}` : 'This is the final section'}

REVIEWER FEEDBACK (HIGHEST PRIORITY)
${reviewerSuggestion}

CURRENT CONTENT
${currentValue}

REFERENCE INFORMATION (Use this knowledge to inform your writing - DO NOT copy directly):
${knowledgeBase}

TASK
Rewrite the content now, incorporating all reviewer feedback. Respond ONLY with the new content:`;

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

  public async generateReview(block: ContentBlock, reviewInstructions?: string): Promise<string> {
    const configManager = new ConfigManager('editor_');

    // Use reviewStyles for reviewers, writingStyles for writers
    const styleInstruction =
      this.config.role === 'content_reviewer'
        ? reviewStyles.find((s) => s.value === this.config.writingStyle)?.systemInstruction
        : writingStyles.find((s) => s.value === this.config.writingStyle)?.systemInstruction;

    const toneInstruction =
      toneOptions.find((t) => t.value === this.config.tone)?.systemInstruction || '';

    // Get context from ConfigManager
    const contentType = configManager.load<string>('contentType');
    const idea = configManager.load<string>('idea');
    const contentBlocks = configManager.load<ContentBlock[]>('contentBlocks') || [];

    const knowledgeBaseManager = new KnowledgeBaseManager();
    const knowledgeBase = await knowledgeBaseManager.getRelevantData({
      context: `idea: ${idea} 
      content type: ${contentType}`,
    });

    const llm = LLMFactory.getDefaultProvider();
    if (!llm) {
      throw new Error('No provider configured');
    }

    const systemPrompt = `You are a concise content reviewer. Provide brief, actionable feedback in 3-5 bullet points.
Each point must be:
- Specific and actionable
- Maximum 2 sentences
- Focused on critical improvements only
Do not include general praise or lengthy explanations.

${styleInstruction}
${toneInstruction}`;

    const reviewerPersona = `Acting as ${this.config.name}, an expert ${(this.config.expertise ?? []).join(', ')}.
    ${this.config.systemPrompt}`;

    const prompt = `${systemPrompt}

${reviewerPersona}

CONTEXT
Content Type: ${contentType}
Main Idea: ${idea}
Section Purpose: ${block.description}
${reviewInstructions ? `\nSPECIFIC REVIEW FOCUS\n${reviewInstructions}` : ''}

REFERENCE INFORMATION (Use this knowledge to inform your writing - DO NOT copy directly):
${knowledgeBase}

CONTENT TO REVIEW
Title: ${block.title}
${block.content}

DOCUMENT STRUCTURE
${contentBlocks.map((b) => `${b.id}. ${b.title}`).join('\n')}

${
  reviewInstructions
    ? 'Provide 3-5 specific, actionable improvements, prioritizing the requested focus areas:'
    : 'Provide 3-5 specific, actionable improvements:'
}`;

    try {
      const response = await llm.executePrompt(prompt, {
        temperature: 0.7,
        maxTokens: 500,
      });
      return response.content;
    } catch (error) {
      console.error('Failed to generate review:', error);
      throw error;
    }
  }

  public async executeTextTask(
    text: string,
    task: 'simplify' | 'rephrase' | 'grammar' | 'explain',
    instructions?: string
  ): Promise<string> {
    const llm = LLMFactory.getDefaultProvider();
    if (!llm) {
      throw new Error('No provider configured');
    }
    const styleInstruction =
      writingStyles.find((s) => s.value === this.config.writingStyle)?.systemInstruction || '';
    const toneInstruction =
      toneOptions.find((t) => t.value === this.config.tone)?.systemInstruction || '';

    const systemPrompt = `You are a focused writing assistant. Your task is to ${task} the given text.
Keep your response DIRECT and CONCISE. Return ONLY the modified text without explanations or meta-commentary.

${styleInstruction}
${toneInstruction}`;

    const writerPersona = `Acting as ${this.config.name}, an expert ${(this.config.expertise ?? []).join(', ')}.
    ${this.config.systemPrompt}`;

    const taskPrompts = {
      simplify: `Rewrite this text at a simpler reading level, making it clear and easy to understand: "${text}"`,
      rephrase: `Rephrase this text ${instructions ? `according to these instructions: ${instructions}\n\nText: ` : ': '}${text}`,
      grammar: `Check and correct any grammar issues in this text. Return only the corrected version: "${text}"`,
      explain: `Explain this text in simple terms, using clear language and examples where helpful: "${text}"`,
    };

    try {
      const response = await llm.executePrompt(
        `${systemPrompt}\n\n${writerPersona}\n\n${taskPrompts[task]}`,
        {
          temperature: 0.3,
          maxTokens: 500,
        }
      );
      return response.content;
    } catch (error) {
      console.error(`Failed to ${task} text:`, error);
      throw error;
    }
  }
}
