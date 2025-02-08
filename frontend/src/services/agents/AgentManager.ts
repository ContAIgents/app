import { Agent } from './Agent';
import { AgentConfig } from './types';
import { ConfigManager } from '../config/ConfigManager';

export class AgentManager {
  private configManager: ConfigManager;
  private agents: Map<string, Agent>;

  constructor() {
    this.configManager = new ConfigManager('agents_');
    this.agents = new Map();
    this.loadAgents();
  }

  private loadAgents(): void {
    const savedAgents = this.configManager.load<AgentConfig[]>('list') || [];
    savedAgents.forEach(config => {
      this.agents.set(config.id, new Agent(config));
    });
  }

  private saveAgents(): void {
    const agentsArray = Array.from(this.agents.values()).map(agent => agent.getConfig());
    this.configManager.save('list', agentsArray);
  }

  public createAgent(config: Partial<AgentConfig>): Agent {
    const agent = new Agent(config);
    this.agents.set(agent.getConfig().id, agent);
    this.saveAgents();
    return agent;
  }

  public getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  public getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  public updateAgent(id: string, updates: Partial<AgentConfig>): Agent | undefined {
    const agent = this.agents.get(id);
    if (agent) {
      agent.update(updates);
      this.saveAgents();
    }
    return agent;
  }

  public deleteAgent(id: string): boolean {
    const deleted = this.agents.delete(id);
    if (deleted) {
      this.saveAgents();
    }
    return deleted;
  }

  public hasRequiredAgents(): boolean {
    const agents = this.getAllAgents();
    const hasContentWriter = agents.some(agent => agent.getConfig().role === 'content_writer');
    const hasContentReviewer = agents.some(agent => agent.getConfig().role === 'content_reviewer');
    return hasContentWriter && hasContentReviewer;
  }
}
