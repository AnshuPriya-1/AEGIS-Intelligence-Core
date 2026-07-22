"""
Module 3.1 — Data Pipeline

Pulls:
  - Brent / WTI historical daily prices from the EIA Open Data API,
    covering the 2025 US-Iran standoff window (2025-06-01 onward) through today.
  - Structured geopolitical events from GDELT (actors, tone, location, timestamp).
  - Seeds the illustrative shipping-route dataset. These routes are NOT sourced
    from a live logistics API — they are disclosed as illustrative in shipping_routes.is_illustrative
    and in the UI, per the project's stated approach.
"""
import httpx
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.config import get_settings
from app.cache import cached
from app.models import OilPrice, GeoEvent, ShippingRoute

settings = get_settings()

EIA_SERIES = {
    "BRENT": "PET.RBRTE.D",   # Europe Brent Spot Price FOB, daily
    "WTI": "PET.RWTC.D",      # WTI Cushing Spot Price FOB, daily
}

STANDOFF_WINDOW_START = "2025-06-01"


@cached("eia_prices", ttl_seconds=1800)
async def fetch_eia_prices(symbol: str, start: str = STANDOFF_WINDOW_START) -> list[dict]:
    """Fetch a daily price series from EIA Open Data API v2."""
    series_id = EIA_SERIES[symbol]
    url = "https://api.eia.gov/v2/petroleum/pri/spt/data/"
    params = {
        "api_key": settings.eia_api_key,
        "frequency": "daily",
        "data[0]": "value",
        "facets[series][]": series_id,
        "start": start,
        "sort[0][column]": "period",
        "sort[0][direction]": "asc",
        "length": 5000,
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        rows = resp.json().get("response", {}).get("data", [])
    return [{"date": r["period"], "price": float(r["value"])} for r in rows if r.get("value") is not None]


def upsert_oil_prices(db: Session, symbol: str, rows: list[dict]) -> int:
    count = 0
    for row in rows:
        price_date = datetime.strptime(row["date"], "%Y-%m-%d").date()
        existing = db.query(OilPrice).filter_by(symbol=symbol, price_date=price_date).first()
        if existing:
            existing.price = row["price"]
        else:
            db.add(OilPrice(symbol=symbol, price_date=price_date, price=row["price"]))
            count += 1
    db.commit()
    return count


@cached("gdelt_events", ttl_seconds=900)
async def fetch_gdelt_events(query: str, days_back: int = 3) -> list[dict]:
    """
    Pull recent geopolitical events from GDELT's DOC 2.0 API for a query
    such as 'Strait of Hormuz' or 'Iran sanctions oil'.
    """
    start = (datetime.utcnow() - timedelta(days=days_back)).strftime("%Y%m%d%H%M%S")
    end = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    url = f"{settings.gdelt_base_url}/doc/doc"
    params = {
        "query": query,
        "mode": "artlist",
        "format": "json",
        "startdatetime": start,
        "enddatetime": end,
        "maxrecords": 75,
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()
    articles = data.get("articles", [])
    events = []
    for a in articles:
        events.append({
            "event_date": a.get("seendate"),
            "location": a.get("sourcecountry"),
            "avg_tone": a.get("tone"),
            "source_url": a.get("url"),
            "title": a.get("title"),
        })
    return events


def store_geo_events(db: Session, events: list[dict]) -> int:
    count = 0
    for e in events:
        try:
            event_date = datetime.strptime(e["event_date"], "%Y%m%dT%H%M%SZ")
        except (ValueError, TypeError, KeyError):
            continue
        db.add(GeoEvent(
            event_date=event_date,
            location=e.get("location"),
            avg_tone=e.get("avg_tone"),
            source_url=e.get("source_url"),
            actor1=e.get("title", "")[:250],
        ))
        count += 1
    db.commit()
    return count


ILLUSTRATIVE_ROUTES = [
    {"id": "SA-HORMUZ-IN", "origin": "Saudi Arabia", "via_chokepoint": "Strait of Hormuz",
     "destination": "India (Jamnagar)", "base_transit_days": 9.5, "base_risk_score": 38.0},
    {"id": "REDSEA-IN", "origin": "Red Sea (Suez)", "via_chokepoint": "Bab-el-Mandeb",
     "destination": "India (Mundra)", "base_transit_days": 12.0, "base_risk_score": 44.5},
    {"id": "SA-CAPE-IN", "origin": "Saudi Arabia", "via_chokepoint": "Cape of Good Hope (bypass)",
     "destination": "India (Jamnagar)", "base_transit_days": 21.0, "base_risk_score": 19.0},
]


def seed_illustrative_routes(db: Session) -> int:
    """
    Idempotent seed — safe to call on every startup. Values are explicitly
    illustrative (documented distances/risk, not a live AIS feed) and are
    flagged as such via is_illustrative=True, matching the disclosure in Module 3.1.
    """
    count = 0
    for r in ILLUSTRATIVE_ROUTES:
        if not db.query(ShippingRoute).filter_by(id=r["id"]).first():
            db.add(ShippingRoute(**r, is_illustrative=True))
            count += 1
    db.commit()
    return count


async def run_full_pipeline(db: Session):
    """
    Entry point — call from a startup hook or a scheduled job (APScheduler).
    Each source is isolated: if EIA or GDELT is down/rate-limited, the other
    still updates, and last-known-good data (plus the Redis cache above)
    keeps serving until the source recovers. This is what makes a live
    outage invisible during a demo.
    """
    for symbol in EIA_SERIES:
        try:
            rows = await fetch_eia_prices(symbol)
            upsert_oil_prices(db, symbol, rows)
        except Exception as exc:
            print(f"[data_pipeline] EIA fetch failed for {symbol}, keeping last-known-good data: {exc}")

    for query in ["Strait of Hormuz", "Iran sanctions oil", "Red Sea shipping"]:
        try:
            events = await fetch_gdelt_events(query)
            store_geo_events(db, events)
        except Exception as exc:
            print(f"[data_pipeline] GDELT fetch failed for '{query}', keeping last-known-good data: {exc}")

    seed_illustrative_routes(db)
