
// queue (priority queue) for critical population species monitoring

import { Heap } from 'heap-js';

class CriticalPopulation {
    constructor() {
        this.queue = new Heap((a, b) => a.population - b.population);
    }
    enqueue(species) {  this.queue.push(species); }
    
    dequeue() {  return this.queue.pop(); }

    peek() { return this.queue.peek();   }

    isEmpty() {return this.queue.isEmpty(); }

    getAll() {return this.queue.toArray(); }

    getCriticalSpecies(threshold=2) {
        if(this.isEmpty())return ;
        return this.getAll().filter( s => s.population <= threshold)
    }

    updateSpecies(species) {
        this.queue = this.queue.filter(s => s.name.toLowerCase() !== species.name.toLowerCase() );
        this.enqueue(species);
    }

    giveAlert(){
        if(this.isEmpty()){
            console.log("No species in critical population queue.");
            return;
        }

        const criticalSpecies = this.getCriticalSpecies();
        if(criticalSpecies.length === 0){
            console.log("No species currently in critical population.");
            return;
        }

        console.log("Alert! The following species are in critical population:");
        criticalSpecies.forEach(species => {
            console.log(`- ${species.name.toLowerCase() } (Population: ${species.population})`);
        });
        return criticalSpecies;
    }

}

export default CriticalPopulation;