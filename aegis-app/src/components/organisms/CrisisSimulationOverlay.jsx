import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '../../context/SimulationContext';
import { Badge } from '../atoms/Badge';
import { AlertTriangle, Cpu, Fuel, ShieldAlert, Radar } from 'lucide-react';

function TypedLine({ text, active }) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    if (!active) return;
    setDisplay('');
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setDisplay(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 14);
    return () => clearInterval(interval);
  }, [text, active]);

  return <span>{display}</span>;
}

export function CrisisSimulationOverlay() {
  const { simulation, liveRiskScore, liveConfidence } = useSimulation();

  if (!simulation.scenarioId) return null;

  return (
    <AnimatePresence>
      {simulation.active && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4"
        >
          <div className="rounded-xl border border-[var(--danger)]/50 bg-[var(--panel-glass)] backdrop-blur-xl shadow-[0_8px_40px_rgba(255,71,87,0.15)] overflow-hidden">
            {/* Alert banner */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--danger)]/10 border-b border-[var(--danger)]/30">
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                <ShieldAlert className="w-4 h-4 text-[var(--danger)]" />
              </motion.div>
              <span className="text-xs font-bold font-display text-[var(--danger)] uppercase tracking-wide">
                Simulation In Progress — {simulation.scenarioTitle}
              </span>
              <Badge variant="danger" className="ml-auto">
                STEP {simulation.step}/{simulation.totalSteps}
              </Badge>
            </div>

            <div className="p-4 space-y-3">
              {/* Live metrics ripple */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-[var(--bg)] border border-[var(--border)] p-2.5">
                  <div className="text-[9px] font-mono text-[var(--muted)] uppercase mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Risk Score
                  </div>
                  <motion.div
                    key={liveRiskScore}
                    initial={{ scale: 1.15 }}
                    animate={{ scale: 1 }}
                    className="text-lg font-bold font-display text-[var(--danger)]"
                  >
                    {liveRiskScore.toFixed(1)}
                  </motion.div>
                </div>
                <div className="rounded-lg bg-[var(--bg)] border border-[var(--border)] p-2.5">
                  <div className="text-[9px] font-mono text-[var(--muted)] uppercase mb-1 flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> Confidence
                  </div>
                  <motion.div
                    key={liveConfidence}
                    initial={{ scale: 1.15 }}
                    animate={{ scale: 1 }}
                    className="text-lg font-bold font-display text-[var(--signal)]"
                  >
                    {liveConfidence.toFixed(1)}%
                  </motion.div>
                </div>
                <div className="rounded-lg bg-[var(--bg)] border border-[var(--border)] p-2.5">
                  <div className="text-[9px] font-mono text-[var(--muted)] uppercase mb-1 flex items-center gap-1">
                    <Fuel className="w-3 h-3" /> Reserve Tank
                  </div>
                  <div className="text-lg font-bold font-display text-[var(--warning)]">
                    {simulation.reserveTank.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Reserve tank bar */}
              <div className="w-full h-1.5 bg-[var(--bg)] rounded-full border border-[var(--border)] overflow-hidden">
                <motion.div
                  animate={{ width: `${simulation.reserveTank}%` }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                  className="h-full bg-gradient-to-r from-[var(--warning)] to-[var(--danger)]"
                />
              </div>

              {/* AI reasoning typing feed */}
              <div className="rounded-lg bg-[var(--bg)] border border-[var(--border)] p-3 font-mono text-[11px] text-[var(--signal)] min-h-[60px]">
                <div className="flex items-center gap-1.5 text-[9px] text-[var(--muted)] uppercase mb-1.5">
                  <Radar className="w-3 h-3 animate-pulse" /> AI Reasoning Stream
                </div>
                {simulation.reasoningLines.slice(0, simulation.step).map((line, idx) => (
                  <div key={idx} className="mb-1 last:mb-0">
                    {idx === simulation.step - 1 ? (
                      <TypedLine text={line} active />
                    ) : (
                      <span className="text-[var(--muted)]">{line}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
