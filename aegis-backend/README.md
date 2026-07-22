# AEGIS Backend

FastAPI service powering the risk model, scenario engine, procurement ranking, and executive brief data for the AEGIS frontend.

## Stack

FastAPI · WebSockets · Redis (cache) · PostgreSQL via Supabase · scikit-learn + SHAP (risk model) · EIA Open Data API + GDELT (data sources)

## Setup

### 1. Database

Create a free [Supabase](https://supabase.com) project, then run `sql/schema.sql` in its SQL editor to create the required tables. Copy the connection string it gives you.

### 2. Environment

```bash
cp .env.example .env
```

Fill in:
- `DATABASE_URL` — your Supabase connection string
- `EIA_API_KEY` — free key from [eia.gov/opendata](https://www.eia.gov/opendata/)
- `ANTHROPIC_API_KEY` — used only by the Executive Advisor layer for plain-English summaries, never for the core risk score
- `REDIS_URL` — point at a local or hosted Redis instance

### 3. Install & run

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`. Data ingestion (EIA/GDELT) runs on startup — give it a minute before training.

### 4. Train the risk model

```bash
python -m ml.train_risk_model
```

This trains the Gradient Boosting model against ingested price/event data, computes SHAP values, and runs a backtest against the historical shock window. Re-run any time new data has accumulated.

### 5. Verify

```bash
curl http://localhost:8000/api/risk
```

Should return a real JSON risk score, not a mock placeholder.

### 6. Seed procurement options

The Decision Comparison view reads from `procurement_options`, which starts empty. Insert a few rows manually via the Supabase table editor (or a seed script) before demoing — otherwise that panel will show no data.

## Project Structure

```
aegis-backend/
├── app/
│   ├── main.py                  FastAPI app + router registration
│   ├── config.py                Settings from .env
│   ├── database.py              SQLAlchemy session
│   ├── models.py                ORM models
│   ├── schemas.py                Pydantic response schemas
│   ├── websocket_manager.py      Live risk/signal broadcast
│   ├── routers/
│   │   ├── data.py               GET endpoints (risk, shap, alerts, kpis, etc.)
│   │   └── simulate.py           POST /api/simulate — scenario engine trigger
│   └── services/
│       ├── data_pipeline.py       EIA + GDELT ingestion, with synthetic fallback
│       ├── risk_engine.py         Model training, prediction, SHAP
│       ├── scenario_engine.py     Rule-based cascade modeling
│       ├── procurement_engine.py  Alternative sourcing ranking
│       └── executive_advisor.py   LLM-based plain-English summary layer
├── ml/
│   └── train_risk_model.py       Standalone training/backtest script
├── sql/
│   └── schema.sql                 Full database schema
└── requirements.txt
```

## Notes on Data Honesty

- `data_pipeline.py` falls back to a documented synthetic generator if `EIA_API_KEY` is missing or a request fails — this keeps local development and demos safe from rate limits, but means backtest numbers should be regenerated with real API keys before citing them as validated results.
- The risk model's training label is a composite proxy (price volatility + event severity), not real historical disruption ground truth. This is disclosed intentionally — see the root README's "What's Real vs. Illustrative" section.
