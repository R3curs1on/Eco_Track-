import { calculateEcosystemScore } from './EcosystemScore.js';

function analyzeEcosystem(foodChain) {
    const cycles = foodChain.findCycles();
    const cycleMembers = new Set(cycles.flat());
    const keystoneSpecies = foodChain.findKeystoneSpecies();
    const keystoneSet = new Set(keystoneSpecies.map((entry) => entry.species.name));
    const foodChainInvolvementByName = foodChain.computeInvolvementIndex();
    const score = calculateEcosystemScore(foodChain);

    return {
        cycles,
        cycleMembers,
        keystoneSpecies,
        keystoneSet,
        foodChainInvolvementByName,
        score
    };
}

export { analyzeEcosystem };
