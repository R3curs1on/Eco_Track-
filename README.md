# 🌿 EcoTrack - Ecosystem Management System

EcoTrack is a full-stack ecosystem management app for tracking species, monitoring critical populations, visualizing food-chain relationships, and simulating species removal impact.

It uses:
- **Frontend:** Vite + Vanilla JS
- **Backend:** Express + MongoDB (Mongoose)
- **Graph rendering:** Cytoscape.js

---

## ✨ Current Features

- Add/remove species from a MongoDB-backed dataset
- Real-time species dashboard
- Critical population alerts using a priority queue
- Directed food-chain graph visualization
- Species-removal simulation with propagated impact
- Keystone-species discovery (articulation-point based)

---

## 🧱 Data Structures & Core Logic

1. **Priority Queue (Min Heap)**  
   - Implemented in `client/CriticalPopulation.js`
   - Tracks low-population species efficiently

2. **Directed Graph**  
   - Implemented in `client/FoodChain.js` (graphlib)
   - Stores predator → prey relationships
   - Supports simulation and keystone analysis

3. **Domain Models**  
   - Client-side classes in `client/Species.js`
   - Server-side schema/model in `server/models/species.js`

> Note: `Storage.js` is legacy and no longer the active persistence layer.

---

## 🗂️ Project Structure

```text
EcoTrack/
├── .env
├── package.json
├── README.md
├── Storage.js (legacy)
├── vite.config.js
├── client/
│   ├── index.html
│   ├── index.js
│   ├── ControlPanel.html
│   ├── ControlPanel.js
│   ├── SImulation.html
│   ├── simulation.js
│   ├── ApiService.js
│   ├── Species.js
│   ├── CriticalPopulation.js
│   ├── FoodChain.js
│   ├── RenderCytoscape.js
│   └── style.css
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

2. Start backend + frontend together:
```bash
npm run dev:full
```

This runs:
- Express API on `http://localhost:5000`
- Vite frontend on `http://localhost:3000`

### Alternative (separate terminals)

```bash
npm run server
```

```bash
npm run dev
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

Species-removal simulation in `client/FoodChain.js`:
- Traverses affected nodes in both directions (predators and prey)
- Computes impact factor by graph distance
- Produces a simulated graph with adjusted populations

Keystone detection:
- Uses articulation-point detection (`TarjanArticulationNodes`)

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
- Sample data is auto-seeded from client flows when DB is empty.

---

## 📄 License

ISC