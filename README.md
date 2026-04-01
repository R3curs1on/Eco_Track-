# 🌿 EcoTrack — Ecosystem Management System

EcoTrack is a full-stack habitat-management toolkit that keeps a MongoDB-backed species catalog in sync with a Vite-powered dashboard, Cytoscape food-web visualization, and simulation sandbox. The goal is to surface structural risks (cycles, keystone loss, poor connectivity) while letting you manage the live dataset and experiment with removals before applying them to the database.

## Highlights
- **Live dashboard:** `client/pages/dashboard.js` rebuilds the graph on every refresh, shows the health score, counts of critical/extinct species, and renders Cytoscape with cycle/keystone styling plus a species info panel.
- **Food-web intelligence:** `FoodChain` (graphlib) tracks predator→prey edges, runs DFS cycle detection, Tarjan articulation points/bridges, and calculates a Food Chain Involvement. `EcosystemAnalyzer` feeds this data into the UI.
- **Ecosystem health score:** `EcosystemScore` uses Shannon diversity, trophic pyramid balance, and connectivity density (0.4/0.3/0.3 weights) to compute a 0–100 score and reports the weakest metric.
- **Control panel CRUD:** `client/pages/controlPanel.js` exposes add/update/remove forms for animals/plants, normalizes requests through `ApiService`, and publishes `BroadcastChannel` events so the dashboard and sandbox refresh automatically.
- **Sandbox simulator:** `SandboxMode` deep-clones `FoodChain`, runs `simulateRemoval` with BFS impact propagation, and only writes back via `applySandboxSession` when the user explicitly applies the scenario.
- **Critical-population queue:** `CriticalPopulation` keeps a min-heap (heap-js) of endangered species for alerts and the dashboard card.

## Architecture Overview
- **Client (Vite + Vanilla JS):** `pages/` owns entry points, `core/` hosts data structures (Species, FoodChain, EcosystemScore, SandboxMode), `graph/RenderCytoscape.js` styles the Cyto graph, and `services/EcosystemEvents.js` wires BroadcastChannel events.
- **Server (Express + Mongoose):** [`server/server.js`](server/server.js) exposes `/api/health` plus `/api/species` CRUD routes declared in [`server/routes/species.js`](server/routes/species.js) with payload normalization and shared `sendServerError`.
- **Data pipeline:** `client/core/EcosystemRepository.js` seeds `SAMPLE_SPECIES` (grass, berry bush, oak tree, rabbit, deer, fox, wolf, hawk) when MongoDB is empty, fetches everything via `ApiService`, hydrates `FoodChain`/`CriticalPopulation`, and clones data for UI reuse.
- **Graph algorithms:** `client/graph/TarjanAlgo.js` finds articulation points/bridges for keystone detection (`FoodChain.findKeystoneSpecies`). `simulateRemoval` runs BFS outward from the removed species, adjusting populations by distance and direction before delivering impact results to the UI.

## Project Layout

```
EcoTrack/
├── client/             # Vite frontend: pages, core logic, graph helpers, styles, UI bits
├── server/             # Express + Mongoose app with species routes
├── scripts/            # Utility scripts (tarjan smoke test)
├── package.json        # npm scripts & dependencies
├── README.md
└── ToDo.md            # Development roadmap
```

## Getting Started

### Prerequisites
- Node.js 16+
- npm
- MongoDB (local or remote)

### Environment
Create a `.env` in the repo root (defaults shown):
```
MONGO_URI=mongodb://127.0.0.1:27017/ecotrack
PORT=5000
```

### Install & Run
```
npm install
sudo systemctl start mongod      # or run your MongoDB server however you prefer
npm run dev:full                 # runs `npm run server` + waits for port 5000 && `npm run dev`
```
If you prefer separate terminals:
```
npm run server
npm run dev
```
Vite runs on port 3000 (auto-fallback to 3001+ if occupied); Express listens on `PORT`.

### Tarjan Smoke Test
```
npm run tarjan:smoke
```
Runs `scripts/tarjan-smoke.mjs` (via `client/graph/TarjanAlgo.js`) to verify articulation-point logic.

## Frontend Routes
- `/` → Dashboard with stats, Cytoscape visualization, cycle/keystone panels, and species cards.
- `/ControlPanel.html` → CRUD forms for animals/plants and removal flows; publishes broadcasts for other tabs.
- `/Simulation.html` → Sandbox simulator and live graph comparison; apply button writes removal impacts after confirmation.

## API Reference (`/api` prefix)
- `GET /health` — Simple `{ ok: true }` health check.
- `GET /species` — Returns all species sorted by name.
- `GET /species/:name` — Lookup by normalized lowercase name.
- `POST /species` — Add species; payload is normalized and validated per `Species` schema.
- `PUT /species/:name` — Update by name; payload excludes the `name` field to keep the identifier stable.
- `DELETE /species/:name` — Remove by name.

## Scripts
- `npm run dev` — Start Vite dev server.
- `npm run server` — Start Express server with nodemon for hot reloads.
- `npm run dev:full` — `concurrently` run server + wait-on + Vite.
- `npm run tarjan:smoke` — Exercises Tarjan’s articulation/bridge finder via `scripts/tarjan-smoke.mjs`.

## Data & Analysis Notes
- `client/core/speciesUtils.js` normalizes names, infers trophic levels, and flags species as animal/plant. All species names are stored lowercase to keep Mongo queries consistent.
- `CriticalPopulation` (heap-js) tracks low-population or “critical” species; alerts render on the dashboard and update automatically after CRUD actions.
- `EcosystemScore` computes a weighted score from Shannon diversity, trophic balance, and connectivity density. The dashboard shows each metric (0–100) and highlights the weakest contributor.
- `FoodChain.simulateRemoval` clones the graph, spreads impact via BFS, removes the target node in the clone, and returns `results` with before/after populations plus total population loss.
- `FoodChain.findCycles` uses DFS with 3-color marking to highlight feedback loops; `RenderCytoscape` paints cycle nodes with orange borders, keystones with red, and adjusts node sizes by population.
- `FoodChain.computeInvolvementIndex` reports the percentage of edges incident to each species, surfaced in the species info panel.
- `EcosystemAnalyzer` ties together cycles, keystone ranking, robustness, and score data for the UI.

## Sandbox Simulation
- Every sandbox run (Simulation page) deep-clones the live graph/state so MongoDB remains untouched until the user hits **Apply to Ecosystem**.
- `SandboxMode.createSandboxSession` packages the simulated graph, reaction results, and timestamps.
- `SandboxMode.applySandboxSession` removes the targeted species and updates impacted species via `ApiService` calls before marking the session as applied.
- The simulation results list classifies impacts (`high`, `medium`, `low`) based on population loss while the UI still renders the Cytoscape view with sandbox data.

## Notifications & Synchronization
- `client/ui/notifications.js` shows success/error toasts for API operations and sandbox actions.
- `EcosystemEvents` uses `BroadcastChannel` (when available) so the dashboard, control panel, and sandbox tabs refresh as soon as one of them mutates the dataset.

## Additional Notes
- `RenderCytoscape` targets the `#cy` container with a `cose` layout, maps node size to population, and supports direct tap callbacks for populating the species info panel.
- The control panel populates predator dropdowns from the live dataset and toggles animal vs. plant fields inside the update form.
- Sample data (`SAMPLE_SPECIES`) includes producers and carnivores to bootstrap visual analysis if the Mongo collection is empty.
- All API fetches are wrapped by `ApiService.requestJson`, which retries once and surfaces server errors through structured payloads.

## License
MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.