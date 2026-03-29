# EcoTrack – Development Roadmap

---

## DONE ✅
- Min Heap Priority Queue (enqueue, dequeue, peek, remove, update)
- Lowercase normalization across all layers
- Duplicate node prevention in graph
- SpeciesValidator.js (name, population, age)
- Prey dropdown selector on species creation
- MongoDB backend (GET/POST/PUT/DELETE /species)
- localStorage fully replaced
- Frontend isolated from backend via ApiService.js

---

## P0 — Must Fix Before Anything Else

### Graph Sync on Load
- [x] On page load, fetch all species from MongoDB and rebuild FoodChain graph in memory
- [x] On page load, rebuild CriticalPopulation heap from fetched species

### Error Handling
- [x] Wrap all ApiService fetch calls in try/catch
- [x] Show user-facing error banner (not console.error) on network failure

### Fix Tarjan Articulation Point Bugs
- [x] Rewrite `findKeystoneSpecies()` using corrected DFS-coloring: `disc[]`, `low[]`, `parent[]`
- [x] Run against a manually constructed test graph (5 nodes, known articulation points) before wiring to UI
- [x] Note: run Tarjan on the **undirected** version of the food web — structural integrity, not direction, determines articulation points

---

## P1 — Simulation Engine

### Species Schema — New Fields
- [ ] `trophicLevel` — integer: 0 (plant), 1 (herbivore), 2 (carnivore), 3 (apex)
- [ ] `growthRate` — α for prey growth / γ for predator natural death rate
- [ ] `predationRate` — β, how fast this species gets consumed
- [ ] `conversionRate` — δ, energy this species gains from consuming prey
- [ ] Add all four fields to MongoDB schema (`server/models/species.js`)
- [ ] Add all four fields to client-side `Species.js` class
- [ ] Add form inputs for these fields in ControlPanel — use sensible defaults (e.g. growthRate: 0.4 for plants, 0.1 for predators)

### SimulationEngine.js
- [ ] Create `client/SimulationEngine.js`
- [ ] Implement `tick(graph, speciesMap, Δt)` using discretized Lotka-Volterra:
  ```
  prey:     x(t+1) = x(t) + Δt * (α·x - β·x·y)
  predator: y(t+1) = y(t) + Δt * (δ·x·y - γ·y)
  ```
- [ ] Each tick derives y (total predator pressure) and x (total prey availability) from graph edges — not hardcoded pairs
- [ ] Clamp all populations to 0 after each tick (no negative values)
- [ ] **Starvation logic:** if a predator's total prey population falls below 10% of its own population, multiply its death rate by 2.0 that tick
- [ ] **Cascading extinction:** when a species hits 0, mark it `extinct`, remove its edges from the graph, re-run tick — downstream species now have reduced prey/predator pressure
- [ ] Store full history: `{ rabbitHistory: [500, 480, 460, ...], wolfHistory: [...] }`
- [ ] Expose `runSimulation(years)` — converts years to ticks (1 year = 12 ticks at Δt=0.1) and returns history object

### Sandbox Mode
- [x] Simulation always runs on a **deep clone** of the live species/graph state
- [x] Never mutate MongoDB or the live graph during a simulation run
- [x] Only commit results back if user explicitly clicks "Apply to Ecosystem"

### Simulation UI (Simulation.html)
- [ ] Dropdown: simulate 1 / 10 / 50 years
- [ ] Button: Run Simulation
- [ ] On run: call `runSimulation(years)`, render Chart.js time-series (one line per species)
- [ ] x-axis = ticks, y-axis = population
- [ ] Species that go extinct: line drops to 0, render as dashed
- [ ] Below chart: list species that went extinct and at which tick/year

---

## P2 — Graph Algorithms

### Cycle Detection
- [x] ~~Implement `detectCycles(graph)~~` — DFS with 3-color marking (0 = unvisited, 1 = in-stack, 2 = done)
- [x] ~~Returns array of cycles~~; each cycle is an ordered array of species names e.g. `['wolf', 'deer', 'grass']`
- [x] On food chain page: show warning panel listing each detected cycle as `A → B → C → A`
- [x] In Cytoscape: give cycle-member nodes an orange border
- [x] Ecological note rendered in UI: "Feedback loops cause population oscillation — expected behavior in Lotka-Volterra"

### Keystone Species Ranking
- [x] After Tarjan fix: for each articulation point, call `simulateRemoval(name)` and record total population lost across all species
- [x] Sort articulation points by total population loss descending
- [x] Display ranked table: rank | name | impact score (total population units lost)
- [x] In Cytoscape: highlight keystone nodes with red border
- [x] Add color legend toggle in graph panel (red = keystone, orange = cycle member, default = normal)

### Robustness Index
- [x] For each species, compute: `connectivityLost = (edgesRemoved / totalEdges) * 100`
- [ ] Store as `robustnessImpact` on each species object after analysis
- [x] Surface in the species info panel (see P3)

---

## P3 — Ecosystem Stability Score

### EcosystemScore.js
- [x] **Shannon Diversity Index:**
  `H = -Σ (p_i * ln(p_i))` where `p_i = species.population / totalPopulation`
  Normalize: `H_norm = H / ln(n)` → range 0–1
- [x] **Trophic Pyramid Balance:**
  Check `count(level 0) ≥ count(level 1) ≥ count(level 2)`
  Returns 1.0 if pyramid holds, 0.5 if any level is inverted
- [x] **Connectivity Density:**
  `density = edges / (nodes * (nodes - 1))`
  Score = `1 - abs(density - 0.3) / 0.3` — peaks at 0.3, penalizes deviation
- [x] **Final score:**
  `score = round((H_norm * 0.4 + T * 0.3 + C * 0.3) * 100)`

### Wire to Dashboard
- [x] Display 0–100 score on main dashboard
- [x] Recompute on every species add / remove / population update
- [x] Show which sub-metric is lowest, e.g. "⚠ Low biodiversity pulling score down"
- [ ] After simulation run: show score before and after side-by-side

---

## P4 — Visualization

### Species Info Panel (on node click)
- [x] Cytoscape `tap` event: show inline side panel (graph stays visible)
- [x] Panel displays: name, population, trophic level, predators list, prey list, robustness impact %
- [x] If species is keystone: show badge "⚠ Keystone Species"

### Statistics Bar on Dashboard
- [x] Total species count
- [x] Ecosystem health score
- [x] Critical species count (bottom N from priority queue)
- [x] Extinct species count (tracked from simulation runs / live state)

### Simulation Chart
- [ ] One line per species (Chart.js), x = time ticks, y = population
- [ ] Extinct species: dashed line dropping to 0
- [ ] Keystone species lines: distinct color (matches graph highlight)

---

## Documentation (Do Last, Before Publish)

- [ ] `ARCHITECTURE.md` — diagram of client/server layers, data flow from MongoDB → FoodChain graph → SimulationEngine → UI
- [ ] `ALGORITHMS.md` — explain Tarjan (articulation points), DFS cycle detection, Lotka-Volterra discretization, Shannon index. Include the actual equations.
- [ ] Update README with real setup instructions and a screenshot of the simulation chart

---

## SKIP — Not Worth It
- Multiplayer / WebSocket
- AI Ecosystem Balancer
- Climate effects / evolution mode
- Export / Import JSON (10 min job, do after everything else if time allows)
- Vitest (only worth adding for `SimulationEngine.tick()` since it's pure logic with no DOM)
- Layout switcher in Cytoscape (one-liner, add last if bored)
- Betweenness centrality (no meaningful resume differentiation over what articulation points already give you)
