import { Graph } from 'graphlib';

class Tarjan {
    constructor(graph) {
        this.graph = graph;
        this.time = 0;
        this.disc = new Map();
        this.low = new Map();
        this.parent = new Map();
        this.articulationPoints = new Set();
        this.bridges = [];
    }

    reset() {
        this.time = 0;
        this.disc.clear();
        this.low.clear();
        this.parent.clear();
        this.articulationPoints.clear();
        this.bridges = [];
    }

    getNeighborsUndirected(node) {
        const successors = this.graph.successors(node) || [];
        const predecessors = this.graph.predecessors(node) || [];
        return [...new Set([...successors, ...predecessors])];
    }

    depthFirstSearch(node) {
        this.time += 1;
        this.disc.set(node, this.time);
        this.low.set(node, this.time);

        let children = 0;

        for (const neighbor of this.getNeighborsUndirected(node)) {
            if (!this.disc.has(neighbor)) {
                children += 1;
                this.parent.set(neighbor, node);
                this.depthFirstSearch(neighbor);

                this.low.set(node, Math.min(this.low.get(node), this.low.get(neighbor)));

                if (!this.parent.has(node) && children > 1) {
                    this.articulationPoints.add(node);
                }

                if (this.parent.has(node) && this.low.get(neighbor) >= this.disc.get(node)) {
                    this.articulationPoints.add(node);
                }

                if (this.low.get(neighbor) > this.disc.get(node)) {
                    this.bridges.push([node, neighbor]);
                }
            } else if (neighbor !== this.parent.get(node)) {
                this.low.set(node, Math.min(this.low.get(node), this.disc.get(neighbor)));
            }
        }
    }

    getArticulationPoints() {
        this.reset();

        for (const node of this.graph.nodes()) {
            if (!this.disc.has(node)) {
                this.depthFirstSearch(node);
            }
        }

        return [...this.articulationPoints];
    }

    getBridges() {
        this.getArticulationPoints();
        return [...this.bridges];
    }
}

function runTarjanSmokeTest() {
    const graph = new Graph({ directed: true });

    ['a', 'b', 'c', 'd', 'e'].forEach((node) => graph.setNode(node, { name: node }));

    const edges = [
        ['a', 'b'],
        ['b', 'a'],
        ['b', 'c'],
        ['c', 'b'],
        ['c', 'd'],
        ['d', 'c'],
        ['c', 'e'],
        ['e', 'c']
    ];

    edges.forEach(([source, target]) => graph.setEdge(source, target));

    const tarjan = new Tarjan(graph);
    return {
        articulationPoints: tarjan.getArticulationPoints().sort(),
        bridges: tarjan.getBridges().map(([u, v]) => [u, v].sort().join('-')).sort()
    };
}

export { Tarjan, runTarjanSmokeTest };
