import React, { useState } from 'react';
import { GlassPanel } from '../atoms/GlassPanel';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { CheckCircle2, DollarSign, Clock, ShieldCheck, ChevronRight, Award } from 'lucide-react';
import decisionsData from '../../data/decisions.json';

export function DecisionComparison() {
  const [selectedOpt, setSelectedOpt] = useState('OPT-A');

  return (
    <GlassPanel className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[var(--border)]/40 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-[var(--signal)]" />
          <h3 className="text-sm font-semibold font-display tracking-wide uppercase text-[var(--text)]">
            Strategic Mitigation Decision Matrix
          </h3>
        </div>
        <span className="text-xs font-mono text-[var(--signal)] font-bold">3 OPTIONS EVALUATED</span>
      </div>

      {/* Side-by-side Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-2">
        {decisionsData.map((opt) => {
          const isSelected = selectedOpt === opt.id;

          return (
            <div
              key={opt.id}
              onClick={() => setSelectedOpt(opt.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[var(--signal)]/10 border-[var(--signal)] shadow-[0_0_20px_rgba(0,217,192,0.15)]'
                  : 'bg-[var(--bg)]/50 border-[var(--border)] hover:border-[var(--border)]/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-bold font-mono text-[var(--signal)]">#{opt.rank}</span>
                  {opt.recommended && <Badge variant="signal">AI CHOICE</Badge>}
                </div>
                <h4 className="text-xs font-bold font-display text-[var(--text)] mb-2">
                  {opt.title}
                </h4>
                <p className="text-[11px] text-[var(--muted)] line-clamp-3 font-sans mb-3">
                  {opt.summary}
                </p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-[var(--border)]/40 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Cost Impact:</span>
                  <span className="font-bold text-[var(--text)]">{opt.costImpact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)] font-mono">Transit Lag:</span>
                  <span className="font-bold text-[var(--warning)]">{opt.transitTimeImpact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Risk Delta:</span>
                  <span className="font-bold text-[var(--signal)]">{opt.riskReduction}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Option Details */}
      {(() => {
        const active = decisionsData.find((d) => d.id === selectedOpt) || decisionsData[0];
        return (
          <div className="p-3.5 rounded-lg bg-[var(--panel)] border border-[var(--border)] mt-2">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--signal)] font-bold mb-2">
              <span>{active.title} — Detailed Pros & Cons</span>
              <span>Confidence: {active.confidence}%</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
              <div>
                <span className="text-[var(--signal)] font-semibold text-[11px] block mb-1">PROS:</span>
                <ul className="space-y-1 text-[var(--muted)] text-[11px] list-disc list-inside">
                  {active.pros.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[var(--danger)] font-semibold text-[11px] block mb-1">CONS:</span>
                <ul className="space-y-1 text-[var(--muted)] text-[11px] list-disc list-inside">
                  {active.cons.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })()}
    </GlassPanel>
  );
}
