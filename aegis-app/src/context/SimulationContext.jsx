import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import riskData from '../data/risk.json';
import oilPricesData from '../data/oil_prices.json';
import notificationsSeed from '../data/notifications.json';
import extendedMemorySeed from '../data/extended_memory.json';
import { apiService } from '../services/apiService';

const SimulationContext = createContext();

const REASONING_LINES = {
  hormuzBlockade: [
    'Ingesting satellite SAR telemetry across maritime corridor Alpha...',
    'Cross-referencing AIS divergence patterns with historical blockade signatures...',
    'Modeling 30-day closure impact on Persian Gulf throughput (21.0M bpd at risk)...',
    'Evaluating Cape of Good Hope reroute cost against SPR release thresholds...',
    'Recommendation converged: release 2.4M bpd from Cushing SPR, reroute 48 tankers.',
  ],
  cyberOutage: [
    'Scanning SCADA subnet telemetry across 14 compressor stations...',
    'Detecting anomalous ping latency exceeding isolation threshold (500ms)...',
    'Simulating cascading failure across interconnected grid segments...',
    'Weighing automated isolation protocol against manual override cost...',
    'Recommendation converged: isolate subnet 4, activate analog backup dispatchers.',
  ],
  baseline: [
    'Running full diagnostic sync across all monitored chokepoints...',
    'Verifying knowledge graph consistency against latest signal feed...',
    'No material deviations detected from resilience baseline.',
    'Recommendation converged: maintain standard procurement buffer.',
  ],
};

// Module 4.2 — maps a scenario card in the UI to the real Scenario Engine's
// input shape (chokepoint / severity / durationDays), so "Simulate Crisis"
// drives real numbers instead of only the hardcoded fallback below.
const SCENARIO_BACKEND_INPUT = {
  hormuzBlockade: { chokepoint: 'Strait of Hormuz', severity: 0.85, durationDays: 30 },
  cyberOutage: { chokepoint: 'Strait of Hormuz', severity: 0.45, durationDays: 5 },
  baseline: { chokepoint: 'Strait of Hormuz', severity: 0.05, durationDays: 1 },
};

// Hardcoded fallback targets — used only if the live backend call fails,
// identical to the original Module 2 numbers so a demo never breaks.
const FALLBACK_TARGETS = {
  hormuzBlockade: { risk: 68.4, confidence: 94.2, cost: '$142.0M' },
  cyberOutage: { risk: 52.1, confidence: 96.8, cost: '$48.5M' },
  baseline: { risk: 28.4, confidence: 99.4, cost: '$0.0M' },
};

function genId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// Best-effort: ask the real Scenario Engine for this scenario's outcome.
// Falls back to the hardcoded numbers above on any failure (offline, cold
// start, etc.) — callers never need to know which path was taken.
async function resolveScenarioTargets(scenario) {
  const fallback = FALLBACK_TARGETS[scenario.id] || FALLBACK_TARGETS.baseline;
  if (!apiService.isLiveModeAvailable) return fallback;

  try {
    const input = {
      scenarioName: scenario.title,
      ...(SCENARIO_BACKEND_INPUT[scenario.id] || SCENARIO_BACKEND_INPUT.baseline),
    };
    const { phases } = await apiService.runSimulation(input);
    const surge = phases[2] || {};
    const final = phases[3] || {};
    const brentDelta = surge.oilPriceBrent ? (surge.oilPriceBrent - 84.12).toFixed(1) : null;
    return {
      risk: final.riskScore ?? surge.riskScore ?? fallback.risk,
      confidence: final.confidence ?? fallback.confidence,
      cost: brentDelta ? `$${(Math.abs(brentDelta) * 30).toFixed(1)}M` : fallback.cost,
    };
  } catch (err) {
    console.warn('[SimulationContext] live scenario resolution failed, using fallback targets:', err.message);
    return fallback;
  }
}

