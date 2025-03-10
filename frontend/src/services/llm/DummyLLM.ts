import { BaseLLM } from './BaseLLM';
import { PromptOptions, PromptResponse, ProviderConfig } from './types';

export class DummyLLM extends BaseLLM {
  static readonly providerConfig: ProviderConfig = {
    name: 'DummyLLM',
    configFields: [],
  };

  private getRandomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  private simulateNetworkDelay(): Promise<void> {
    // Random delay between 1-3 seconds
    const delay = this.getRandomDelay(1000, 3000);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  private simulateThinkingDelay(): Promise<void> {
    // Random "thinking" delay between 2-4 seconds
    const delay = this.getRandomDelay(2000, 4000);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  private async simulateOccasionalTimeout(): Promise<void> {
    // 10% chance of timeout
    if (Math.random() < 0.1) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      throw new Error('Request timed out');
    }
  }

  constructor() {
    super(DummyLLM.providerConfig);
  }

  isConfigured(): boolean {
    return true;
  }

  async executePrompt(prompt: string, options: PromptOptions = {}): Promise<PromptResponse> {
    console.log('Executing prompt on DummyLLM:', prompt, 'with options:', options);
    try {
      // Simulate network latency
      await this.simulateNetworkDelay();

      // Simulate occasional timeouts
      // await this.simulateOccasionalTimeout();

      // Simulate AI "thinking" time
      // await this.simulateThinkingDelay();

      // Return dummy structured content
      if (prompt.startsWith('You are an expert content strategist and writer.'))
        return {
          content: `1. Introduction
====
Setting the context and main objectives
====
2. Key Concepts
====
Core ideas and fundamental principles
====
3. Practical Implementation
====
Step-by-step guide and best practices
====
4. Common Challenges
====
Addressing potential issues and solutions
====
5. Conclusion
====
Summary and next steps`,
          raw: {
            model: 'dummy-gpt-3.5',
            usage: {
              prompt_tokens: 147,
              completion_tokens: 238,
              total_tokens: 385,
            },
          },
        };
      else if (prompt.startsWith('You are a concise content reviewer.'))
        return {
          content: `- Point 1: Improve the clarity of the introduction.
- Point 2: Ensure the key concepts are well-explained.
- Point 3: Provide more examples in the practical implementation section.
- Point 4: Address common challenges in the next steps section.`,
          raw: {
            model: 'dummy-gpt-3.5',
            usage: {
              prompt_tokens: 147,
              completion_tokens: 238,
              total_tokens: 385,
            },
          },
        };
      else {
        return {
          content: `# Dummy Response from DummyLLM Provider

## Introduction
This is a larger dummy Markdown text response from the DummyLLM provider.

## Main Content
- Point 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
- Point 2: Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
- Point 3: Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

## Conclusion
In conclusion, this dummy text demonstrates a more substantial response.`,
          raw: {
            model: 'dummy-gpt-3.5',
            usage: {
              prompt_tokens: 147,
              completion_tokens: 238,
              total_tokens: 385,
            },
          },
        };
      }
    } catch (error) {
      // Simulate error response format similar to real LLM providers
      throw new Error(
        `DummyLLM API error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
