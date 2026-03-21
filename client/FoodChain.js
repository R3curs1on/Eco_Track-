
// graphs of food chains and webs -- directed graphs where nodes are Species and edges are "eats" relationships

import { Graph } from 'graphlib';
import { Animal, Plant, Species } from './Species.js';

class FoodChain{

    constructor() {
        this.graph = new Graph({directed : true});
    }

    addSpecies(species){
        const curr = species ;
        const name = curr.name.toLowerCase();

        this.graph.setNode(name, curr);
        if(curr instanceof Animal){
            const eats = Array.isArray(curr.eats) ? curr.eats : [];
            eats.forEach(preyName => {
                const prey = String(preyName || '').trim().toLowerCase();
                if (prey) {
                    this.graph.setEdge(name, prey);
                }
            });
        }
    }

    getAllPrey(speciesName){
        // get all nodes reachable from speciesName
        speciesName = speciesName.toLowerCase();
        if(!this.graph.hasNode(speciesName)){
            return null;
        }
        return this.graph.successors(speciesName); // forward edges
    }

    getAllPredators(speciesName){
        speciesName = speciesName.toLowerCase();
        if(!this.graph.hasNode(speciesName)){
            return null;
        }
        return this.graph.predecessors(speciesName); // back edges
    }

    getAllSpecies(){
        return this.graph.nodes().map( name => this.graph.node(name) );
    }

    printGraph(){  // probably use D3.js or similar library to visualize food chains later -- looks cool and useful
        let visualize = "Food Chain Graph:\n";
        for(const node of this.graph.nodes()){
            visualize += `Species: ${node}\n`;
            const prey = this.getAllPrey(node);
        }
        // console.log(visualize);
        return visualize;
    }

    removeSpecies(speciesName) {
        const name = speciesName.toLowerCase();
    
        if (!this.graph.hasNode(name)) {
            return;
        }
    
        // Remove all edges where this species is source or target
        const inEdges = this.graph.inEdges(name) || [];
        const outEdges = this.graph.outEdges(name) || [];
        
        inEdges.forEach(edge => {
            this.graph.removeEdge(edge.v, edge.w);
        });
        
        outEdges.forEach(edge => {
            this.graph.removeEdge(edge.v, edge.w);
        });
        
        // Remove the node itself
        this.graph.removeNode(name);
    }

    simulateRemoval( speciesName ){
        // Simulate removal by analyzing impact on BOTH prey (forward) and predators (backward)
        // Prey are affected because they lose a predator (population may increase initially but ecosystem destabilizes)
        // Predators are affected because they lose a food source (population decreases)
        
        speciesName = speciesName.toLowerCase();
        if(!this.graph.hasNode(speciesName)){
            return null;
        }

        const affectedSpecies = [];
        let maxDist = 0;
        
        // BFS to find all affected species in BOTH directions
        const visited = new Set();
        const queue = [];
        queue.push( { name: speciesName, dist: 0, direction: 'origin' } );
        visited.add(speciesName);
        
        while(queue.length > 0){
            const curr = queue.shift();
            const currName = curr.name;
            const currDist = curr.dist;
            
            if(currDist > maxDist){
                maxDist = currDist;
            }
            
            if(currDist > 0){ // skip the removed species itself
                const species = this.graph.node(currName);
                affectedSpecies.push( { species, dist: currDist, direction: curr.direction } );
            }
            
            // Forward edges: prey that this species eats (they lose a predator)
            const prey = this.graph.successors(currName) || [];
            prey.forEach( neighbor => {
                if(!visited.has(neighbor)){
                    visited.add(neighbor);
                    queue.push( { name: neighbor, dist: currDist + 1, direction: 'prey' } );
                }
            });
            
            // Backward edges: predators that eat this species (they lose food source)
            const predators = this.graph.predecessors(currName) || [];
            predators.forEach( neighbor => {
                if(!visited.has(neighbor)){
                    visited.add(neighbor);
                    queue.push( { name: neighbor, dist: currDist + 1, direction: 'predator' } );
                }
            });
        }


        // Calculate impact factor for each affected species
        // Predators are more severely affected (lose food) than prey (lose predator)

        const results = affectedSpecies.map(({ species, dist, direction }) => {
            let impactFactor = 0; 
            const distanceFactor = maxDist === 0 ? 1 : dist / maxDist;
            
            // Predators lose food source - more severe impact (reduce population more)
            // Prey lose a predator - less severe impact (population might even increase, but use decay for simplicity)
            if (direction === 'predator') {
                // Predators are severely affected - inverse relationship (closer = more affected)
                impactFactor = 1 - distanceFactor * 0.8; // 20% to 100% reduction
            } else {
                // Prey are less affected - they lose a predator
                impactFactor = 1 + distanceFactor * 0.3; // 0% to 30% increase
            }
            
            return { species, impactFactor, direction };
        });


        // create new Graph with removed species and adjusted populations 
        // first copy original graph
        // then adjust populations based on impact factors
            
        const simulateGraph = new Graph({ directed : true });
        this.graph.nodes().forEach( name => {
            if(name === speciesName) return; // skip removed species
            const species = this.graph.node(name);
            simulateGraph.setNode(name.toLowerCase(), species);
        });
        this.graph.edges().forEach( edge => {
            if(edge.v === speciesName || edge.w === speciesName) return; // skip edges of removed species
            simulateGraph.setEdge(edge.v.toLowerCase(), edge.w.toLowerCase());
        } );

        results.forEach(({ species, impactFactor, direction }) => {
            const initialPopulation = species.population || 0;
            const adjustedPopulation = Math.max(0, Math.floor(initialPopulation * impactFactor));
            console.log(`Species: ${species.name.toLowerCase()} (${direction}), Initial: ${initialPopulation}, Adjusted: ${adjustedPopulation}, Impact: ${impactFactor.toFixed(2)}`);

            const simSpecies = simulateGraph.node(species.name.toLowerCase() );
            if (simSpecies) {
                simSpecies.population = adjustedPopulation;
                simulateGraph.setNode(species.name.toLowerCase(), simSpecies);
            }
        });

        return { results, simulatedGraph: simulateGraph };

    }

}

export { FoodChain };