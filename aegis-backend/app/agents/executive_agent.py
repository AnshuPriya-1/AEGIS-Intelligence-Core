from .base_agent import BaseAgent


class ExecutiveAgent(BaseAgent):

    def __init__(self):
        super().__init__("Executive Advisor Agent")

    def run(self, context):

        return {

            "agent": self.name,

            "summary":
                f"""
Current Risk : {context['risk']['risk_level']}

Scenario : {context['scenario']['scenario']}

Reserve :

{context['reserve']['reserve_strategy']}

Recommended Suppliers :

{', '.join(context['procurement']['recommended_suppliers'])}
"""
        }