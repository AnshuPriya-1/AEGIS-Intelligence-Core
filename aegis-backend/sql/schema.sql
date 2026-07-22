-- AEGIS Module 3 — Database Schema (Postgres via Supabase)
-- Run this in the Supabase SQL editor, or via `psql $DATABASE_URL -f sql/schema.sql`

-- ============================================================
-- 3.6.1  risk_scores — every computed Disruption Risk Score
-- ============================================================
CREATE TABLE IF NOT EXISTS risk_scores (
    id              BIGSERIAL PRIMARY KEY,
    ts              TIMESTAMPTZ NOT NULL DEFAULT now(),
    global_score    NUMERIC(5,2) NOT NULL,
    risk_level      TEXT NOT NULL,              -- LOW / ELEVATED / HIGH / CRITICAL
    status          TEXT NOT NULL,               -- signal / warning / danger
    confidence      NUMERIC(5,2) NOT NULL,
    breakdown       JSONB NOT NULL,              -- [{category, score, status, weight}]
    factors         JSONB NOT NULL,              -- [string, ...]
    features        JSONB NOT NULL,              -- raw feature vector fed to the model
    shap_values     JSONB NOT NULL               -- [{name, value, contribution, type, importance, description}]
);
CREATE INDEX IF NOT EXISTS idx_risk_scores_ts ON risk_scores (ts DESC);

-- ============================================================
-- 3.6.2  simulations — scenario runs (powers memory / extended_memory)
-- ============================================================
CREATE TABLE IF NOT EXISTS simulations (
    id              BIGSERIAL PRIMARY KEY,
    ts              TIMESTAMPTZ NOT NULL DEFAULT now(),
    scenario        TEXT NOT NULL,
    inputs          JSONB NOT NULL,              -- {chokepoint, severity, durationDays, ...}
    outputs         JSONB NOT NULL,               -- {riskScore, sprDays, oilPriceBrent, confidence, phases:[...]}
    heuristic_tag   TEXT                          -- short natural-language rule this run reinforced/created
);
CREATE INDEX IF NOT EXISTS idx_simulations_ts ON simulations (ts DESC);

-- ============================================================
-- 3.6.3  signals — raw ingested signal/alert feed
-- ============================================================
CREATE TABLE IF NOT EXISTS signals (
    id              BIGSERIAL PRIMARY KEY,
    ts              TIMESTAMPTZ NOT NULL DEFAULT now(),
    source          TEXT NOT NULL,               -- AIS_SATELLITE_FEED / SCADA_TELEMETRY_NODE_4 / GDELT / EIA ...
    type            TEXT NOT NULL,               -- NAVIGATION / GRID_HEALTH / SECURITY / AI_ACTION / MARKET ...
    severity        TEXT NOT NULL,               -- signal / warning / danger
    message         TEXT NOT NULL,
    confidence      NUMERIC(5,2),
    coordinates     JSONB,                       -- [lat, lng] nullable
    raw_payload     JSONB                        -- original source payload for audit
);
CREATE INDEX IF NOT EXISTS idx_signals_ts ON signals (ts DESC);
CREATE INDEX IF NOT EXISTS idx_signals_type ON signals (type);

-- ============================================================
-- Supporting tables (not in the original 3 you listed, but needed
-- so every mock JSON file has a real source of truth)
-- ============================================================

-- Raw daily oil price history pulled from EIA
CREATE TABLE IF NOT EXISTS oil_prices (
    id              BIGSERIAL PRIMARY KEY,
    symbol          TEXT NOT NULL,               -- BRENT / WTI / LNG-EU / URALS
    price_date      DATE NOT NULL,
    price           NUMERIC(10,2) NOT NULL,
    UNIQUE (symbol, price_date)
);

-- GDELT geopolitical events, filtered/scored for the 2025 US-Iran window and onward
CREATE TABLE IF NOT EXISTS geo_events (
    id              BIGSERIAL PRIMARY KEY,
    event_date      TIMESTAMPTZ NOT NULL,
    actor1           TEXT,
    actor2           TEXT,
    avg_tone        NUMERIC(6,2),
    goldstein_scale NUMERIC(5,2),
    event_root_code TEXT,
    location        TEXT,
    lat             NUMERIC(9,5),
    lng             NUMERIC(9,5),
    source_url      TEXT
);
CREATE INDEX IF NOT EXISTS idx_geo_events_date ON geo_events (event_date DESC);

-- Illustrative shipping routes (disclosed as illustrative in the UI)
CREATE TABLE IF NOT EXISTS shipping_routes (
    id              TEXT PRIMARY KEY,             -- e.g. 'SA-HORMUZ-IN'
    origin          TEXT NOT NULL,
    via_chokepoint  TEXT,
    destination     TEXT NOT NULL,
    base_transit_days NUMERIC(5,1) NOT NULL,
    base_risk_score NUMERIC(5,2) NOT NULL,
    is_illustrative BOOLEAN NOT NULL DEFAULT TRUE
);

-- Procurement alternatives (source for the ranking engine)
CREATE TABLE IF NOT EXISTS procurement_options (
    id              TEXT PRIMARY KEY,             -- e.g. 'PR-901'
    contract        TEXT NOT NULL,
    supplier        TEXT NOT NULL,
    route_id        TEXT REFERENCES shipping_routes(id),
    volume          TEXT NOT NULL,
    price_proxy     NUMERIC(10,2) NOT NULL,       -- $/bbl or $/MMBtu
    reliability_pct NUMERIC(5,2) NOT NULL,
    delivery_date   DATE,
    status          TEXT NOT NULL DEFAULT 'PENDING'
);

-- Backtest results (Time Machine / predicted vs actual)
CREATE TABLE IF NOT EXISTS backtest_results (
    id              BIGSERIAL PRIMARY KEY,
    as_of           TIMESTAMPTZ NOT NULL,
    predicted_score NUMERIC(5,2) NOT NULL,
    actual_score    NUMERIC(5,2),
    confidence      NUMERIC(5,2) NOT NULL
);
