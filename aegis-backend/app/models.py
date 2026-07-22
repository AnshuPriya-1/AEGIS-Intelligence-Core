from sqlalchemy import Column, BigInteger, Text, Numeric, TIMESTAMP, Boolean, Date, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(BigInteger, primary_key=True)
    email = Column(Text, nullable=False, unique=True, index=True)
    hashed_password = Column(Text, nullable=False)
    name = Column(Text, nullable=False)
    role = Column(Text, nullable=False, default="Strategic Analyst")
    department = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class RiskScore(Base):
    __tablename__ = "risk_scores"
    id = Column(BigInteger, primary_key=True)
    ts = Column(TIMESTAMP(timezone=True), server_default=func.now())
    global_score = Column(Numeric(5, 2), nullable=False)
    risk_level = Column(Text, nullable=False)
    status = Column(Text, nullable=False)
    confidence = Column(Numeric(5, 2), nullable=False)
    breakdown = Column(JSONB, nullable=False)
    factors = Column(JSONB, nullable=False)
    features = Column(JSONB, nullable=False)
    shap_values = Column(JSONB, nullable=False)


class Simulation(Base):
    __tablename__ = "simulations"
    id = Column(BigInteger, primary_key=True)
    ts = Column(TIMESTAMP(timezone=True), server_default=func.now())
    scenario = Column(Text, nullable=False)
    inputs = Column(JSONB, nullable=False)
    outputs = Column(JSONB, nullable=False)
    heuristic_tag = Column(Text)


class Signal(Base):
    __tablename__ = "signals"
    id = Column(BigInteger, primary_key=True)
    ts = Column(TIMESTAMP(timezone=True), server_default=func.now())
    source = Column(Text, nullable=False)
    type = Column(Text, nullable=False)
    severity = Column(Text, nullable=False)
    message = Column(Text, nullable=False)
    confidence = Column(Numeric(5, 2))
    coordinates = Column(JSONB)
    raw_payload = Column(JSONB)


class OilPrice(Base):
    __tablename__ = "oil_prices"
    id = Column(BigInteger, primary_key=True)
    symbol = Column(Text, nullable=False)
    price_date = Column(Date, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)


class GeoEvent(Base):
    __tablename__ = "geo_events"
    id = Column(BigInteger, primary_key=True)
    event_date = Column(TIMESTAMP(timezone=True), nullable=False)
    actor1 = Column(Text)
    actor2 = Column(Text)
    avg_tone = Column(Numeric(6, 2))
    goldstein_scale = Column(Numeric(5, 2))
    event_root_code = Column(Text)
    location = Column(Text)
    lat = Column(Numeric(9, 5))
    lng = Column(Numeric(9, 5))
    source_url = Column(Text)


class ShippingRoute(Base):
    __tablename__ = "shipping_routes"
    id = Column(Text, primary_key=True)
    origin = Column(Text, nullable=False)
    via_chokepoint = Column(Text)
    destination = Column(Text, nullable=False)
    base_transit_days = Column(Numeric(5, 1), nullable=False)
    base_risk_score = Column(Numeric(5, 2), nullable=False)
    is_illustrative = Column(Boolean, nullable=False, default=True)


class ProcurementOption(Base):
    __tablename__ = "procurement_options"
    id = Column(Text, primary_key=True)
    contract = Column(Text, nullable=False)
    supplier = Column(Text, nullable=False)
    route_id = Column(Text, ForeignKey("shipping_routes.id"))
    volume = Column(Text, nullable=False)
    price_proxy = Column(Numeric(10, 2), nullable=False)
    reliability_pct = Column(Numeric(5, 2), nullable=False)
    delivery_date = Column(Date)
    status = Column(Text, nullable=False, default="PENDING")


class BacktestResult(Base):
    __tablename__ = "backtest_results"
    id = Column(BigInteger, primary_key=True)
    as_of = Column(TIMESTAMP(timezone=True), nullable=False)
    predicted_score = Column(Numeric(5, 2), nullable=False)
    actual_score = Column(Numeric(5, 2))
    confidence = Column(Numeric(5, 2), nullable=False)
