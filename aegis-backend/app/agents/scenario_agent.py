from .base_agent import BaseAgent


class ScenarioAgent(BaseAgent):

    def __init__(self):
        super().__init__("Scenario Modeller Agent")

    def run(self, data):

        risk = data["risk_score"]

        if risk > 0.75:

            scenario = "Hormuz Strait Closure"

        elif risk > 0.5:

            scenario = "Regional Conflict"

        else:

            scenario = "Normal Operations"

        return {
            "agent": self.name,
            "scenario": scenario
        }