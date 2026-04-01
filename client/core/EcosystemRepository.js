import ApiService from '../services/ApiService.js';
import { cloneSpeciesData, createClientSpecies, isCriticalSpecies } from './speciesUtils.js';

const SAMPLE_SPECIES = [
    // Producers (4)
    { name: 'grass', speciesType: 'Producer', habitat: 'Grassland', population: 5000, growthStage: 'mature', age: 2 },
    { name: 'oak tree', speciesType: 'Producer', habitat: 'Forest', population: 350, growthStage: 'mature', age: 50 },
    { name: 'berry bush', speciesType: 'Producer', habitat: 'Forest', population: 800, growthStage: 'fruiting', age: 5 },
    { name: 'algae', speciesType: 'Producer', habitat: 'Wetland', population: 20000, growthStage: 'mature', age: 1 },
    
    // Primary Herbivores (4)
    { name: 'rabbit', speciesType: 'Herbivore', habitat: 'Grassland', population: 450, healthStatus: 'healthy', age: 3, eats: ['grass', 'squirrel'] },  // CYCLE: rabbit eats squirrel
    { name: 'deer', speciesType: 'Herbivore', habitat: 'Forest', population: 180, healthStatus: 'healthy', age: 5, eats: ['grass', 'oak tree', 'berry bush'] },
    { name: 'squirrel', speciesType: 'Herbivore', habitat: 'Forest', population: 600, healthStatus: 'healthy', age: 4, eats: ['oak tree', 'berry bush', 'rabbit'] },  // CYCLE: squirrel eats rabbit
    { name: 'mouse', speciesType: 'Herbivore', habitat: 'Grassland', population: 2000, healthStatus: 'healthy', age: 2, eats: ['grass', 'snake'] },  // CYCLE: mouse eats snake
    
    // Secondary Carnivores (4)
    { name: 'fox', speciesType: 'Carnivore', habitat: 'Forest', population: 45, healthStatus: 'good', age: 4, eats: ['rabbit', 'mouse', 'squirrel'] },
    { name: 'hawk', speciesType: 'Carnivore', habitat: 'Sky', population: 55, healthStatus: 'good', age: 3, eats: ['rabbit', 'mouse'] },
    { name: 'snake', speciesType: 'Carnivore', habitat: 'Grassland', population: 150, healthStatus: 'healthy', age: 4, eats: ['mouse', 'raccoon'] },  // CYCLE: snake eats raccoon
    { name: 'wolf', speciesType: 'Carnivore', habitat: 'Forest', population: 8, healthStatus: 'critical', age: 6, eats: ['rabbit', 'deer'] },
    
    // Omnivores (2)
    { name: 'raccoon', speciesType: 'Omnivore', habitat: 'Forest', population: 200, healthStatus: 'healthy', age: 4, eats: ['berry bush', 'rabbit', 'mouse', 'snake'] },  // CYCLE: raccoon eats snake
    { name: 'bird', speciesType: 'Omnivore', habitat: 'Forest', population: 3000, healthStatus: 'healthy', age: 2, eats: ['mouse', 'berry bush'] },
    
    // Extinct Species (1)
    { name: 'saber tooth', speciesType: 'Carnivore', habitat: 'Forest', population: 0, healthStatus: 'extinct', age: 0, eats: ['deer', 'rabbit'] }
];

async function seedSampleData() {
    for (const species of SAMPLE_SPECIES) {
        try {
            await ApiService.addSpecies(species);
        } catch (error) {
            if (!String(error.message || '').toLowerCase().includes('duplicate')) {
                throw error;
            }
        }
    }
}

function hydrateEcosystem(foodChain, criticalPopulation, speciesList, foodChainEdges = []) {
    const clientSpecies = speciesList.map(createClientSpecies);

    foodChain.clear();
    clientSpecies.forEach((species) => {
        foodChain.graph.setNode(species.name, cloneSpeciesData(species));
    });

    if (Array.isArray(foodChainEdges)) {
        const speciesByName = new Map(clientSpecies.map((species) => [species.name, species]));
        foodChainEdges.forEach((edge) => {
            const predator = String(edge?.predator || '').trim().toLowerCase();
            const prey = String(edge?.prey || '').trim().toLowerCase();
            if (speciesByName.has(predator) && speciesByName.has(prey)) {
                foodChain.graph.setEdge(predator, prey);
            }
        });
    }
    criticalPopulation.clear();

    clientSpecies.forEach((species) => {
        if (isCriticalSpecies(species)) {
            criticalPopulation.enqueue(species);
        }
    });

    return clientSpecies;
}

async function syncEcosystemState(foodChain, criticalPopulation, options = {}) {
    const { seedIfEmpty = true } = options;
    let speciesList = await ApiService.getAllSpecies();

    if (speciesList.length === 0 && seedIfEmpty) {
        await seedSampleData();
        speciesList = await ApiService.getAllSpecies();
    }

    const foodChainEdges = await ApiService.getFoodChain();

    const hydratedSpecies = hydrateEcosystem(foodChain, criticalPopulation, speciesList, foodChainEdges);

    return {
        species: hydratedSpecies.map(cloneSpeciesData),
        raw: speciesList.map(cloneSpeciesData)
    };
}

export {
    SAMPLE_SPECIES,
    hydrateEcosystem,
    seedSampleData,
    syncEcosystemState
};
