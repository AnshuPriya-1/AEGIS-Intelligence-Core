from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.agents.orchestrator import AgentOrchestrator
from app.database import SessionLocal

router = APIRouter(prefix="/api/agents", tags=["Agents"])

orchestrator = AgentOrchestrator()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/run")
def run_agents(
    payload: Optional[dict] = None,
    db: Session = Depends(get_db)
):
    return orchestrator.execute(db, payload)