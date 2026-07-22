import React, { useState } from 'react';
import { GlassPanel } from '../atoms/GlassPanel';
import { Badge } from '../atoms/Badge';
import { Cpu, HelpCircle, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import shapData from '../../data/shap.json';

export function ShapExplainability() {
  const [expanded, setExpanded] = useState(false);

  return (
    <GlassPanel className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[var(--border)]/40 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-[var(--signal)]" />
          <h3 className="text-sm font-semibold font-display tracking-wide uppercase text-[var(--text)]">
            SHAP AI Model Feature Attribution
          </h3>
        </div>
        <Badge variant="signal">SHAPLEY MATRIX</Badge>
      </div>

      <div className="text-xs text-[var(--muted)] mb-3 font-mono">
        Base Risk: <span className="text-[var(--text)] font-bold">{shapData.baseRiskScore}%</span> → Predicted Risk: <span className="text-[var(--danger)] font-bold">{shapData.predictedRiskScore}%</span>
      </div>

      {/* Feature Contribution Bars */}
      <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
        {shapData.features.map((feat) => {
          const isPositive = feat.type === 'positive';
          const maxContrib = 15;
          const barWidth = Math.min((Math.abs(feat.contribution) / maxContrib) * 100, 100);

          return (
            <div key={feat.importance} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text)] font-sans flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-[var(--bg)] border border-[var(--border)] inline-flex items-center justify-center text-[10px] font-mono text-[var(--muted)]">
                    #{feat.importance}
                  </span>
                  {feat.name}
                </span>
                <span
                  className={`font-mono font-bold ${
                    isPositive ? 'text-[var(--danger)]' : 'text-[var(--signal)]'
                  }`}
                >
                  {isPositive ? `+${feat.contribution}%` : `${feat.contribution}%`}
                </span>
              </div>

              {/* Bar visualization */}
              <div className="relative w-full h-2 bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)]/60">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isPositive
                      ? 'bg-gradient-to-r from-[var(--warning)] to-[var(--danger)] shadow-[0_0_8px_var(--danger)]'
                      : 'bg-gradient-to-r from-emerald-600 to-[var(--signal)] shadow-[0_0_8px_var(--signal)]'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              <div className="text-[10px] text-[var(--muted)] font-sans italic">
                {feat.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable Explanation */}
      <div className="pt-3 border-t border-[var(--border)]/40 mt-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs text-[var(--signal)] font-mono hover:underline"
        >
          <span>{expanded ? 'Hide SHAP Math Rationale' : 'View SHAP Math Rationale'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {expanded && (
          <div className="mt-2 p-2.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[11px] text-[var(--muted)] font-mono leading-relaxed">
            Attribution scores calculated using 10,000 Monte Carlo game-theoretic permutations across satellite SAR telemetry and pipeline pressure sensors.
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
