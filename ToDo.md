# EcoTrack – Development Roadmap

This document tracks all improvements required to evolve EcoTrack from a
basic ecosystem visualization tool into a full ecosystem simulation platform.

Priority levels:
- P0 = Critical (must fix)
- P1 = Core architecture upgrades
- P2 = Advanced ecosystem modelling
- P3 = Visualization & analytics
- P4 = UX improvements
- P5 = Dev quality improvements

---

# P0 — Critical Fixes (Stability & Correctness)

## Priority Queue
- [x] Replace array-based queue with **Min Heap Priority Queue** (used heap-js)
- [x] Implement `enqueue()`
- [x] Implement `dequeue()`
- [x] Implement `peek()`
- [x] Implement `removeSpecies(name)`
- [x] Implement `updateSpecies(species)`
- [ ] Ensure queue automatically updates when population changes

## Case Sensitivity
- [x] Standardize all species keys to lowercase
- [x] Enforce lowercase in:
- [x] ~~Storage.js~~ (using mongodb)
- [x] FoodChain.js
- [x] CriticalPopulation.js
- [x] Simulation.js

## Graph Synchronization
- [x] ~~Rebuild FoodChain graph from localStorage on page load~~
- [ ] Rebuild FoodChain graph from mongodb from memory on page load
- [x] ~~Rebuild CriticalPopulation queue from storage~~
- [x] Prevent duplicate nodes in graph

## Validation
Create `SpeciesValidator.js`

- [x] Validate species name
- [x] Prevent empty names
- [x] Prevent negative populations
- [x] Prevent negative age
- [ ] ~~Ensure animals have prey~~ ( depends on species type so not needed )
- [ ] ~~Validate prey species exist~~ ( not really needed can add dropbox toggle list instead)
- [ ] add dropbox toggle list at time of adding prey in animals

---

# P1 — Architecture Improvements

## Domain Layer Refactor

- Separate logic into layers:
- Domain
- Species
- FoodChain
- Simulation
- PriorityQueue
- 
- Application
- EcosystemService
- 
- Presentation
- UI



### Tasks

- [ ]~~ Create `EcosystemService.js`~~ ( seperate client and server layer)
- [ ] Move all ecosystem logic into service layer
- [x] UI should call only service methods ( already frontend is isolated)

Example:
- ecosystemService.addSpecies(data)
- ecosystemService.removeSpecies(name)
- ecosystemService.simulateRemoval(name)


---

## Backend API (Replace localStorage)

Create backend service.
Tech stack suggestion:

-  Node.js
-  Express
-  MongoDB


Endpoints:

- [x] `GET /species`
- [x] `POST /species`
- [x] `DELETE /species/:id`
- [x] `PUT /species/:id`
- [x] `GET /foodchain`

---

## Data Persistence

- [x] Replace localStorage persistence
- [x] Implement API data fetching
- [ ] Add error handling for network failures

---

# P2 — Ecosystem Simulation Engine

Upgrade simulation from simple BFS impact → ecological model.

## Trophic Levels

Add trophic levels to species.
Levels:

-  0 → Plants
-  1 → Herbivores
-  2 → Carnivores
-  3 → Apex predators


Tasks:

- [ ] Assign trophic level to each species
- [ ] Store trophic level in species object
- [ ] Adjust simulation impact based on trophic distance

---

## Energy Flow Model

Add energy transfer between trophic levels.

Example:
-  Plants → Herbivores → Carnivores


Tasks:

- [ ] Model energy consumption
- [ ] Calculate predator survival based on prey availability
- [ ] Reduce population if food supply insufficient

---

## Population Growth

Add natural growth rates.
Example:
- plants grow faster
- predators reproduce slower


Tasks:

- [ ] Add growth rate attribute
- [ ] Simulate reproduction
- [ ] Simulate natural deaths

---

## Time Simulation Engine
Add time progression.
Example:

