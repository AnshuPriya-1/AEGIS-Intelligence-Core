import React from 'react';
import { GlassPanel } from '../atoms/GlassPanel';
import { AgentCard } from '../molecules/AgentCard';
import { Cpu } from 'lucide-react';
import agentsData from '../../data/agents.json';

export function AgentMonitor() {
  return (
    <GlassPanel className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[var(--border)]/40 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-[var(--signal)]" />
          <h3 className="text-sm font-semibold font-display tracking-wide uppercase text-[var(--text)]">
            AI Autonomous Agent Fleet
          </h3>
        </div>
        <span className="text-xs font-mono text-[var(--signal)] font-bold">4 ONLINE</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {agentsData.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </GlassPanel>
  );
}
