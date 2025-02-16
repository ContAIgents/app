import { useState, useEffect } from 'react';
import { Agent } from '@/services/agents/Agent';
import { ConfigManager } from '@/services/config/ConfigManager';
import { AgentManager } from '@/services/agents/AgentManager';

interface UseSelectedAgentOptions {
  prefix?: string;
  fallbackRole?: 'content_writer' | 'content_reviewer';
}

export const useSelectedAgent = (options: UseSelectedAgentOptions = {}) => {
  const { prefix = 'editor_', fallbackRole = 'content_writer' } = options;
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAgent = () => {
      try {
        const configManager = new ConfigManager(prefix);
        const agentManager = new AgentManager();
        
        // Try to get saved agent configuration
        const savedAgentConfig = configManager.load(
          fallbackRole === 'content_writer' ? 'selectedWriter' : 'selectedReviewer'
        );

        if (savedAgentConfig) {
          setSelectedAgent(new Agent(savedAgentConfig));
          setIsLoading(false);
          return;
        }

        // If no saved agent, get first available agent of the specified role
        const availableAgents = agentManager.getAllAgents();
        const defaultAgent = availableAgents.find(
          agent => agent.getConfig().role === fallbackRole
        );

        if (defaultAgent) {
          setSelectedAgent(defaultAgent);
          // Save this agent as the selected one
          configManager.save(
            fallbackRole === 'content_writer' ? 'selectedWriter' : 'selectedReviewer',
            defaultAgent.getConfig()
          );
        } else {
          setError(`No ${fallbackRole} agent available`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize agent');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAgent();
  }, [prefix, fallbackRole]);

  const updateSelectedAgent = (agent: Agent) => {
    try {
      const configManager = new ConfigManager(prefix);
      configManager.save(
        fallbackRole === 'content_writer' ? 'selectedWriter' : 'selectedReviewer',
        agent.getConfig()
      );
      setSelectedAgent(agent);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update selected agent');
    }
  };

  return {
    selectedAgent,
    isLoading,
    error,
    updateSelectedAgent
  };
};