-  simulate 1 month
-  simulate 1 year
-  simulate 10 years
-  

Tasks:

- [ ] Create `SimulationEngine.js`
- [ ] Implement timestep loop
- [ ] Update populations every step
- [ ] Update ecosystem stability metrics

---

# P3 — Graph Algorithms & Ecosystem Analytics

Use graph theory to analyze ecosystem stability.

## Keystone Species Detection

Identify species whose removal causes maximum ecosystem collapse.

Tasks:

- [ ] Simulate removal of each species
- [ ] Measure total population loss
- [ ] Rank species by ecosystem impact
- [ ] Display keystone species list

---

## Cycle Detection

Detect unstable predator loops.
Example:

- A → B
- B → C
- C → A
- 

Tasks:

- [ ] Implement cycle detection algorithm
- [ ] Warn user about ecosystem instability

---

## Centrality Metrics

Calculate species importance in network.

Metrics:

- Degree centrality
- Betweenness centrality

Tasks:

- [ ] Implement centrality analysis
- [ ] Highlight most important nodes

---

## Ecosystem Stability Score

Create ecosystem health metric.

Factors:

- biodiversity
- food chain balance
- extinction count
- population variance

Tasks:

- [ ] Implement scoring algorithm
- [ ] Display ecosystem health score

---

# P4 — Visualization Improvements

## Graph Layouts

Add layout selector.

Options:

- Breadthfirst
- Force-directed
- Circular

Tasks:

- [ ] Implement layout dropdown
- [ ] Allow dynamic layout switching

---

## Species Information Panel

When clicking node:

Display:

- species name
- population
- trophic level
- predators
- prey

Tasks:

- [ ] Implement info modal on each Node 

---

## Keystone Species Highlight

- [ ] Highlight keystone species in graph
- [ ] Color nodes by ecosystem importance
- [ ] a small (info) toggle for color info
---

## Collapse Visualization

When species removed:

- [ ] animate cascading population changes
- [ ] visualize extinction chain
- [ ] that graph physics like nodes floating in space ( ekagra )

---

# P5 — UX Improvements

## Search & Filtering

- [ ] Search species by name
- [ ] Filter by type
- [ ] Filter by population status
- [ ] Filter by trophic level

---

## Statistics Dashboard

Display:

- total species
- ecosystem health
- average population
- critical species
- extinct species

---

## Export / Import

- [ ] Export ecosystem to JSON
- [ ] Import ecosystem from JSON
- [ ] Backup ecosystem data

---

## Confirmation Dialogs

- [ ] Confirm species deletion
- [ ] Confirm ecosystem reset

---

## Loading States

- [ ] Loading spinner during simulation
- [ ] Loading state for graph rendering

---

# P6 — Developer Quality Improvements

## Unit Tests

Setup testing framework.

Suggested:
- Vitest

Test coverage:

- [ ] Storage
- [ ] PriorityQueue
- [ ] FoodChain graph
- [ ] Simulation engine

---

## Performance Optimization

- [ ] Debounce search input
- [ ] Optimize graph rendering
- [ ] Avoid redundant graph rebuilds

---

## Documentation

Improve repository documentation.

- [ ] Architecture diagram
- [ ] Data flow diagram
- [ ] Simulation algorithm explanation
- [ ] Graph algorithm explanation
- [ ] Setup instructions

---

# Stretch Goals (Advanced)

These would make EcoTrack a standout project.

## AI Ecosystem Balancer

Goal:

Maintain ecosystem health above threshold.

Tasks:

- [ ] Implement heuristic balancing algorithm
- [ ] Suggest species population adjustments

---

## Ecosystem Evolution Mode

Simulate ecosystem over decades.

Tasks:

- [ ] long-term population dynamics
- [ ] climate effects
- [ ] random environmental events

---

## Multiplayer Ecosystem

Allow multiple users to modify ecosystem.

Tasks:

- [ ] WebSocket server
- [ ] shared ecosystem state


