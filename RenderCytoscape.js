
import cytoscape from 'cytoscape';
 
/**
 * Renders a graphlib directed graph using Cytoscape.js
 * @param {Graph} graph - graphlib Graph instance
 * @param {string} containerId - DOM container id (default: 'cy')
 */
export function renderCytoScape(graph, containerId = 'cy') {
    
    if (!graph) {
        console.error('renderCytoScape: graph is null or undefined');
        return null;
    }

    if (!graph.nodes || !graph.edges || !graph.node) {
        console.error('renderCytoScape: graph is missing required methods (nodes, edges, node)');
        return null;
    }

    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`renderCytoScape: container with id '${containerId}' not found`);
        return null;
    }

    const elements = [];


    console.log('Rendering graph with Cytoscape.js', graph);

    // ---- Nodes ----
    graph.nodes().forEach(name => {
        const species = graph.node(name);

        if (!species) {
            console.warn(`renderCytoScape: species data not found for node '${name}'`);
            return;
        }

        if (!species.name) {
            console.warn(`renderCytoScape: species object missing 'name' property for node '${name}'`);
            return;
        }

        elements.push({
            data: {
                id: species.name,
                label: species.name,
                population: species.population || 0,
                type: species.speciesType || 'unknown'
            }
        });
    });


    console.log('Elements for Cytoscape:', elements);

    // ---- Edges ----
    graph.edges().forEach(edge => {
        elements.push({
            data: {
                source: edge.v,
                target: edge.w,
                weight: 1
            }
        });
    });


    console.log('Final elements with edges for Cytoscape:', elements);

    const cy = cytoscape({
        container: container,
        elements,

        layout: {
            name: 'breadthfirst',
            directed: true,
            padding: 30
        },

        style: [
            {
                selector: 'node',
                style: {
                    label: 'data(label)',

                    'background-color': ele => {
                        const pop = ele.data('population');
                        const speciesType = ele.data('speciesType');
                        const healthStatus = ele.data('healthStatus');
                        const growthStage = ele.data('growthStage');

                        if (pop === 0 || (speciesType === 'Animal' ? healthStatus === 'Critical' : growthStage === 'Dying')) return '#b71c1c';   // extinct
                        if (pop < 30 || (speciesType === 'Animal' ? healthStatus === 'Poor' : growthStage === 'Dormant')) return '#f57c00';    // critical
                        return '#2e7d32';                  // stable
                    },

                    width: 'mapData(population, 0, 500, 20, 60)',
                    height: 'mapData(population, 0, 500, 20, 60)',

                    color: '#ffffff',
                    'text-valign': 'center',
                    'text-outline-width': 2,
                    'text-outline-color': '#1b1b1b',
                    'font-size': 10
                }
            },
            {
                selector: 'edge',
                style: {
                    width: 2,
                    'line-color': '#9e9e9e',
                    'target-arrow-color': '#9e9e9e',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier'
                }
            }
        ]
    });

    console.log('Cytoscape rendering complete.');
    return cy;
}
