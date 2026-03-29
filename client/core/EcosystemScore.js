import { inferTrophicLevel } from './speciesUtils.js';

function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
}

function calculateShannonDiversity(speciesList) {
    const livingSpecies = speciesList.filter((species) => Number(species.population || 0) > 0);
    const totalPopulation = livingSpecies.reduce((sum, species) => sum + Number(species.population || 0), 0);

    if (livingSpecies.length <= 1 || totalPopulation <= 0) {
        return 0;
    }

    const diversity = livingSpecies.reduce((sum, species) => {
        const ratio = Number(species.population || 0) / totalPopulation;
        return ratio > 0 ? sum - ratio * Math.log(ratio) : sum;
    }, 0);

    return diversity / Math.log(livingSpecies.length);
}

function calculateTrophicBalance(speciesList) {
    const counts = [0, 0, 0];

    speciesList.forEach((species) => {
        const level = Math.min(inferTrophicLevel(species), 2);
        counts[level] += 1;
    });

    return counts[0] >= counts[1] && counts[1] >= counts[2] ? 1 : 0.5;
}

function calculateConnectivityDensity(edgeCount, nodeCount) {
    if (nodeCount <= 1) {
        return 0;
    }

    const density = edgeCount / (nodeCount * (nodeCount - 1));
    return clamp(1 - Math.abs(density - 0.3) / 0.3, 0, 1);
}

function calculateEcosystemScore(foodChain) {
    const speciesList = foodChain.getAllSpecies();
    const shannon = calculateShannonDiversity(speciesList);
    const trophic = calculateTrophicBalance(speciesList);
    const connectivity = calculateConnectivityDensity(foodChain.graph.edgeCount(), foodChain.graph.nodeCount());

    const metrics = {
        biodiversity: Number((shannon * 100).toFixed(1)),
        trophicBalance: Number((trophic * 100).toFixed(1)),
        connectivity: Number((connectivity * 100).toFixed(1))
    };

    const weightedScore = Math.round((shannon * 0.4 + trophic * 0.3 + connectivity * 0.3) * 100);
    const weakestMetric = Object.entries(metrics).sort((left, right) => left[1] - right[1])[0]?.[0] || 'biodiversity';

    return {
        score: weightedScore,
        metrics,
        weakestMetric
    };
}

export { calculateEcosystemScore };
