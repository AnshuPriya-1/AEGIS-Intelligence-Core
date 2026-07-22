from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.config import get_settings
from app.database import Base, engine, SessionLocal
from app.routers import data, simulate
from app.services.data_pipeline import run_full_pipeline
from app.websocket_manager import manager

settings = get_settings()

app = FastAPI(title="AEGIS Intelligence Core", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(data.router)
app.include_router(simulate.router)

scheduler = AsyncIOScheduler()


@app.on_event("startup")
async def on_startup():
    # Create tables if they don't exist yet (sql/schema.sql is the source of
    # truth for prod migrations; this is a convenience for local/dev boot)
    Base.metadata.create_all(bind=engine)

    # Scheduled ingestion — refreshes prices/events and re-broadcasts risk
    # every 15 minutes so the live signal feed has something to say even
    # with no active "Simulate Crisis" run in progress.
    scheduler.add_job(scheduled_ingestion, "interval", minutes=15, next_run_time=None)
    scheduler.start()


async def scheduled_ingestion():
    db = SessionLocal()
    try:
        await run_full_pipeline(db)
        from app.services.risk_engine import score_latest
        from app.models import RiskScore
        result = score_latest(db)
        db.add(RiskScore(
            global_score=result["globalRiskScore"], risk_level=result["riskLevel"],
            status=result["status"], confidence=result["confidenceScore"],
            breakdown=result["breakdown"], factors=result["factors"],
            features=result["_features_raw"], shap_values=result["_shap"],
        ))
        db.commit()
        await manager.broadcast({"channel": "risk_update", **{k: v for k, v in result.items() if not k.startswith("_")}})
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}
