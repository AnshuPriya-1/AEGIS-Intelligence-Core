import asyncio
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.database import get_db, SessionLocal
from app.schemas import ScenarioInput
from app.services.scenario_engine import simulate, persist_simulation
from app.websocket_manager import manager

router = APIRouter(prefix="/api", tags=["simulate"])

# Mirrors the timing of simulationService.js's setTimeout phases (in seconds)
PHASE_DELAYS = [0, 1.8, 3.6, 5.5]


@router.post("/simulate")
async def run_simulation(input: ScenarioInput, db: Session = Depends(get_db)):
    """
    Kicks off the same 4-phase cascade the frontend's SimulationEngine already
    renders, except every number now comes from scenario_engine.simulate()
    instead of being hardcoded. Also broadcasts each phase over the WebSocket
    channel as it "happens" (matching the cinematic timing), and persists the
    run to `simulations` so it powers /api/memory afterward.
    """
    phases = simulate(input.scenarioName, input.chokepoint, input.severity, input.durationDays)
    persist_simulation(db, input.scenarioName, input.model_dump(), phases)

    asyncio.create_task(_broadcast_phases(phases))

    return {"phases": phases}


async def _broadcast_phases(phases: list[dict]):
    """Sleeps between phases using the gaps between PHASE_DELAYS, then broadcasts each phase."""
    previous = 0.0
    for phase, absolute_delay in zip(phases, PHASE_DELAYS):
        await asyncio.sleep(absolute_delay - previous)
        previous = absolute_delay
        await manager.broadcast({"channel": "simulation", **phase})


@router.websocket("/ws/live")
async def live_feed(ws: WebSocket):
    """
    Live risk score + signal feed updates. Frontend connects once and receives
    both organic signal updates (pushed from ingestion jobs, see main.py's
    scheduler) and simulation phase broadcasts on the same channel, filtered
    by the `channel` field in each message.
    """
    await manager.connect(ws)
    try:
        while True:
            await ws.receive_text()  # keep-alive / ignore client pings
    except WebSocketDisconnect:
        manager.disconnect(ws)
