import React from 'react';
import { GlassPanel } from '../atoms/GlassPanel';
import { Badge } from '../atoms/Badge';
import { StatusDot } from '../atoms/StatusDot';
import { ShieldAlert, MapPin, Bot, Clock } from 'lucide-react';
import alertsData from '../../data/alerts.json';

export function AlertCenter() {
  return (
    <GlassPanel className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[var(--border)]/40 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-[var(--danger)]" />
          <h3 className="text-sm font-semibold font-display tracking-wide uppercase text-[var(--text)]">
            Active Intelligence Alerts
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-[var(--danger)] bg-[var(--danger)]/15 px-2 py-0.5 rounded border border-[var(--danger)]/30">
          {alertsData.length} CRITICAL
        </span>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
        {alertsData.map((alert) => (
          <div
            key={alert.id}
            className="p-3 rounded-lg bg-[var(--bg)]/60 border border-[var(--border)] hover:border-[var(--signal)]/40 transition-all space-y-2"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <StatusDot status={alert.severity} size="sm" />
                <span className="text-xs font-bold font-display text-[var(--text)]">
                  {alert.title}
                </span>
              </div>
              <Badge variant={alert.severity}>{alert.id}</Badge>
            </div>

            <p className="text-xs text-[var(--muted)] line-clamp-2">{alert.summary}</p>

            <div className="flex items-center justify-between text-[11px] font-mono text-[var(--muted)] pt-1 border-t border-[var(--border)]/30">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[var(--signal)]" /> {alert.chokepoint}
              </span>
              <span className="flex items-center gap-1">
                <Bot className="w-3 h-3 text-[var(--signal)]" /> {alert.agentAssigned}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {alert.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
