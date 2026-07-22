"""
Module 3.4 — Procurement Ranking Engine

Scores procurement_options against: price proxy, transit time (via linked
shipping_routes), route risk, and supplier reliability. Output shaped to
match procurement.json / decisions.json.
"""
from sqlalchemy.orm import Session
from app.models import ProcurementOption, ShippingRoute

WEIGHTS = {
    "price": 0.35,
    "transit": 0.20,
    "route_risk": 0.25,
    "reliability": 0.20,
}


def _normalize(values: list[float], invert: bool = False) -> list[float]:
    lo, hi = min(values), max(values)
    if hi == lo:
        return [1.0 for _ in values]
    norm = [(v - lo) / (hi - lo) for v in values]
    return [1 - n for n in norm] if invert else norm


def rank_procurement(db: Session) -> list[dict]:
    options = db.query(ProcurementOption).all()
    if not options:
        return []

    routes = {r.id: r for r in db.query(ShippingRoute).all()}

    price = [float(o.price_proxy) for o in options]
    transit = [float(routes[o.route_id].base_transit_days) if o.route_id in routes else 999 for o in options]
    route_risk = [float(routes[o.route_id].base_risk_score) if o.route_id in routes else 100 for o in options]
    reliability = [float(o.reliability_pct) for o in options]

    price_score = _normalize(price, invert=True)         # cheaper is better
    transit_score = _normalize(transit, invert=True)     # faster is better
    risk_score = _normalize(route_risk, invert=True)      # lower route risk is better
    reliability_score = _normalize(reliability, invert=False)  # higher reliability is better

    ranked = []
    for i, o in enumerate(options):
        composite = (
            price_score[i] * WEIGHTS["price"]
            + transit_score[i] * WEIGHTS["transit"]
            + risk_score[i] * WEIGHTS["route_risk"]
            + reliability_score[i] * WEIGHTS["reliability"]
        ) * 100
        ranked.append({
            "id": o.id,
            "contract": o.contract,
            "supplier": o.supplier,
            "volume": o.volume,
            "deliveryDate": o.delivery_date.isoformat() if o.delivery_date else None,
            "status": o.status,
            "priceLocked": f"${float(o.price_proxy):.2f} / bbl",
            "compositeScore": round(composite, 1),
            "scoreBreakdown": {
                "price": round(price_score[i] * 100, 1),
                "transitTime": round(transit_score[i] * 100, 1),
                "routeRisk": round(risk_score[i] * 100, 1),
                "reliability": round(reliability_score[i] * 100, 1),
            },
        })

    ranked.sort(key=lambda x: x["compositeScore"], reverse=True)
    return ranked
