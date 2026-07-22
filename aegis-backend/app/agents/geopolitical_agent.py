from .base_agent import BaseAgent


class GeopoliticalAgent(BaseAgent):

    def __init__(self):
        super().__init__("Geopolitical Intelligence Agent")

    def run(self, data):

        risk = data.get("risk_score", 0)

        if risk > 0.75:
            level = "HIGH"

        elif risk > 0.45:
            level = "MEDIUM"

        else:
            level = "LOW"

        return {
            "agent": self.name,
            "risk_level": level,
            "message": f"Detected {level} geopolitical disruption."
        }