import Species from './models/species.js';
import FoodChain from './models/foodchain.js';

const SAMPLE_SPECIES = [
    { name: 'grass', speciesType: 'Producer', habitat: 'Grassland', population: 5000, growthStage: 'mature', age: 2 },
    { name: 'oak tree', speciesType: 'Producer', habitat: 'Forest', population: 350, growthStage: 'mature', age: 50 },
    { name: 'berry bush', speciesType: 'Producer', habitat: 'Forest', population: 800, growthStage: 'fruiting', age: 5 },
    { name: 'algae', speciesType: 'Producer', habitat: 'Wetland', population: 20000, growthStage: 'mature', age: 1 },
    { name: 'rabbit', speciesType: 'Herbivore', habitat: 'Grassland', population: 450, healthStatus: 'healthy', age: 3, eats: ['grass', 'squirrel'] },
    { name: 'deer', speciesType: 'Herbivore', habitat: 'Forest', population: 180, healthStatus: 'healthy', age: 5, eats: ['grass', 'oak tree', 'berry bush'] },
    { name: 'squirrel', speciesType: 'Herbivore', habitat: 'Forest', population: 600, healthStatus: 'healthy', age: 4, eats: ['oak tree', 'berry bush', 'rabbit'] },
    { name: 'mouse', speciesType: 'Herbivore', habitat: 'Grassland', population: 2000, healthStatus: 'healthy', age: 2, eats: ['grass', 'snake'] },
    { name: 'fox', speciesType: 'Carnivore', habitat: 'Forest', population: 45, healthStatus: 'good', age: 4, eats: ['rabbit', 'mouse', 'squirrel'] },
    { name: 'hawk', speciesType: 'Carnivore', habitat: 'Sky', population: 55, healthStatus: 'good', age: 3, eats: ['rabbit', 'mouse'] },
    { name: 'snake', speciesType: 'Carnivore', habitat: 'Grassland', population: 150, healthStatus: 'healthy', age: 4, eats: ['mouse', 'raccoon'] },
    { name: 'wolf', speciesType: 'Carnivore', habitat: 'Forest', population: 8, healthStatus: 'critical', age: 6, eats: ['rabbit', 'deer'] },
    { name: 'raccoon', speciesType: 'Omnivore', habitat: 'Forest', population: 200, healthStatus: 'healthy', age: 4, eats: ['berry bush', 'rabbit', 'mouse', 'snake'] },
    { name: 'bird', speciesType: 'Omnivore', habitat: 'Forest', population: 3000, healthStatus: 'healthy', age: 2, eats: ['mouse', 'berry bush'] },
    { name: 'saber tooth', speciesType: 'Carnivore', habitat: 'Forest', population: 0, healthStatus: 'extinct', age: 0, eats: ['deer', 'rabbit'] }
];

function normalizeSpecies(species) {
    return {
        ...species,
        name: String(species.name || '').trim().toLowerCase(),
        speciesType: String(species.speciesType || '').trim().toLowerCase(),
        habitat: String(species.habitat || '').trim(),
        healthStatus: species.healthStatus ? String(species.healthStatus).trim().toLowerCase() : undefined,
        growthStage: species.growthStage ? String(species.growthStage).trim().toLowerCase() : undefined,
        eats: Array.isArray(species.eats)
            ? species.eats.map((item) => String(item).trim().toLowerCase()).filter(Boolean)
            : []
    };
}

function buildFoodChainEdges(speciesList) {
    const knownSpecies = new Set(speciesList.map((species) => species.name));
    const edges = [];
    const seen = new Set();

    for (const species of speciesList) {
        if (!Array.isArray(species.eats)) {
            continue;
        }

        for (const prey of species.eats) {
            const normalizedPrey = String(prey || '').trim().toLowerCase();
            if (!normalizedPrey || !knownSpecies.has(normalizedPrey)) {
                continue;
            }

            const key = `${species.name}=>${normalizedPrey}`;
            if (seen.has(key)) {
                continue;
            }
            seen.add(key);

            edges.push({
                predator: species.name,
                prey: normalizedPrey
            });
        }
    }

    return edges;
}

async function seedSpeciesCollection() {
    const existingCount = await Species.countDocuments();
    if (existingCount > 0) {
        return await Species.find().sort({ name: 1 }).lean();
    }

    const normalizedSpecies = SAMPLE_SPECIES.map(normalizeSpecies);
    await Species.insertMany(normalizedSpecies, { ordered: true });
    return Species.find().sort({ name: 1 }).lean();
}

async function seedFoodChainCollection(speciesList) {
    const edges = buildFoodChainEdges(speciesList);
    const desiredKeys = new Set(edges.map((edge) => `${edge.predator}=>${edge.prey}`));
    const existingEdges = await FoodChain.find().lean();

    if (edges.length === 0) {
        await FoodChain.deleteMany({});
        return [];
    }

    const operations = edges.map((edge) => ({
        updateOne: {
            filter: { predator: edge.predator, prey: edge.prey },
            update: { $setOnInsert: edge },
            upsert: true
        }
    }));

    await FoodChain.bulkWrite(operations, { ordered: false });

    const staleEdgeIds = existingEdges
        .filter((edge) => !desiredKeys.has(`${edge.predator}=>${edge.prey}`))
        .map((edge) => edge._id);

    if (staleEdgeIds.length > 0) {
        await FoodChain.deleteMany({ _id: { $in: staleEdgeIds } });
    }

    return FoodChain.find().sort({ predator: 1, prey: 1 }).lean();
}

async function syncFoodChainFromSpecies() {
    const species = await Species.find().sort({ name: 1 }).lean();
    const foodChain = await seedFoodChainCollection(species);
    return { species, foodChain };
}

async function seedDatabaseIfNeeded() {
    const species = await seedSpeciesCollection();
    const foodChain = await seedFoodChainCollection(species);

    return { species, foodChain };
}

export {
    SAMPLE_SPECIES,
    buildFoodChainEdges,
    seedDatabaseIfNeeded,
    seedFoodChainCollection,
    seedSpeciesCollection,
    syncFoodChainFromSpecies
};
