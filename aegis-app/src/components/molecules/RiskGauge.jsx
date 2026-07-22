import React from 'react';
import { GlassPanel } from '../atoms/GlassPanel';
import { Badge } from '../atoms/Badge';
import { ShieldAlert, Cpu } from 'lucide-react';

export function RiskGauge({ riskData }) {
  if (!riskData) return null;

  const { globalRiskScore, riskLevel, status, confidenceScore, breakdown } = riskData;

  // Calculate arc parameters
  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (globalRiskScore / 100) * circumference;

  const colorMap = {
    danger: 'var(--danger)',
    warning: 'var(--warning)',
    signal: 'var(--signal)',
  };

  return (
    <GlassPanel className="flex flex-col justify-between h-full">
      <div className="flex items-center justify-between border-b border-[var(--border)]/40 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert className={`w-4 h-4 ${status === 'danger' ? 'text-[var(--danger)]' : 'text-[var(--warning)]'}`} />
          <h3 className="text-sm font-semibold font-display tracking-wide uppercase text-[var(--text)]">
            Global Risk Index
          </h3>
        </div>
        <Badge variant={status}>{riskLevel}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center my-2">
        {/* Radial Arc */}
        <div className="relative flex items-center justify-center">
          <svg className="w-36 h-36 transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="var(--border)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke={colorMap[status] || 'var(--warning)'}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold font-mono text-[var(--text)] tracking-tight">
              {globalRiskScore.toFixed(1)}
            </span>
            <span className="text-[10px] font-mono text-[var(--muted)] uppercase">/ 100 Risk</span>
          </div>
        </div>

        {/* Breakdown Items */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[var(--muted)] flex items-center gap-1 font-mono">
              <Cpu className="w-3 h-3 text-[var(--signal)]" /> AI Confidence
            </span>
            <span className="font-mono font-bold text-[var(--signal)]">{confidenceScore}%</span>
          </div>
          {breakdown.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--muted)]">{item.category}</span>
                <span className="font-mono text-[var(--text)] font-semibold">{item.score}%</span>
              </div>
              <div className="w-full bg-[var(--border)]/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    item.status === 'danger'
                      ? 'bg-[var(--danger)]'
                      : item.status === 'warning'
                      ? 'bg-[var(--warning)]'
                      : 'bg-[var(--signal)]'
                  }`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