export function SimulationProvider({ children }) {
  const [liveRiskScore, setLiveRiskScore] = useState(riskData.globalRiskScore);
  const [liveConfidence, setLiveConfidence] = useState(riskData.confidenceScore);
  const [liveOilPrices, setLiveOilPrices] = useState(oilPricesData);
  const [notifications, setNotifications] = useState(notificationsSeed);
  const [memoryLog, setMemoryLog] = useState(extendedMemorySeed);

  const [demoMode, setDemoMode] = useState(false);

  // Module 4.2 — when true, ambient risk/oil-price updates come from the
  // real backend's WebSocket channel (organic ingestion broadcasts) instead
  // of the client-side random walk. Mutually exclusive with demoMode.
  const [liveMode, setLiveMode] = useState(false);

  const [simulation, setSimulation] = useState({
    active: false,
    scenarioId: null,
    scenarioTitle: '',
    step: 0,
    totalSteps: 0,
    reasoningLines: [],
    typedReasoning: '',
    globeAlert: false,
    reserveTank: 100,
  });

  const demoIntervalRef = useRef(null);
  const simTimersRef = useRef([]);
  const liveSocketRef = useRef(null);

  const addNotification = useCallback((notif) => {
    setNotifications((prev) => [
      { id: genId('NTF'), unread: true, time: 'Just now', ...notif },
      ...prev,
    ].slice(0, 30));
  }, []);

  const toggleFavoriteMemory = useCallback((id) => {
    setMemoryLog((prev) =>
      prev.map((m) => (m.id === id ? { ...m, favorite: !m.favorite } : m))
    );
  }, []);

  const deleteMemory = useCallback((id) => {
    setMemoryLog((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const addMemoryEntry = useCallback((entry) => {
    setMemoryLog((prev) => [{ id: genId('SIM'), favorite: false, ...entry }, ...prev]);
  }, []);

  // Demo Mode: gentle ambient updates every few seconds, no backend required
  useEffect(() => {
    if (!demoMode) {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
      return;
    }
    demoIntervalRef.current = setInterval(() => {
      setLiveRiskScore((prev) => {
        const next = prev + (Math.random() * 2.2 - 1.1);
        return Math.max(5, Math.min(96, Number(next.toFixed(1))));
      });
      setLiveConfidence((prev) => {
        const next = prev + (Math.random() * 1.2 - 0.6);
        return Math.max(70, Math.min(99.9, Number(next.toFixed(1))));
      });
      setLiveOilPrices((prev) =>
        prev.map((p) => {
          const delta = Number((Math.random() * 0.6 - 0.3).toFixed(2));
          const nextPrice = Number((p.price + delta).toFixed(2));
          return {
            ...p,
            price: nextPrice,
            change: `${delta >= 0 ? '+' : ''}${delta.toFixed(2)}`,
            pctChange: `${delta >= 0 ? '+' : ''}${((delta / p.price) * 100).toFixed(2)}%`,
            trend: delta >= 0 ? 'up' : 'down',
            sparkline: [...p.sparkline.slice(1), nextPrice],
          };
        })
      );
      // Occasionally emit an ambient signal notification
      if (Math.random() < 0.35) {
        const ambient = [
          { title: 'Signal Feed Update', body: 'AIS satellite feed refreshed 14 vessel tracks.', severity: 'signal' },
          { title: 'Grid Telemetry Sync', body: 'Interconnector frequency holding within nominal band.', severity: 'signal' },
          { title: 'Minor AIS Divergence', body: 'Tanker course deviation flagged for review.', severity: 'warning' },
        ];
        addNotification(ambient[Math.floor(Math.random() * ambient.length)]);
      }
    }, 4000);
    return () => clearInterval(demoIntervalRef.current);
  }, [demoMode, addNotification]);

  // Live Mode (Module 4.2/4.5): subscribe to the backend's WebSocket channel.
  // `risk_update` messages come from the scheduled ingestion job in main.py
  // (every 15 min); `simulation` messages are handled separately by
  // SimulationEngine itself, so we ignore them here to avoid double-updating.
  useEffect(() => {
    if (!liveMode || !apiService.isLiveModeAvailable) return;

    liveSocketRef.current = apiService.connectLiveSocket(
      (msg) => {
        if (msg.channel !== 'risk_update') return;
        if (typeof msg.globalRiskScore === 'number') setLiveRiskScore(msg.globalRiskScore);
        if (typeof msg.confidenceScore === 'number') setLiveConfidence(msg.confidenceScore);
        addNotification({
          title: 'Live Risk Score Updated',
          body: `Global Risk Score refreshed to ${msg.globalRiskScore} (${msg.riskLevel}).`,
          severity: msg.status || 'signal',
        });
      },
      (err) => console.warn('[SimulationContext] live socket error:', err)
    );

    return () => {
      liveSocketRef.current?.close();
      liveSocketRef.current = null;
    };
  }, [liveMode, addNotification]);

  const clearSimTimers = () => {
    simTimersRef.current.forEach(clearTimeout);
    simTimersRef.current = [];
  };

  const runSimulation = useCallback(
    async (scenario) => {
      clearSimTimers();
      const lines = REASONING_LINES[scenario.id] || REASONING_LINES.baseline;
      const startRisk = liveRiskScore;
      const startConfidence = liveConfidence;

      setSimulation({
        active: true,
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        step: 0,
        totalSteps: lines.length,
        reasoningLines: lines,
        typedReasoning: '',
        globeAlert: true,
        reserveTank: 100,
      });

      addNotification({
        title: `Simulation Started: ${scenario.title}`,
        body: 'AEGIS is running a synchronized crisis response simulation.',
        severity: scenario.id === 'baseline' ? 'signal' : 'danger',
      });

      // Module 4.2 — resolve real targets from the Scenario Engine while the
      // reasoning-line animation is already playing, so there's no added
      // latency at the start of the sequence.
      const targetsPromise = resolveScenarioTargets(scenario);

      const stepDuration = 1400;
      lines.forEach((_, idx) => {
        const t = setTimeout(async () => {
          setSimulation((prev) => ({ ...prev, step: idx + 1 }));

          const targets = await targetsPromise;
          const progress = (idx + 1) / lines.length;
          setLiveRiskScore(Number((startRisk + (targets.risk - startRisk) * progress).toFixed(1)));
          setLiveConfidence(
            Number((startConfidence + (targets.confidence - startConfidence) * progress).toFixed(1))
          );
          setSimulation((prev) => ({
            ...prev,
            reserveTank: Math.max(58, 100 - progress * (scenario.id === 'baseline' ? 2 : 34)),
          }));
        }, idx * stepDuration);
        simTimersRef.current.push(t);
      });

      const finalT = setTimeout(async () => {
        const targets = await targetsPromise;
        setSimulation((prev) => ({ ...prev, active: false, globeAlert: false }));
        addMemoryEntry({
          scenario: scenario.title,
          timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
          riskScore: targets.risk,
          confidence: targets.confidence,
          costImpact: targets.cost,
          status: scenario.id === 'baseline' ? 'signal' : scenario.id === 'cyberOutage' ? 'warning' : 'danger',
          summary: scenario.recommendation || 'Simulation completed and archived to AI memory.',
        });
        addNotification({
          title: `Simulation Complete: ${scenario.title}`,
          body: 'Results archived to AI Memory. Executive recommendation updated.',
          severity: 'signal',
        });
      }, lines.length * stepDuration + 600);
      simTimersRef.current.push(finalT);
    },
    [liveRiskScore, liveConfidence, addNotification, addMemoryEntry]
  );

  useEffect(() => clearSimTimers, []);

  return (
    <SimulationContext.Provider
      value={{
        liveRiskScore,
        liveConfidence,
        liveOilPrices,
        notifications,
        setNotifications,
        addNotification,
        memoryLog,
        toggleFavoriteMemory,
        deleteMemory,
        addMemoryEntry,
        demoMode,
        setDemoMode,
        liveMode,
        setLiveMode,
        simulation,
        runSimulation,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within a SimulationProvider');
  return ctx;
}
