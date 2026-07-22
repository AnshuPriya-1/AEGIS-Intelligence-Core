import React from 'react';
import { useApp } from '../../context/AppContext';
import { useSimulation } from '../../context/SimulationContext';
import { GlassPanel } from '../atoms/GlassPanel';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Sliders, AlertTriangle, Play, Loader2 } from 'lucide-react';

export function ScenarioPanel() {
  const { activeScenario, setActiveScenario } = useApp();
  const { simulation, runSimulation } = useSimulation();

  const scenarios = [
    {
      id: 'baseline',
      title: 'Baseline Operations',
      desc: 'Standard supply chain flow across all major maritime chokepoints.',
      impactDays: 114,
      riskImpact: 'NORMAL',
      recommendation: 'Maintain standard procurement buffer.',
    },
    {
      id: 'hormuzBlockade',
      title: 'Strait of Hormuz Blockade (30 Days)',
      desc: 'Simulate complete maritime transit disruption through Persian Gulf corridor.',
      impactDays: 58,
      riskImpact: '+26.6 RISK SCORE',
      recommendation: 'Authorize emergency release of 2.4M bpd from Cushing SPR.',
    },
    {
      id: 'cyberOutage',
      title: 'Regional Cyber SCADA Outage',
      desc: 'Simulate cyber compromise across 14 gas compressor stations.',
      impactDays: 95,
      riskImpact: '+14.2 RISK SCORE',
      recommendation: 'Isolate SCADA subnet 4 and activate analog backup load dispatchers.',
    },
  ];

  const current = scenarios.find((s) => s.id === activeScenario) || scenarios[0];

  return (
    <GlassPanel className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[var(--border)]/40 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-[var(--signal)]" />
          <h3 className="text-sm font-semibold font-display tracking-wide uppercase text-[var(--text)]">
            AI Scenario Simulator
          </h3>
        </div>
        <Badge variant={activeScenario === 'baseline' ? 'signal' : 'danger'}>
          {activeScenario.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 my-2">
        {scenarios.map((scen) => (
          <button
            key={scen.id}
            onClick={() => setActiveScenario(scen.id)}
            className={`p-3 rounded-lg text-left transition-all border ${
              activeScenario === scen.id
                ? 'bg-[var(--signal)]/15 border-[var(--signal)] shadow-[0_0_15px_rgba(0,217,192,0.15)]'
                : 'bg-[var(--bg)]/40 border-[var(--border)] hover:border-[var(--border)]/80'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold font-display text-[var(--text)]">
                {scen.title}
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted)] line-clamp-2">{scen.desc}</p>
          </button>
        ))}
      </div>

      {/* Impact & AI Action Box */}
      <div className="p-3.5 rounded-lg bg-[var(--panel)] border border-[var(--border)] mt-2 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[var(--muted)] flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-[var(--warning)]" /> Simulated SPR Capacity:
          </span>
          <span className="font-bold text-[var(--signal)]">{current.impactDays} DAYS</span>
        </div>
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[var(--muted)]">Risk Projection Impact:</span>
          <span className="font-bold text-[var(--danger)]">{current.riskImpact}</span>
        </div>
        <div className="pt-2 border-t border-[var(--border)]/40 text-xs">
          <span className="text-[var(--signal)] font-bold block mb-1">AI Recommendation:</span>
          <p className="text-[var(--text)] text-[11px] font-sans">{current.recommendation}</p>
        </div>
      </div>

      <Button
        variant={current.id === 'baseline' ? 'secondary' : 'danger'}
        size="sm"
        icon={simulation.active ? Loader2 : Play}
        disabled={simulation.active}
        onClick={() => runSimulation(current)}
        className="w-full mt-3"
      >
        {simulation.active ? 'Simulation Running...' : 'Run Crisis Simulation'}
      </Button>
    </GlassPanel>
  );
}
