import ApiService from './ApiService.js';
import { cloneSpeciesData } from './speciesUtils.js';

function createSandboxSession(foodChain, speciesName) {
    const simulation = foodChain.simulateRemoval(speciesName);
    if (!simulation) {
        return null;
    }

    return {
        selectedSpecies: String(speciesName || '').toLowerCase(),
        createdAt: Date.now(),
        simulation,
        applied: false
    };
}

async function applySandboxSession(session) {
    if (!session || session.applied) {
        return false;
    }

    const removedSpeciesName = session.simulation.removedSpecies?.name;
    if (removedSpeciesName) {
        await ApiService.removeSpecies(removedSpeciesName);
    }

    for (const species of session.simulation.changedSpecies.map(cloneSpeciesData)) {
        await ApiService.updateSpecies(species.name, species);
    }

    session.applied = true;
    return true;
}

export {
    applySandboxSession,
    createSandboxSession
};
