export const writingStyles = [
  { 
    value: 'professional', 
    label: 'Professional',
    systemInstruction: 'Write in a formal, business-appropriate style using clear, precise language and industry-standard terminology. Maintain objectivity and focus on delivering value through well-structured, factual content.'
  },
  { 
    value: 'conversational', 
    label: 'Conversational',
    systemInstruction: 'Write in a friendly, approachable manner as if having a dialogue with the reader. Use natural language, occasional contractions, and relatable examples while maintaining professionalism.'
  },
  { 
    value: 'technical', 
    label: 'Technical',
    systemInstruction: 'Focus on technical accuracy and detail. Use precise terminology, include relevant code examples or technical specifications, and maintain a structured approach to explaining complex concepts.'
  },
  { 
    value: 'storytelling', 
    label: 'Storytelling',
    systemInstruction: 'Present information through narrative structures, using scenarios, examples, and engaging transitions. Create a flow that guides readers through a journey while delivering key points.'
  },
  { 
    value: 'educational', 
    label: 'Educational',
    systemInstruction: 'Break down complex topics into digestible segments. Use clear explanations, examples, and progressive disclosure of information. Include summaries and key takeaways for better retention.'
  }
];

export const reviewStyles = [
  { 
    value: 'detailed', 
    label: 'Detailed',
    systemInstruction: 'Provide comprehensive feedback covering all aspects including structure, content accuracy, style, and potential improvements. Include specific examples and detailed suggestions for enhancement.'
  },
  { 
    value: 'concise', 
    label: 'Concise',
    systemInstruction: 'Focus on the most critical points for improvement. Deliver clear, actionable feedback in brief bullet points without extensive explanation.'
  },
  { 
    value: 'technical', 
    label: 'Technical',
    systemInstruction: 'Emphasize technical accuracy, code quality, and implementation details. Focus on architectural improvements, performance optimizations, and best practices.'
  },
  { 
    value: 'strategic', 
    label: 'Strategic',
    systemInstruction: 'Focus on high-level improvements, content strategy, and alignment with business goals. Provide feedback on market positioning, user value, and overall impact.'
  },
  { 
    value: 'educational', 
    label: 'Educational',
    systemInstruction: 'Provide constructive feedback with explanations and learning opportunities. Include resources, examples, and guidance for improvement.'
  }
];

export const toneOptions = [
  { 
    value: 'neutral', 
    label: 'Neutral & Balanced',
    systemInstruction: 'Maintain an objective, unbiased tone. Present information without emotional coloring while ensuring clarity and professionalism.'
  },
  { 
    value: 'enthusiastic', 
    label: 'Enthusiastic & Energetic',
    systemInstruction: 'Express ideas with passion and excitement. Use dynamic language and positive emphasis while maintaining credibility and avoiding over-exaggeration.'
  },
  { 
    value: 'humorous', 
    label: 'Humorous & Light',
    systemInstruction: 'Incorporate appropriate humor and light-hearted elements while delivering valuable content. Use witty examples and analogies without compromising professionalism.'
  },
  { 
    value: 'authoritative', 
    label: 'Authoritative & Confident',
    systemInstruction: 'Project expertise and credibility through strong, decisive language. Support statements with evidence and experience while maintaining accessibility.'
  },
  { 
    value: 'empathetic', 
    label: 'Empathetic & Understanding',
    systemInstruction: 'Show understanding of reader challenges and perspectives. Address concerns thoughtfully and provide supportive guidance while maintaining professionalism.'
  }
];

export const expertiseSuggestions = [
  'Web Development',
  'Machine Learning',
  'Cloud Architecture',
  'DevOps',
  'Mobile Development',
  'Data Science',
  'Cybersecurity',
  'UI/UX Design',
  'Technical Writing',
  'System Design'
];

export const skillOptions = [
  {
    value: 'web_search',
    label: 'Web Search',
    description: 'Can search and analyze real-time web content',
    systemInstruction: 'Utilize web search capabilities to find and incorporate current, relevant information from reliable sources. Verify facts and provide up-to-date context.'
  },
  {
    value: 'math_computation',
    label: 'Mathematical Analysis',
    description: 'Can perform complex mathematical calculations',
    systemInstruction: 'Execute precise mathematical calculations and analysis. Present numerical results clearly with appropriate context and explanations.'
  },
  {
    value: 'sentiment_analysis',
    label: 'Sentiment Analysis',
    description: 'Can analyze emotional tone in content',
    systemInstruction: 'Analyze and evaluate emotional undertones in content. Provide insights on tone alignment and emotional impact while suggesting adjustments.'
  },
  {
    value: 'translation',
    label: 'Translation',
    description: 'Can translate between multiple languages',
    systemInstruction: 'Accurately translate content while preserving meaning, context, and cultural nuances. Maintain consistency in terminology and style across languages.'
  }
];

export const llmOptions = [
  {
    value: 'gpt4',
    label: 'GPT-4',
    systemInstruction: 'Leverage GPT-4\'s advanced capabilities for complex reasoning, detailed analysis, and nuanced understanding while maintaining high accuracy and reliability.'
  },
  {
    value: 'gpt35',
    label: 'GPT-3.5',
    systemInstruction: 'Utilize GPT-3.5\'s capabilities for efficient content generation and analysis while optimizing for speed and resource usage.'
  },
  {
    value: 'deepseek',
    label: 'DeepSeek',
    systemInstruction: 'Employ DeepSeek\'s specialized capabilities for technical content and code-related tasks while maintaining high precision and technical accuracy.'
  }
];
