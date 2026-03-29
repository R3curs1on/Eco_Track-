import { Graph } from 'graphlib';
import { Tarjan } from '../graph/TarjanAlgo.js';
import { cloneSpeciesData, isAnimalSpecies, normalizeEats, toLowerName } from './speciesUtils.js';

function uniqueNeighbors(graph, node) {
    const successors = graph.successors(node) || [];
    const predecessors = graph.predecessors(node) || [];
    return [...new Set([...successors, ...predecessors])];
}

function rotateCycle(cycle) {
    if (!cycle.length) {
        return cycle;
    }

    let bestIndex = 0;
    for (let index = 1; index < cycle.length; index += 1) {
        if (cycle[index] < cycle[bestIndex]) {
            bestIndex = index;
        }
    }

    return [...cycle.slice(bestIndex), ...cycle.slice(0, bestIndex)];
}

class FoodChain {
    constructor() {
        this.graph = new Graph({ directed: true });
    }

    clear() {
        this.graph = new Graph({ directed: true });
    }

    rebuild(speciesList) {
        this.clear();

        speciesList.forEach((species) => {
            const normalized = cloneSpeciesData(species);
            this.graph.setNode(normalized.name, normalized);
        });

        speciesList.forEach((species) => {
            const normalized = cloneSpeciesData(species);
            if (!isAnimalSpecies(normalized)) {
                return;
            }

            normalizeEats(normalized.eats).forEach((preyName) => {
                if (this.graph.hasNode(preyName)) {
                    this.graph.setEdge(normalized.name, preyName);
                }
            });
        });
    }

    addSpecies(species) {
        const normalized = cloneSpeciesData(species);
        this.graph.setNode(normalized.name, normalized);

        const outgoingEdges = this.graph.outEdges(normalized.name) || [];
        outgoingEdges.forEach(({ v, w }) => this.graph.removeEdge(v, w));

        if (!isAnimalSpecies(normalized)) {
            return;
        }

        normalizeEats(normalized.eats).forEach((preyName) => {
            if (this.graph.hasNode(preyName)) {
                this.graph.setEdge(normalized.name, preyName);
            }
        });
    }

    cloneGraph() {
        const cloned = new Graph({ directed: true });

        this.graph.nodes().forEach((name) => {
            cloned.setNode(name, cloneSpeciesData(this.graph.node(name)));
        });

        this.graph.edges().forEach(({ v, w }) => {
            cloned.setEdge(v, w);
        });

        return cloned;
    }

    getAllPrey(speciesName) {
        const normalizedName = toLowerName(speciesName);
        if (!this.graph.hasNode(normalizedName)) {
            return [];
        }
        return this.graph.successors(normalizedName) || [];
    }

    getAllPredators(speciesName) {
        const normalizedName = toLowerName(speciesName);
        if (!this.graph.hasNode(normalizedName)) {
            return [];
        }
        return this.graph.predecessors(normalizedName) || [];
    }

    getAllSpecies() {
        return this.graph.nodes().map((name) => this.graph.node(name));
    }

    printGraph() {
        return this.graph.nodes()
            .map((node) => `${node} -> ${(this.graph.successors(node) || []).join(', ')}`)
            .join('\n');
    }

    removeSpecies(speciesName) {
        const normalizedName = toLowerName(speciesName);

        if (!this.graph.hasNode(normalizedName)) {
            return;
        }

        this.graph.nodes().forEach((nodeName) => {
            const species = this.graph.node(nodeName);
            if (!species || !Array.isArray(species.eats)) {
                return;
            }

            const nextEats = normalizeEats(species.eats).filter((prey) => prey !== normalizedName);
            if (nextEats.length !== species.eats.length) {
                this.graph.setNode(nodeName, { ...species, eats: nextEats });
            }
        });

        this.graph.removeNode(normalizedName);
    }

