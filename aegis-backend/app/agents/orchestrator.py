from app.models import OilPrice
from .geopolitical_agent import GeopoliticalAgent
from .scenario_agent import ScenarioAgent
from .procurement_agent import ProcurementAgent
from .reserve_agent import ReserveAgent
from .executive_agent import ExecutiveAgent

from app.services.risk_engine import score_latest


class AgentOrchestrator:

    def __init__(self):
        self.geo = GeopoliticalAgent()
        self.scenario = ScenarioAgent()
        self.procurement = ProcurementAgent()
        self.reserve = ReserveAgent()
        self.executive = ExecutiveAgent()

    def execute(self, db, data=None):
        # Fetch latest risk from the existing Risk Engine
        latest_risk = score_latest(db)

        # Fetch latest Brent oil price
        latest_price = (
        db.query(OilPrice)
            .filter(OilPrice.symbol == "BRENT")
            .order_by(OilPrice.price_date.desc())
            .first()
        )

        # Build payload automatically
        payload = {
            "risk_score": latest_risk["globalRiskScore"],
            "risk_level": latest_risk["riskLevel"],
            "oil_price": latest_price.price if latest_price else 85,
            "region": "Middle East"
        }

        # If user supplied anything, let it override defaults
        if data:
            payload.update(data)

        geo = self.geo.run(payload)
        scenario = self.scenario.run(payload)
        procurement = self.procurement.run(payload)
        reserve = self.reserve.run(payload)

        executive = self.executive.run({
            "risk": geo,
            "scenario": scenario,
            "procurement": procurement,
            "reserve": reserve
        })

        return {
            "workflow": [
                geo,
                scenario,
                procurement,
                reserve,
                executive
            ],
            "final_summary": executive
        }