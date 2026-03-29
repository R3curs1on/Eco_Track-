import { Animal, Plant } from './Species.js';

function toLowerName(value) {
    return String(value || '').trim().toLowerCase();
}

function normalizeEats(eats) {
    if (!Array.isArray(eats)) {
        return [];
    }

    return eats
        .map((item) => toLowerName(item))
        .filter(Boolean);
}

function cloneSpeciesData(species) {
    return {
        ...species,
        name: toLowerName(species?.name),
        speciesType: String(species?.speciesType || '').trim(),
        habitat: String(species?.habitat || '').trim(),
        healthStatus: species?.healthStatus ? String(species.healthStatus).trim() : '',
        growthStage: species?.growthStage ? String(species.growthStage).trim() : '',
        population: Number(species?.population || 0),
        age: Number(species?.age || 0),
        eats: normalizeEats(species?.eats),
        trophicLevel: Number.isFinite(species?.trophicLevel) ? Number(species.trophicLevel) : undefined,
        robustnessImpact: Number.isFinite(species?.robustnessImpact) ? Number(species.robustnessImpact) : 0
    };
}

function isAnimalSpecies(species) {
    const type = String(species?.speciesType || '').toLowerCase();
    return Boolean(species?.healthStatus) || ['animal', 'herbivore', 'carnivore', 'omnivore', 'predator'].includes(type);
}

function isPlantSpecies(species) {
    return !isAnimalSpecies(species);
}

function createClientSpecies(species) {
    const normalized = cloneSpeciesData(species);

    if (isAnimalSpecies(normalized)) {
        return new Animal(
            normalized.name,
            normalized.speciesType,
            normalized.habitat,
            normalized.population,
            normalized.healthStatus || 'healthy',
            normalized.age,
            normalized.eats
        );
    }

    return new Plant(
        normalized.name,
        normalized.speciesType,
        normalized.habitat,
        normalized.population,
        normalized.growthStage || 'mature',
        normalized.age
    );
}

function isCriticalSpecies(species) {
    const population = Number(species?.population || 0);
    const healthStatus = String(species?.healthStatus || '').toLowerCase();
    const growthStage = String(species?.growthStage || '').toLowerCase();

    return population === 0
        || population < 30
        || healthStatus === 'critical'
        || growthStage === 'dying';
}

function inferTrophicLevel(species) {
    if (Number.isFinite(species?.trophicLevel)) {
        return Number(species.trophicLevel);
    }

    const type = String(species?.speciesType || '').toLowerCase();
    if (type.includes('producer') || type.includes('plant') || isPlantSpecies(species)) {
        return 0;
    }
    if (type.includes('herbivore')) {
        return 1;
    }
    if (type.includes('omnivore')) {
        return 2;
    }
    if (type.includes('carnivore') || type.includes('predator') || type.includes('apex')) {
        return 3;
    }
    return 1;
}

function getSpeciesStatus(species) {
    const population = Number(species?.population || 0);
    if (population === 0) {
        return 'extinct';
    }
    if (population < 30 || isCriticalSpecies(species)) {
        return 'critical';
    }
    return 'stable';
}

function toTitleCase(value) {
    return String(value || '')
        .split(' ')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export {
    cloneSpeciesData,
    createClientSpecies,
    getSpeciesStatus,
    inferTrophicLevel,
    isAnimalSpecies,
    isCriticalSpecies,
    normalizeEats,
    toLowerName,
    toTitleCase
};
