"""
Module 3.3 — Scenario Simulation Engine

Rule-based cascade model, matching your existing simulationService.js interface
(4 phases: alert -> reroute -> price surge -> stabilization). All elasticities
below are explicitly documented constants, not learned — this is intentional:
a transparent, auditable rule engine for "what happens if X closes for Y days",
separate from the statistical risk-scoring model in risk_engine.py.
"""
from datetime import datetime
from sqlalchemy.orm import Session

from app.models import Simulation

# ---- Documented elasticities (tune these; keep them named and commented) ----
IMPORT_COST_ELASTICITY = 0.42      # % import cost increase per % risk score increase
SPR_DRAWDOWN_PER_SEVERITY_DAY = 0.35  # SPR days-of-cover lost per (severity * day)
BRENT_PASSTHROUGH_PER_RISK_POINT = 0.11  # $/bbl added to Brent per point of risk score rise

CHOKEPOINT_BASE_RISK = {
    "Strait of Hormuz": 41.8,
    "Bab-el-Mandeb": 38.0,
    "Strait of Malacca": 33.5,
}


def simulate(scenario_name: str, chokepoint: str, severity: float, duration_days: int) -> list[dict]:
    """
    severity: 0-1 (how disruptive the closure/incident is)
    duration_days: expected length of disruption
    Returns 4 phase dicts, same shape as SimulationEngine.runCinematicCrisis's onUpdate payloads.
    """
    base_risk = CHOKEPOINT_BASE_RISK.get(chokepoint, 40.0)
    severity = max(0.0, min(1.0, severity))

    phase1_risk = round(base_risk, 1)
    phase2_risk = round(base_risk + severity * 16.6, 1)
    phase3_risk = round(base_risk + severity * 26.6, 1)
    phase4_risk = phase3_risk  # stabilizes

    spr_start = 114
    spr_days = round(spr_start - SPR_DRAWDOWN_PER_SEVERITY_DAY * severity * duration_days, 0)

    brent_base = 84.12
    brent_surge = round(brent_base + BRENT_PASSTHROUGH_PER_RISK_POINT * (phase3_risk - phase1_risk) * 10, 2)

    confidence = round(96.0 - severity * 5, 1)

    phases = [
        {
            "phase": 1,
            "bannerMessage": f"CRISIS ALERT DETECTED: {scenario_name.upper()} — INITIATING SYNCHRONIZED TELEMETRY SWEEP",
            "riskScore": phase1_risk,
            "status": "danger" if phase1_risk >= 45 else "warning",
            "reasoningText": f"Analyzing SAR radar feeds from {chokepoint} corridor...",
        },
        {
            "phase": 2,
            "bannerMessage": "MARITIME CHOKEPOINT TRANSIT DISRUPTED — REROUTING TANKER FLEET",
            "riskScore": phase2_risk,
            "sprDays": spr_days + 14,  # partial draw
            "status": "danger",
            "reasoningText": "Re-evaluating tanker trajectories. Diverting via alternate corridor...",
        },
        {
            "phase": 3,
            "bannerMessage": f"BRENT CRUDE SURGING +${round(brent_surge - brent_base, 2)}/BBL — AUTONOMOUS SPR RELEASE DISPATCHED",
            "riskScore": phase3_risk,
            "sprDays": spr_days,
            "oilPriceBrent": brent_surge,
            "status": "danger",
            "reasoningText": "StrategicAnalyst AI recommending emergency draw from strategic reserve.",
        },
        {
            "phase": 4,
            "bannerMessage": "SIMULATION COMPLETE — STRATEGIC MITIGATION OPTION A RECOMMENDED",
            "riskScore": phase4_risk,
            "confidence": confidence,
            "status": "warning",
            "reasoningText": f"Mitigation active. Import cost impact ~+{round(IMPORT_COST_ELASTICITY * (phase3_risk - phase1_risk), 1)}%.",
        },
    ]
    return phases


def persist_simulation(db: Session, scenario_name: str, inputs: dict, phases: list[dict]) -> Simulation:
    sim = Simulation(
        scenario=scenario_name,
        inputs=inputs,
        outputs={"phases": phases},
        heuristic_tag=f"{inputs.get('chokepoint')} closure -> "
                       f"+${round(phases[2].get('oilPriceBrent', 0) - 84.12, 2)}/bbl Brent within simulated window",
    )
    db.add(sim)
    db.commit()
    db.refresh(sim)
    return sim
