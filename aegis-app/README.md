# AEGIS Frontend

React (Vite) command-center interface — 3D globe, live risk dashboard, scenario simulation, decision comparison, and executive brief generation.

## Stack

React (Vite) · Tailwind CSS · Framer Motion · Three.js + React Three Fiber + three-globe · Recharts · jsPDF

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

By default (`VITE_USE_MOCK_API=true`), the app runs entirely on bundled mock JSON data in `src/data/` — no backend required. This is the safest mode for previewing the UI or as a live-demo fallback.

To connect the real backend:

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/api/ws/live
```

If the backend is unreachable, `apiService.js` automatically falls back to mock data rather than breaking the app — safe to leave `false` even if the backend connection is unreliable.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |

## Project Structure

```
src/
├── components/
│   ├── atoms/         Buttons, badges, status dots, skeletons
│   ├── molecules/      Metric tiles, risk gauge, world clock
│   └── organisms/      Globe, alert center, signal feed, SHAP panel,
│                        decision comparison, time machine, executive
│                        brief modal, etc.
├── pages/              Landing, login, startup loader, dashboard
├── layouts/             DashboardLayout (header, sidebar, global modals)
├── context/             Theme, App, and Simulation state
├── services/
│   ├── mockApiService.js  Reads from src/data/*.json
│   └── apiService.js       Real-backend calls with automatic mock fallback
└── data/                 Bundled mock JSON — same shape as backend responses
```

## Notes

- The dashboard is a single continuous screen — sidebar navigation scrolls to a section rather than swapping in a separate page, so nothing is ever rendered twice and the live demo never navigates away from one view.
- The Executive Brief button generates a real PDF client-side from live risk/alert/KPI data — it is not a placeholder animation.
