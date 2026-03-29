import cytoscape from 'cytoscape';
import { getSpeciesStatus, inferTrophicLevel, toTitleCase } from './speciesUtils.js';

function buildElements(graph, analysis = {}) {
    const cycleMembers = analysis.cycleMembers || new Set();
    const keystoneSet = analysis.keystoneSet || new Set();
    const robustnessByName = analysis.robustnessByName || {};

    const nodes = graph.nodes().map((name) => {
        const species = graph.node(name);
        const prey = graph.successors(name) || [];
        const predators = graph.predecessors(name) || [];

        return {
            data: {
                id: name,
                label: toTitleCase(species.name),
                population: Number(species.population || 0),
                speciesType: toTitleCase(species.speciesType),
                status: getSpeciesStatus(species),
                trophicLevel: inferTrophicLevel(species),
                isCycleMember: cycleMembers.has(name),
                isKeystone: keystoneSet.has(name),
                prey: prey.join(', '),
                predators: predators.join(', '),
                robustnessImpact: robustnessByName[name] || 0
            }
        };
    });

    const edges = graph.edges().map(({ v, w }) => ({
        data: {
            id: `${v}->${w}`,
            source: v,
            target: w
        }
    }));

    return [...nodes, ...edges];
}

function renderCytoScape(graph, containerId = 'cy', options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        throw new Error(`Container "${containerId}" not found`);
    }

    const cy = cytoscape({
        container,
        elements: buildElements(graph, options.analysis),
        layout: {
            name: 'cose',
            animate: true,
            padding: 28,
            nodeRepulsion: 9000,
            idealEdgeLength: 120
        },
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': (ele) => {
                        const status = ele.data('status');
                        if (status === 'extinct') {
                            return '#7f1d1d';
                        }
                        if (status === 'critical') {
                            return '#ea580c';
                        }
                        return ele.data('trophicLevel') === 0 ? '#3f7d20' : '#176b87';
                    },
                    'border-width': (ele) => {
                        if (ele.data('isKeystone')) {
                            return 6;
                        }
                        if (ele.data('isCycleMember')) {
                            return 4;
                        }
                        return 2;
                    },
                    'border-color': (ele) => {
                        if (ele.data('isKeystone')) {
                            return '#b91c1c';
                        }
                        if (ele.data('isCycleMember')) {
                            return '#f59e0b';
                        }
                        return '#dff3dd';
                    },
                    width: 'mapData(population, 0, 500, 44, 88)',
                    height: 'mapData(population, 0, 500, 44, 88)',
                    label: 'data(label)',
                    shape: (ele) => (ele.data('trophicLevel') === 0 ? 'round-rectangle' : 'ellipse'),
                    color: '#f8fafc',
                    'font-size': 11,
                    'font-weight': 700,
                    'text-wrap': 'wrap',
                    'text-max-width': 80,
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'text-outline-color': '#102420',
                    'text-outline-width': 2
                }
            },
            {
                selector: 'edge',
                style: {
                    width: 2.5,
                    'line-color': '#7a8b95',
                    'target-arrow-color': '#7a8b95',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    opacity: 0.85
                }
            },
            {
                selector: 'node:selected',
                style: {
                    'overlay-opacity': 0,
                    'shadow-blur': 22,
                    'shadow-color': '#f59e0b',
                    'shadow-opacity': 0.35
                }
            }
        ]
    });

    if (typeof options.onNodeTap === 'function') {
        cy.on('tap', 'node', (event) => {
            const node = event.target;
            const species = graph.node(node.id());
            options.onNodeTap(species, node.data());
        });
    }

    return cy;
}

export { renderCytoScape };
