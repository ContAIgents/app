import { useState } from 'react';
import { AgentConfig, AgentRole, ToneOfVoice, WritingStyle } from '../services/agents/types';
import { AgentManager } from '../services/agents/AgentManager';
import { Agent } from '../services/agents/Agent';

interface UseAgentFormProps {
  initialAgent?: Agent | null;
  onSave?: (agent: Agent) => void;
  onClose?: () => void;
  defaultRole?: AgentRole | null;
}

export const useAgentForm = ({ initialAgent, onSave, onClose, defaultRole }: UseAgentFormProps = {}) => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(initialAgent || null);
  const [formData, setFormData] = useState<Partial<AgentConfig>>(() => {
    if (initialAgent) {
      return initialAgent.getConfig();
    }
    // Initialize with default role if provided and ensure it's a required field
    const def= {
      role: defaultRole || 'content_writer',
      writingStyle: defaultRole === 'content_reviewer' ? 'detailed' : 'professional',
      tone: 'neutral',
    } as Required<Pick<AgentConfig, 'role' | 'writingStyle' | 'tone'>>;
    return def 
  });
  
  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData(agent.getConfig());
  };

  const handleAdd = () => {
    setSelectedAgent(null);
    setFormData({
      role: defaultRole || 'content_writer',
      writingStyle: defaultRole === 'content_reviewer' ? 'detailed' : 'professional',
      tone: 'neutral',
    });
  };

  const handleSave = () => {
    console.log('formData', formData)
    const agentManager = new AgentManager();
    // Ensure role is always set correctly from defaultRole
    const finalFormData = {
      ...formData,
      role: formData.role ?? defaultRole ?? 'content_writer',
      writingStyle: formData.writingStyle ?? (defaultRole === 'content_reviewer' ? 'detailed' : 'professional'),
    };
    
    const agent = new Agent(finalFormData);
    
    if (selectedAgent) {
      agentManager.updateAgent(selectedAgent.getConfig().id, finalFormData);
    } else {
      agentManager.createAgent(finalFormData);
    }
    onSave?.(agent);
  };

  const handleClose = () => {
    setSelectedAgent(null);
    setFormData({});
    onClose?.();
  };

  const updateFormField = (field: keyof AgentConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // If role changes, update the writing style to match the role's default
      ...(field === 'role' && {
        writingStyle: value === 'content_reviewer' ? 'detailed' : 'professional'
      })
    }));
  };

  return {
    selectedAgent,
    formData,
    handleEdit,
    handleAdd,
    handleSave,
    handleClose,
    updateFormField,
  };
};
