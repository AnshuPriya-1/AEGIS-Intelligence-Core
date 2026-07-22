import React from 'react';
import { GlassPanel } from '../atoms/GlassPanel';
import { StatusDot } from '../atoms/StatusDot';
import { Badge } from '../atoms/Badge';
import { Bot, Activity } from 'lucide-react';

export function AgentCard({ agent }) {
  return (
    <GlassPanel hoverEffect className="p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-[var(--panel)] border border-[var(--border)] text-[var(--signal)]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-display text-[var(--text)]">{agent.name}</h4>
            <p className="text-[10px] text-[var(--muted)]">{agent.role}</p>
          </div>
        </div>
        <StatusDot status={agent.statusColor} size="sm" />
      </div>

      <div className="bg-[var(--bg)]/50 p-2 rounded border border-[var(--border)]/50 my-2">
        <p className="text-[11px] text-[var(--text)] font-sans line-clamp-2">{agent.activity}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]/30 text-[10px]">
        <span className="text-[var(--muted)] flex items-center gap-1 font-mono">
          <Activity className="w-3 h-3 text-[var(--signal)]" /> {agent.confidence}% Conf.
        </span>
        <Badge variant={agent.statusColor}>{agent.status}</Badge>
      </div>
    </GlassPanel>
  );
}