    simulateRemoval(speciesName) {
        const targetName = toLowerName(speciesName);
        if (!this.graph.hasNode(targetName)) {
            return null;
        }

        const simulatedGraph = this.cloneGraph();
        const queue = [{ name: targetName, distance: 0, direction: 'origin' }];
        const visited = new Set([targetName]);
        const impacts = [];
        let maxDistance = 0;

        while (queue.length > 0) {
            const current = queue.shift();
            maxDistance = Math.max(maxDistance, current.distance);

            if (current.distance > 0) {
                impacts.push(current);
            }

            for (const prey of this.getAllPrey(current.name)) {
                if (!visited.has(prey)) {
                    visited.add(prey);
                    queue.push({ name: prey, distance: current.distance + 1, direction: 'prey' });
                }
            }

            for (const predator of this.getAllPredators(current.name)) {
                if (!visited.has(predator)) {
                    visited.add(predator);
                    queue.push({ name: predator, distance: current.distance + 1, direction: 'predator' });
                }
            }
        }

        simulatedGraph.nodes().forEach((nodeName) => {
            const currentSpecies = simulatedGraph.node(nodeName);
            if (!currentSpecies || !Array.isArray(currentSpecies.eats)) {
                return;
            }

            simulatedGraph.setNode(nodeName, {
                ...currentSpecies,
                eats: normalizeEats(currentSpecies.eats).filter((prey) => prey !== targetName)
            });
        });

        const impactResults = impacts.map(({ name, distance, direction }) => {
            const species = cloneSpeciesData(simulatedGraph.node(name));
            const baselinePopulation = species.population;
            const distanceFactor = maxDistance === 0 ? 1 : distance / maxDistance;
            const impactFactor = direction === 'predator'
                ? Math.max(0.2, 1 - distanceFactor * 0.8)
                : 1 + distanceFactor * 0.3;
            const nextPopulation = Math.max(0, Math.round(baselinePopulation * impactFactor));

            simulatedGraph.setNode(name, {
                ...species,
                population: nextPopulation
            });

            return {
                species: {
                    ...species,
                    population: nextPopulation
                },
                direction,
                distance,
                beforePopulation: baselinePopulation,
                afterPopulation: nextPopulation,
                populationLost: Math.max(0, baselinePopulation - nextPopulation),
                impactFactor
            };
        });

        const removedSpecies = cloneSpeciesData(simulatedGraph.node(targetName));
        simulatedGraph.removeNode(targetName);

        const changedSpecies = simulatedGraph.nodes().map((name) => cloneSpeciesData(simulatedGraph.node(name)));
        const totalPopulationLoss = impactResults.reduce(
            (sum, result) => sum + result.populationLost,
            Number(removedSpecies?.population || 0)
        );

        return {
            removedSpecies,
            results: impactResults,
            simulatedGraph,
            changedSpecies,
            totalPopulationLoss
        };
    }

    findKeystoneSpecies() {
        const tarjan = new Tarjan(this.graph);
        const articulationPoints = tarjan.getArticulationPoints();

        return articulationPoints
            .map((nodeName) => {
                const simulation = this.simulateRemoval(nodeName);
                return {
                    species: cloneSpeciesData(this.graph.node(nodeName)),
                    impactScore: simulation?.totalPopulationLoss || 0,
                    affectedSpeciesCount: simulation?.results?.length || 0
                };
            })
            .filter((entry) => entry.impactScore > 0)
            .sort((left, right) => right.impactScore - left.impactScore);
    }

    findEcosystemBridges() {
        const tarjan = new Tarjan(this.graph);
        return tarjan.getBridges().map(([u, v]) => ({
            predator: cloneSpeciesData(this.graph.node(u)),
            prey: cloneSpeciesData(this.graph.node(v))
        }));
    }

    findCycles() {
        const colors = new Map();
        const stack = [];
        const stackIndex = new Map();
        const seen = new Set();
        const cycles = [];

        const recordCycle = (cycle) => {
            const normalized = rotateCycle(cycle);
            const key = normalized.join('>');
            if (!seen.has(key)) {
                seen.add(key);
                cycles.push(normalized);
            }
        };

        const depthFirstSearch = (node) => {
            colors.set(node, 1);
            stack.push(node);
            stackIndex.set(node, stack.length - 1);

            for (const neighbor of this.graph.successors(node) || []) {
                if (!colors.has(neighbor)) {
                    depthFirstSearch(neighbor);
                } else if (colors.get(neighbor) === 1) {
                    const cycleStart = stackIndex.get(neighbor);
                    if (Number.isInteger(cycleStart)) {
                        recordCycle(stack.slice(cycleStart));
                    }
                }
            }

            stackIndex.delete(node);
            stack.pop();
            colors.set(node, 2);
        };

        this.graph.nodes().forEach((node) => {
            if (!colors.has(node)) {
                depthFirstSearch(node);
            }
        });

        return cycles;
    }

    computeRobustnessIndex() {
        const totalEdges = this.graph.edgeCount();
        const robustnessByName = {};

        this.graph.nodes().forEach((nodeName) => {
            const incidentEdges = uniqueNeighbors(this.graph, nodeName).reduce((count, neighbor) => {
                const outgoing = this.graph.hasEdge(nodeName, neighbor) ? 1 : 0;
                const incoming = this.graph.hasEdge(neighbor, nodeName) ? 1 : 0;
                return count + outgoing + incoming;
            }, 0);

            robustnessByName[nodeName] = totalEdges === 0
                ? 0
                : Number(((incidentEdges / totalEdges) * 100).toFixed(1));
        });

        return robustnessByName;
    }
}

export { FoodChain };
