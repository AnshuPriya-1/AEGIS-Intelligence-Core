from pydantic import BaseModel
from typing import Optional


# ---- risk.json ----
class RiskBreakdownItem(BaseModel):
    category: str
    score: float
    status: str
    weight: str


class RiskResponse(BaseModel):
    globalRiskScore: float
    riskLevel: str
    status: str
    confidenceScore: float
    lastUpdated: str
    breakdown: list[RiskBreakdownItem]
    factors: list[str]


# ---- shap.json ----
class ShapFeature(BaseModel):
    name: str
    value: str
    contribution: float
    type: str
    importance: int
    description: str


class ShapResponse(BaseModel):
    summary: str
    baseRiskScore: float
    predictedRiskScore: float
    features: list[ShapFeature]


# ---- procurement.json ----
class ProcurementItem(BaseModel):
    id: str
    contract: str
    supplier: str
    volume: str
    deliveryDate: str
    status: str
    priceLocked: str


# ---- timeline.json ----
class TimelinePoint(BaseModel):
    time: str
    confidence: float
    riskScore: float


# ---- signals.json ----
class SignalItem(BaseModel):
    id: str
    timestamp: str
    source: str
    signal: str
    confidence: float
    type: str
    status: str


# ---- alerts.json ----
class AlertItem(BaseModel):
    id: str
    timestamp: str
    severity: str
    title: str
    location: str
    coordinates: list[float]
    chokepoint: str
    impact: str
    summary: str
    agentAssigned: str
    status: str


# ---- kpis.json ----
class KpiItem(BaseModel):
    value: float
    unit: str
    change: str
    trend: str
    status: str
    target: str
    history: list[float]


# ---- oil_prices.json ----
class OilPriceItem(BaseModel):
    symbol: str
    name: str
    price: float
    change: str
    pctChange: str
    trend: str
    status: str
    sparkline: list[float]


# ---- simulate (scenario input / phase output) ----
class ScenarioInput(BaseModel):
    scenarioName: str = "Strait of Hormuz Closure"
    chokepoint: str = "Strait of Hormuz"
    severity: float = 0.7          # 0-1
    durationDays: int = 14


class ScenarioPhase(BaseModel):
    phase: int
    bannerMessage: str
    riskScore: float
    status: str
    reasoningText: str
    sprDays: Optional[float] = None
    oilPriceBrent: Optional[float] = None
    confidence: Optional[float] = None
