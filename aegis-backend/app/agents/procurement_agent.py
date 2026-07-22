from .base_agent import BaseAgent


class ProcurementAgent(BaseAgent):

    def __init__(self):
        super().__init__("Adaptive Procurement Agent")

    def run(self, data):

        suppliers = [
            "Saudi Arabia",
            "UAE",
            "USA",
            "Nigeria",
            "Brazil"
        ]

        return {
            "agent": self.name,
            "recommended_suppliers": suppliers
        }