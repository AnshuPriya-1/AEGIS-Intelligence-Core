import React from 'react';
import { GlassPanel } from '../atoms/GlassPanel';
import { StatusDot } from '../atoms/StatusDot';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function MetricTile({ title, value, unit, change, trend, status, target, history }) {
  const isUp = trend === 'up';
  const isDown = trend === 'down';

  return (
    <GlassPanel hoverEffect className="flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider font-sans">
          {title}
        </span>
        <StatusDot status={status} size="sm" />
      </div>

      <div className="flex items-baseline space-x-1.5 my-1">
        <span className="text-2xl font-bold font-mono text-[var(--text)] tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-[var(--muted)] uppercase">
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]/40 text-xs">
        <div className="flex items-center space-x-1 font-mono">
          {isUp && <TrendingUp className="w-3.5 h-3.5 text-[var(--signal)]" />}
          {isDown && <TrendingDown className="w-3.5 h-3.5 text-[var(--danger)]" />}
          {!isUp && !isDown && <Minus className="w-3.5 h-3.5 text-[var(--muted)]" />}
          <span
            className={
              status === 'danger'
                ? 'text-[var(--danger)]'
                : status === 'warning'
                ? 'text-[var(--warning)]'
                : 'text-[var(--signal)]'
            }
          >
            {change}
          </span>
        </div>
        {target && (
          <span className="text-[10px] text-[var(--muted)] font-mono">
            Target: {target}
          </span>
        )}
      </div>
    </GlassPanel>
  );
}
