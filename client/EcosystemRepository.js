import ApiService from './ApiService.js';
import { cloneSpeciesData, createClientSpecies, isCriticalSpecies } from './speciesUtils.js';

const SAMPLE_SPECIES = [
    { name: 'grass', speciesType: 'Producer', habitat: 'Grassland', population: 500, growthStage: 'mature', age: 2 },
    { name: 'berry bush', speciesType: 'Producer', habitat: 'Forest', population: 200, growthStage: 'fruiting', age: 5 },
    { name: 'oak tree', speciesType: 'Producer', habitat: 'Forest', population: 150, growthStage: 'mature', age: 50 },
    { name: 'rabbit', speciesType: 'Herbivore', habitat: 'Grassland', population: 120, healthStatus: 'healthy', age: 3, eats: ['grass', 'berry bush'] },
    { name: 'deer', speciesType: 'Herbivore', habitat: 'Forest', population: 80, healthStatus: 'healthy', age: 5, eats: ['grass', 'berry bush', 'oak tree'] },
    { name: 'fox', speciesType: 'Carnivore', habitat: 'Forest', population: 25, healthStatus: 'critical', age: 4, eats: ['rabbit'] },
    { name: 'wolf', speciesType: 'Carnivore', habitat: 'Forest', population: 15, healthStatus: 'critical', age: 6, eats: ['rabbit', 'deer'] },
    { name: 'hawk', speciesType: 'Carnivore', habitat: 'Sky', population: 20, healthStatus: 'critical', age: 3, eats: ['rabbit'] }
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

function hydrateEcosystem(foodChain, criticalPopulation, speciesList) {
    const clientSpecies = speciesList.map(createClientSpecies);

    foodChain.rebuild(clientSpecies);
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

    const hydratedSpecies = hydrateEcosystem(foodChain, criticalPopulation, speciesList);

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
