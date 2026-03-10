<<<<<<< HEAD
# 🌿 EcoTrack - Ecosystem Management System

An interactive web application for managing ecosystems, tracking species populations, and visualizing food chains using fundamental data structures.

## 📋 Features

- **HashMap Storage**: Efficient species data management using JavaScript Map
- **Priority Queue**: Critical population monitoring and alerts
- **Directed Graph**: Food chain/web representation with predator-prey relationships
- **Interactive Visualization**: Cytoscape.js-powered food chain graph
- **Ecosystem Simulation**: Analyze impact of species removal on the ecosystem
- **Real-time Dashboard**: View all species, populations, and health statuses

## 🏗️ Data Structures Used

1. **HashMap (Map)** - Storage.js
   - Fast O(1) lookup, insertion, and deletion
   - Stores species data with name as key

2. **Priority Queue** - CriticalPopulation.js
   - Automatically sorts species by population
   - Quick access to most critical species

3. **Directed Graph** - FoodChain.js
   - Represents predator-prey relationships
   - BFS algorithm for impact analysis

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 📖 Usage

### Adding Species

1. Click **"Add Animal"** or **"Add Plant"** button
2. Fill in the form with species details:
   - Name, Type, Habitat, Population, etc.
   - For animals: specify what they eat (comma-separated)
3. Submit to add to ecosystem

### Visualizing Food Chain

1. Add several species with predator-prey relationships
2. Click **"Visualize Food Chain"** button
3. Graph displays:
   - **Green nodes**: Stable population (≥30)
   - **Orange nodes**: Critical population (<30)
   - **Red nodes**: Extinct (0)
   - **Arrows**: Who eats whom

### Simulating Species Removal

1. Select a species from dropdown
2. Click **"Simulate Removal"**
3. View impact on ecosystem:
   - Affected species highlighted
   - Impact factor calculated by graph distance
   - Adjusted populations shown

## 🗂️ Project Structure

```
EcoTrack/
├── index.html          # Main HTML UI
├── index.js            # Application logic & event handlers
├── style.css           # Styling
├── Species.js          # Species, Animal, Plant classes
├── Storage.js          # HashMap implementation
├── CriticalPopulation.js  # Priority Queue implementation
├── FoodChain.js        # Directed Graph implementation
├── RenderCytoscape.js  # Visualization rendering
├── package.json        # Dependencies & scripts
├── vite.config.js      # Vite bundler configuration
└── README.md           # This file
```

## 🎯 Project Requirements Checklist

- ✅ User input animals - name, type, carnivore/herbivore
- ✅ Store animals and their populations
- ✅ Use HashMap for storing data
- ✅ Use Queue for critical population
- ✅ Use Graphs for food chain
- ✅ Use numeric factor for population
- ✅ Show dashboard using HashMap and critical population using Queue
- ✅ Show food chain using graphs with Cytoscape.js
- ✅ Show effect on ecosystem if one species is removed/extinct

## 🧪 Sample Data

The app loads sample ecosystem data on startup:

**Plants:**
- Grass (500 population)
- Berry Bush (200 population)
- Oak Tree (150 population)

**Animals:**
- Rabbit (120) - eats Grass, Berry Bush
- Deer (80) - eats Grass, Berry Bush, Oak Tree
- Fox (25) - eats Rabbit
- Wolf (15) - eats Rabbit, Deer
- Hawk (20) - eats Rabbit

## 🔧 Technologies

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Data Visualization**: Cytoscape.js
- **Graph Library**: graphlib
- **Build Tool**: Vite
- **Module System**: ES Modules

## 📊 Algorithms

### BFS for Impact Analysis
When a species is removed, the app uses Breadth-First Search to:
1. Find all species in the food chain affected
2. Calculate distance from removed species
3. Compute impact factor based on distance
4. Adjust populations accordingly

### Impact Factor Formula
```
impactFactor = distance / maxDistance
adjustedPopulation = originalPopulation * impactFactor
```

## 🤝 Contributing

Feel free to fork, improve, and submit pull requests!

## 📝 License

ISC License