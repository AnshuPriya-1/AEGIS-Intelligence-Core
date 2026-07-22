from .base_agent import BaseAgent


class ReserveAgent(BaseAgent):

    def __init__(self):
        super().__init__("Strategic Reserve Agent")

    def run(self, data):

        score = data["risk_score"]

        if score > 0.75:

            action = "Release 20% SPR"

        elif score > 0.5:

            action = "Increase Monitoring"

        else:

            action = "No Action"

        return {

            "agent": self.name,

            "reserve_strategy": action
        }