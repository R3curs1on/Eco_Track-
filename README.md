# 🌿 EcoTrack - Ecosystem Management System

EcoTrack is a full-stack ecosystem management app for tracking species, monitoring critical populations, visualizing food-chain relationships, and simulating species removal impact.

It uses:
- **Frontend:** Vite + Vanilla JS
- **Backend:** Express + MongoDB (Mongoose)
- **Graph rendering:** Cytoscape.js

---

## ✨ Current Features

- Add/remove species from a MongoDB-backed dataset
- Update existing species from the control panel without changing the name
- Real-time species dashboard
- Critical population alerts using a priority queue
- Directed food-chain graph visualization with Cytoscape
- Cycle detection with warning panel and highlighted cycle nodes
- Keystone-species discovery with ranked impact table
- Sandbox species-removal simulation with explicit "Apply To Ecosystem"
- Ecosystem health score, statistics bar, and node info side panel

---

## 🧱 Data Structures & Core Logic

1. **Priority Queue (Min Heap)**  
   - Implemented in `client/core/CriticalPopulation.js`
   - Tracks low-population species efficiently

2. **Directed Graph**  
   - Implemented in `client/core/FoodChain.js` (graphlib)
   - Stores predator → prey relationships
   - Supports simulation and keystone analysis

3. **Domain Models**  
   - Client-side classes in `client/core/Species.js`
   - Server-side schema/model in `server/models/species.js`

---

## 🗂️ Project Structure

```text
EcoTrack/
├── .env
├── package.json
├── README.md
├── vite.config.js
├── client/
│   ├── index.html
│   ├── ControlPanel.html
│   ├── SImulation.html
│   ├── core/
│   │   ├── CriticalPopulation.js
│   │   ├── EcosystemAnalyzer.js
│   │   ├── EcosystemRepository.js
│   │   ├── EcosystemScore.js
│   │   ├── FoodChain.js
│   │   ├── SandboxMode.js
│   │   ├── Species.js
│   │   └── speciesUtils.js
│   ├── graph/
│   │   ├── RenderCytoscape.js
│   │   └── TarjanAlgo.js
│   ├── pages/
│   │   ├── controlPanel.js
│   │   ├── dashboard.js
│   │   └── simulation.js
│   ├── services/
│   │   ├── ApiService.js
│   │   └── EcosystemEvents.js
│   ├── styles/
│   │   └── main.css
│   └── ui/
│       └── notifications.js
├── scripts/
│   └── tarjan-smoke.mjs
└── server/
    ├── server.js
    ├── models/
    │   └── species.js
    └── routes/
        └── species.js
```

---

## ⚙️ Prerequisites

- Node.js (v16+ recommended)
- npm
- MongoDB running locally (or a remote Mongo URI)

---

## 🔐 Environment Variables

Create `.env` in project root:

```env
MONGO_URI=mongodb://127.0.0.1:27017/ecotrack
PORT=5000
```

---

## 🚀 Run Locally

1. Install dependencies:
```bash
npm install
```

2. Make sure MongoDB is running:
```bash
sudo systemctl start mongod
```

3. Start backend + frontend together:
```bash
npm run dev:full
```

This runs:
- Express API on `http://localhost:5000`
- Vite frontend on `http://localhost:3000`

If port `3000` is already occupied, Vite will automatically move to another port such as `3001`. Open the exact local URL printed by Vite.

### Alternative (separate terminals)

```bash
npm run server
```

```bash
npm run dev
```

Quick backend check:

```bash
curl http://localhost:5000/api/health
```

---

## 🌐 Frontend Routes/Pages

- Home dashboard: `http://localhost:3000/`
- Control panel: `http://localhost:3000/ControlPanel.html`
- Simulation page: `http://localhost:3000/SImulation.html`

---

## 🔌 API Endpoints

Base URL (dev): `http://localhost:5000`

- `GET /api/health` — health check
- `GET /api/species` — list all species
- `GET /api/species/:name` — get one species by name
- `POST /api/species` — create species
- `PUT /api/species/:name` — update species
- `DELETE /api/species/:name` — delete species

---

## 🧪 Simulation Logic (Current)

Species-removal simulation in `client/core/FoodChain.js`:
- Traverses affected nodes in both directions (predators and prey)
- Computes impact factor by graph distance
- Produces a simulated graph with adjusted populations
- Runs in sandbox mode first and only persists after explicit user apply

Keystone detection:
- Uses articulation-point detection in `client/graph/TarjanAlgo.js`

Dashboard analysis:
- Rebuilds graph + critical queue from MongoDB on load
- Calculates ecosystem score from biodiversity, trophic balance, and connectivity
- Highlights cycle members and keystone species in Cytoscape

---

## 📦 Tech Stack

- **Frontend:** HTML, CSS, Vanilla JS, Vite
- **Backend:** Node.js, Express, Mongoose, CORS, dotenv
- **Algorithms/Data:** graphlib, heap-js
- **Visualization:** Cytoscape.js

---

## 📝 Notes

- Species names are normalized to lowercase in multiple layers for consistency.
- API requests from Vite are proxied via `/api` to backend (`vite.config.js`).
- Sample data is auto-seeded from the repository layer when the database is empty.
- Client code is organized by responsibility: `core`, `graph`, `pages`, `services`, `styles`, and `ui`.

---

## 📄 License

ISC
