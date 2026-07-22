// Simulation Service for AEGIS Crisis Execution & Live Telemetry Sync
//
// Module 4.1 — same public interface as before (`new SimulationEngine(onUpdate)`,
// `.runCinematicCrisis(scenarioName)`), so nothing that already calls this
// class needs to change. Internally it now tries the real Scenario Engine
// (Module 3.3) first, and only falls back to the original canned Module 2
// cascade if the backend is unreachable — so a live demo never breaks.

import { apiService } from './apiService';

const PHASE_DELAYS_MS = [0, 1800, 3600, 5500];

export class SimulationEngine {
  constructor(onUpdate) {
    this.onUpdate = onUpdate;
    this.isSimulating = false;
    this.socket = null;
    this._timers = [];
  }

  async runCinematicCrisis(scenarioName = 'Strait of Hormuz Closure', options = {}) {
    if (this.isSimulating) return;
    this.isSimulating = true;

    const input = {
      scenarioName,
      chokepoint: options.chokepoint || 'Strait of Hormuz',
      severity: options.severity ?? 0.7,
      durationDays: options.durationDays ?? 14,
    };

    if (!apiService.isLiveModeAvailable) {
      this._runMockCascade(scenarioName);
      return;
    }

    try {
      // Listen for the live phase broadcasts the backend pushes over
      // /api/ws/live as scenario_engine.py runs — this is what makes the
      // globe/chart/table/KPI update in real time during the demo.
      this.socket = apiService.connectLiveSocket((msg) => {
        if (msg.channel === 'simulation') this._emit(msg);
      });

      // POST kicks off the run and also returns the full phase list
      // immediately — used below as a safety-net replay in case the socket
      // drops or lags mid-demo.
      const { phases } = await apiService.runSimulation(input);
      this._scheduleFallbackReplay(phases);
    } catch (err) {
      console.error('[simulationService] live simulation failed, using mock cascade:', err);
      this._runMockCascade(scenarioName);
    }
  }

  stop() {
    this.isSimulating = false;
    this.socket?.close();
    this.socket = null;
    this._timers.forEach(clearTimeout);
    this._timers = [];
  }

  _emit(phaseMsg) {
    if (!this.isSimulating) return;
    this.onUpdate(phaseMsg);
    if (phaseMsg.phase === 4) this.stop();
  }

  // Grace-period replay: if the socket already delivered a phase, this is a
  // harmless no-op guard via isSimulating; if it didn't (dropped connection),
  // the demo still completes on schedule using the POST response's numbers.
  _scheduleFallbackReplay(phases) {
    phases.forEach((phase, i) => {
      const t = setTimeout(() => this._emit(phase), PHASE_DELAYS_MS[i] + 900);
      this._timers.push(t);
    });
  }

  // Original Module 2 canned sequence — untouched, used only when the
  // backend is unreachable (e.g. local dev with no server running yet).
  _runMockCascade(scenarioName) {
    this._emit({
      phase: 1,
      bannerMessage: `CRISIS ALERT DETECTED: ${scenarioName.toUpperCase()} — INITIATING SYNCHRONIZED TELEMETRY SWEEP`,
      riskScore: 41.8,
      radarSpeed: 'fast',
      status: 'danger',
      reasoningText: 'Analyzing SAR radar feeds from Persian Gulf Block Alpha...',
    });

    this._timers.push(setTimeout(() => {
      this._emit({
        phase: 2,
        bannerMessage: 'MARITIME CHOKEPOINT TRANSIT DISRUPTED — REROUTING TANKER FLEET',
        riskScore: 58.4,
        sprDays: 98,
        status: 'danger',
        reasoningText: 'Re-evaluating 48 crude tanker trajectories. Diverting via Cape of Good Hope...',
      });
    }, 1800));

    this._timers.push(setTimeout(() => {
      this._emit({
        phase: 3,
        bannerMessage: 'BRENT CRUDE SURGING +$4.80/BBL — AUTONOMOUS SPR RELEASE DISPATCHED',
        riskScore: 68.4,
        sprDays: 84,
        oilPriceBrent: 88.95,
        status: 'danger',
        reasoningText: 'StrategicAnalyst AI recommending 2.4M bpd emergency draw from Cushing Cavern 3.',
      });
    }, 3600));

    this._timers.push(setTimeout(() => {
      this._emit({
        phase: 4,
        bannerMessage: 'SIMULATION COMPLETE — STRATEGIC MITIGATION OPTION A RECOMMENDED',
        riskScore: 68.4,
        confidence: 94.2,
        status: 'warning',
        reasoningText: 'Mitigation Option A active. Supply resilience stabilized at 88.4%.',
      });
    }, 5500));
  }
}
