from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.cache import cached
from app.models import RiskScore, Signal, OilPrice, BacktestResult, ProcurementOption
from app.services.risk_engine import score_latest, load_model
from app.services.procurement_engine import rank_procurement
from app.services.executive_advisor import generate_executive_brief, compute_kpis

router = APIRouter(prefix="/api", tags=["data"])


# ---------------- /api/risk ----------------
@router.get("/risk")
def get_risk(db: Session = Depends(get_db)):
    latest = db.query(RiskScore).order_by(desc(RiskScore.ts)).first()
    if not latest:
        result = score_latest(db)
        row = RiskScore(
            global_score=result["globalRiskScore"], risk_level=result["riskLevel"],
            status=result["status"], confidence=result["confidenceScore"],
            breakdown=result["breakdown"], factors=result["factors"],
            features=result["_features_raw"], shap_values=result["_shap"],
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        latest = row

    return {
        "globalRiskScore": float(latest.global_score),
        "riskLevel": latest.risk_level,
        "status": latest.status,
        "confidenceScore": float(latest.confidence),
        "lastUpdated": latest.ts.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "breakdown": latest.breakdown,
        "factors": latest.factors,
    }


# ---------------- /api/shap ----------------
@router.get("/shap")
def get_shap(db: Session = Depends(get_db)):
    latest = db.query(RiskScore).order_by(desc(RiskScore.ts)).first()
    if not latest:
        result = score_latest(db)
        return result["_shap"]
    return latest.shap_values


# ---------------- /api/procurement ----------------
@router.get("/procurement")
def get_procurement(db: Session = Depends(get_db)):
    return rank_procurement(db)


# decisions.json is the same ranked procurement output, framed as decisions —
# reuse the same computation rather than duplicating logic
@router.get("/decisions")
def get_decisions(db: Session = Depends(get_db)):
    ranked = rank_procurement(db)
    return [{
        "id": r["id"],
        "decision": f"Recommend {r['supplier']} — {r['contract']}",
        "score": r["compositeScore"],
        "rationale": r["scoreBreakdown"],
    } for r in ranked]


# ---------------- /api/timeline (backtest predicted vs actual) ----------------
@router.get("/timeline")
def get_timeline(db: Session = Depends(get_db)):
    rows = db.query(BacktestResult).order_by(BacktestResult.as_of).all()
    return [{
        "time": r.as_of.strftime("%H:%M"),
        "confidence": float(r.confidence),
        "riskScore": float(r.predicted_score),
        "actualScore": float(r.actual_score) if r.actual_score is not None else None,
    } for r in rows]


# ---------------- /api/memory ----------------
@router.get("/memory")
def get_memory(db: Session = Depends(get_db)):
    from app.models import Simulation
    sims = db.query(Simulation).order_by(desc(Simulation.ts)).limit(25).all()
    heuristics = list({s.heuristic_tag for s in sims if s.heuristic_tag})
    return {
        "systemMemory": {
            "totalVectorEmbeddings": len(sims) * 512,  # placeholder proxy until embeddings are wired up
            "lastKnowledgeGraphSync": sims[0].ts.strftime("%Y-%m-%d %H:%M UTC") if sims else None,
            "activeHeuristics": heuristics[:10],
        }
    }


@router.get("/extended_memory")
def get_extended_memory(db: Session = Depends(get_db)):
    from app.models import Simulation
    sims = db.query(Simulation).order_by(desc(Simulation.ts)).limit(100).all()
    return [{"scenario": s.scenario, "ts": s.ts.isoformat(), "inputs": s.inputs, "outputs": s.outputs} for s in sims]


# ---------------- /api/signals & /api/alerts ----------------
@router.get("/signals")
def get_signals(db: Session = Depends(get_db)):
    rows = db.query(Signal).order_by(desc(Signal.ts)).limit(50).all()
    return [{
        "id": f"SIG-{r.id}",
        "timestamp": r.ts.strftime("%H:%M:%S"),
        "source": r.source,
        "signal": r.message,
        "confidence": float(r.confidence) if r.confidence is not None else None,
        "type": r.type,
        "status": r.severity,
    } for r in rows]


@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    rows = db.query(Signal).filter(Signal.severity.in_(["warning", "danger"])).order_by(desc(Signal.ts)).limit(20).all()
    return [{
        "id": f"ALT-{r.id}",
        "timestamp": r.ts.strftime("%H:%M:%S UTC"),
        "severity": r.severity,
        "title": r.message[:80],
        "location": (r.raw_payload or {}).get("location", "Unknown"),
        "coordinates": r.coordinates or [0, 0],
        "chokepoint": (r.raw_payload or {}).get("chokepoint", ""),
        "impact": "HIGH" if r.severity == "danger" else "MEDIUM",
        "summary": r.message,
        "agentAssigned": r.source,
        "status": "ACTIVE_INVESTIGATION" if r.severity == "danger" else "MONITORING",
    } for r in rows]


# ---------------- /api/oil-prices ----------------
@router.get("/oil-prices")
@cached("oil_prices", ttl_seconds=180)
async def get_oil_prices(db: Session = Depends(get_db)):
    symbols = {"BRENT": "Brent Crude", "WTI": "WTI Crude"}
    out = []
    for symbol, name in symbols.items():
        rows = db.query(OilPrice).filter(OilPrice.symbol == symbol).order_by(desc(OilPrice.price_date)).limit(6).all()
        rows = list(reversed(rows))
        if len(rows) < 2:
            continue
        latest, prev = rows[-1], rows[-2]
        change = float(latest.price) - float(prev.price)
        out.append({
            "symbol": symbol,
            "name": name,
            "price": float(latest.price),
            "change": f"{change:+.2f}",
            "pctChange": f"{(change / float(prev.price) * 100):+.2f}%",
            "trend": "up" if change > 0 else ("down" if change < 0 else "neutral"),
            "status": "warning" if abs(change) > 1.5 else "signal",
            "sparkline": [float(r.price) for r in rows],
        })
    return out


# ---------------- /api/kpis ----------------
@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db)):
    risk = get_risk(db)
    latest_spr = 114.0  # replace with a live SPR feed if/when available; scenario engine overrides during sims
    latest_brent_rows = db.query(OilPrice).filter(OilPrice.symbol == "BRENT").order_by(desc(OilPrice.price_date)).first()
    latest_brent = float(latest_brent_rows.price) if latest_brent_rows else 84.12
    return compute_kpis(risk, latest_spr, latest_brent)


# ---------------- /api/executive-brief ----------------
@router.get("/executive-brief")
def get_executive_brief(db: Session = Depends(get_db)):
    risk = get_risk(db)
    shap = get_shap(db)
    procurement = rank_procurement(db)
    brief = generate_executive_brief(risk, shap, None, procurement)
    return {"brief": brief}
