# AEGIS
### Autonomous Energy Governance & Intelligence System

**Predict. Protect. Power.**

*ET AI Hackathon 2.0 — Problem Statement #2: AI-Driven Energy Supply Chain Resilience for Import-Dependent Economies*

Submitted by **Anshu Priya**

---

## What This Is

India sources ~88% of its crude oil from imports, and 40–45% of that volume transits the Strait of Hormuz — a single chokepoint that geopolitical events repeatedly stress-test. The data needed to see a disruption coming already exists across sensors, price feeds, and news sources. What's missing is the intelligence layer that fuses it into a real-time risk picture and a recommended action — before the crisis, not after.

**AEGIS** is that layer: a live command-center platform that predicts supply disruption risk, models the cascading impact of a crisis scenario, ranks alternative procurement options, and generates an executive brief — all from one screen.

## Architecture

```
Global Intelligence Sources (EIA · GDELT · Shipping)
                ↓
          Data Pipeline
                ↓
      Risk Intelligence Engine  (Gradient Boosting + SHAP)
                ↓
        ┌───────┴────────┐
        ▼                ▼
  Scenario Engine   Procurement Engine
        └───────┬────────┘
                ▼
        Executive Advisor
                ↓
      Live Command Center
  (3D Globe · Alerts · Decision Comparison · PDF Brief)
```

## Repository Structure

```
AEGIS-Intelligence-Core/
├── aegis-app/        React (Vite) frontend — the live command center
├── aegis-backend/     FastAPI backend — risk model, scenario engine, data pipeline
└── README.md          You are here
```

Each folder has its own README with setup-specific details:
- [`aegis-app/README.md`](./aegis-app/README.md) — frontend setup
- [`aegis-backend/README.md`](./aegis-backend/README.md) — backend setup, model training, database schema

## Tech Stack

**Frontend:** React (Vite), Tailwind CSS, Framer Motion, Three.js + React Three Fiber + three-globe, Recharts, jsPDF

**Backend:** FastAPI, WebSockets, Redis, PostgreSQL (via Supabase)

**AI & Data:** scikit-learn (Gradient Boosting), SHAP (explainability), Pandas/NumPy (scenario cascade modeling), EIA Open Data API, GDELT Project API

## Quick Start

1. **Backend first** — see [`aegis-backend/README.md`](./aegis-backend/README.md) to set up the database, train the risk model, and start the API.
2. **Frontend** — see [`aegis-app/README.md`](./aegis-app/README.md). It runs against bundled mock data by default (`VITE_USE_MOCK_API=true`), so you can preview the full UI without the backend running. Set it to `false` once the backend is up to see live data end-to-end.

## What's Real vs. Illustrative

In the interest of transparency:
- The risk model is trained against a **documented composite proxy** (price volatility + event severity), not labeled historical disruption outcomes — real ground-truth labels for energy supply disruptions aren't publicly available, so this is a standard, disclosed approach rather than a claim of validated real-world accuracy.
- Shipping route and vessel data are **illustrative** — real-time AIS feeds are largely paywalled; the routes shown reflect real corridors (Hormuz, Red Sea) but not live vessel positions.
- Everything else — the risk score, SHAP explanations, scenario cascade math, and procurement ranking — runs on real logic against real EIA/GDELT data when the backend is connected.

## Judging Criteria Mapping

| Criterion | How AEGIS Addresses It |
|---|---|
| Innovation (25%) | Compound-risk detection + transparent scenario cascade modeling, not an LLM wrapper |
| Business Impact (25%) | Directly answers the brief's cited gaps — import dependency, SPR cover, response lag |
| Technical Excellence (20%) | Real trained model, real SHAP explainability, backtested against a historical shock window |
| Scalability (15%) | Corridor-based design generalizes to any commodity or chokepoint |
| User Experience (15%) | One coherent live command center — no page navigation, no dead ends |

## Why This Project

Before writing a line of this platform, I spent time inside Indian Oil Corporation Limited's Instrumentation department during a vocational training — watching, firsthand, how sensor data, control systems, and human judgment intersect on a live industrial floor. That's the exact gap this brief names: *"data present, but unacted upon."* AEGIS exists to close the space between the moment a sensor already knows and the moment someone acts on it in time.
