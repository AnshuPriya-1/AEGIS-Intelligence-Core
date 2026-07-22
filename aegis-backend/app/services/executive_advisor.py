"""
Module 3.5 — Executive Advisor Layer

This is the ONLY place in the backend that calls an LLM. It takes the
already-computed, deterministic outputs of the Risk / Scenario / Procurement
engines and turns them into plain-English reasoning for the Executive Brief.
It does not invent numbers — every figure quoted to the model is passed in,
and the prompt instructs it to reason over them, not fabricate new ones.
"""
import anthropic
from app.config import get_settings

settings = get_settings()
_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

SYSTEM_PROMPT = """You are AEGIS's Executive Advisor. You write short, decisive briefs for
energy-security decision-makers. You are given real computed figures (risk score, SHAP
drivers, scenario outputs, procurement rankings) — use ONLY those figures. Never invent
numbers. Be concrete and directive, not vague. Output 3 short paragraphs:
1) Situation summary, 2) Key driver(s) and why, 3) Recommended action with a stated tradeoff.
Keep total output under 180 words."""


def generate_executive_brief(risk: dict, shap: dict, scenario: list[dict] | None, procurement: list[dict]) -> str:
    top_procurement = procurement[0] if procurement else None
    context = {
        "riskScore": risk["globalRiskScore"],
        "riskLevel": risk["riskLevel"],
        "confidence": risk["confidenceScore"],
        "topShapDrivers": shap["features"][:3],
        "scenarioLastPhase": scenario[-1] if scenario else None,
        "topProcurementOption": top_procurement,
    }

    message = _client.messages.create(
        model=settings.anthropic_model,
        max_tokens=400,
        system=SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": f"Computed system state (ground truth, do not alter numbers):\n{context}\n\n"
                       f"Write the Executive Brief."
        }],
    )
    return "".join(block.text for block in message.content if block.type == "text")


def compute_kpis(risk: dict, latest_spr_days: float, latest_brent: float) -> dict:
    """Deterministic KPI computation — matches kpis.json shape. No LLM involved here."""
    def entry(value, unit, change, trend, status, target, history):
        return {"value": value, "unit": unit, "change": change, "trend": trend,
                "status": status, "target": target, "history": history}

    return {
        "nationalReserveLevel": entry(round(latest_spr_days / 120 * 100, 1), "%", "n/a", "neutral",
                                       "signal" if latest_spr_days > 90 else "warning", "85.0%", []),
        "importRiskIndex": entry(risk["globalRiskScore"], "RISK", "n/a",
                                  "up" if risk["status"] == "danger" else "down",
                                  risk["status"], "<30.0", []),
        "sprDaysRemaining": entry(latest_spr_days, "DAYS", "n/a",
                                   "down" if latest_spr_days < 100 else "up",
                                   "signal" if latest_spr_days > 90 else "danger", ">90 DAYS", []),
    }
