import React from 'react';
import { GlassPanel } from '../atoms/GlassPanel';
import { StatusDot } from '../atoms/StatusDot';
import { Radio, Cpu } from 'lucide-react';
import signalsData from '../../data/signals.json';

export function SignalFeed() {
  return (
    <GlassPanel className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[var(--border)]/40 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-[var(--signal)] animate-pulse" />
          <h3 className="text-sm font-semibold font-display tracking-wide uppercase text-[var(--text)]">
            Live Signals
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[var(--signal)]">Updates every second</span>
      </div>

      <div className="space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
        {signalsData.map((sig) => (
          <div
            key={sig.id}
            className="flex items-start space-x-3 p-2.5 rounded-lg bg-[var(--bg)]/40 border border-[var(--border)]/60 text-xs font-mono"
          >
            <StatusDot status={sig.status} size="sm" className="mt-1 shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--signal)] font-bold">{sig.source}</span>
                <span className="text-[10px] text-[var(--muted)]">{sig.timestamp}</span>
              </div>
              <p className="text-[var(--text)] text-[11px] leading-tight">{sig.signal}</p>
              <div className="flex items-center justify-between text-[10px] text-[var(--muted)] pt-0.5">
                <span>Type: {sig.type}</span>
                <span className="flex items-center gap-0.5 text-[var(--signal)]">
                  <Cpu className="w-3 h-3" /> {sig.confidence}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
