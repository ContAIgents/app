import { useState, useCallback } from 'react';
import { Agent } from '@/services/agents/Agent';
import { AgentManager } from '@/services/agents/AgentManager';
import { ConfigManager } from '@/services/config/ConfigManager';

export const useBlockAgents = (blockId: number) => {
  const configManager = new ConfigManager('editor_');
  const [selectedWriter, setSelectedWriter] = useState<Agent>(() => {
    const savedWriter = configManager.load(`block_${blockId}_writer`);
    return new Agent(savedWriter || configManager.load('selectedWriter') || {});
  });

  const [selectedReviewer, setSelectedReviewer] = useState<Agent>(() => {
    const savedReviewer = configManager.load(`block_${blockId}_reviewer`);
    return new Agent(savedReviewer || configManager.load('selectedReviewer') || {});
  });

  const [availableAgents] = useState(() => new AgentManager().getAllAgents());

  const updateWriter = useCallback(
    (writer: Agent) => {
      setSelectedWriter(writer);
      configManager.save(`block_${blockId}_writer`, writer.getConfig());
    },
    [blockId]
  );

  const updateReviewer = useCallback(
    (reviewer: Agent) => {
      setSelectedReviewer(reviewer);
      configManager.save(`block_${blockId}_reviewer`, reviewer.getConfig());
    },
    [blockId]
  );

  return {
    selectedWriter,
    selectedReviewer,
    availableAgents,
    updateWriter,
    updateReviewer,
  };
};