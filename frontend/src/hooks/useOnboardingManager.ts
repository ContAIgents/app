import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LLMFactory } from '../services/llm/LLMFactory';
import { AgentManager } from '../services/agents/AgentManager';
import { KnowledgeBaseManager } from '../services/knowledgeBase/KnowledgeBaseManager';

export function useOnboardingManager() {
  const navigate = useNavigate();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = () => {
    // Check LLM configuration
    try {
      const llm = LLMFactory.getProvider('OpenAI');
      if (!llm.isConfigured()) {
        navigate('/llmConfig');
        return;
      }
    } catch {
      navigate('/llmConfig');
      return;
    }

    // Check required agents
    const agentManager = new AgentManager();
    if (!agentManager.hasRequiredAgents()) {
      navigate('/agents');
      return;
    }

    // Check knowledge base
    const knowledgeBaseManager = new KnowledgeBaseManager();
    const defaultDoc = knowledgeBaseManager.getDefaultDocument();
    if (defaultDoc.content === 'Welcome to the Knowledge Base') {
      navigate('/knowledgeBase');
      return;
    }

    // If all checks pass, redirect to editor
    navigate('/editor');
  };
}