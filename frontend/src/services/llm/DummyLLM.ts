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
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private simulateThinkingDelay(): Promise<void> {
    // Random "thinking" delay between 2-4 seconds
    const delay = this.getRandomDelay(2000, 4000);
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private async simulateOccasionalTimeout(): Promise<void> {
    // 10% chance of timeout
    if (Math.random() < 0.1) {
      await new Promise(resolve => setTimeout(resolve, 5000));
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
            total_tokens: 385
          }
        }
      };
    } catch (error) {
      // Simulate error response format similar to real LLM providers
      throw new Error(`DummyLLM API error: ${error.message}`);
    }
  }
}
