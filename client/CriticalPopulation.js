import { Heap } from 'heap-js';

class CriticalPopulation {
    constructor() {
        this.queue = new Heap((a, b) => a.population - b.population);
        this.speciesInQueue = new Set();
    }

    enqueue(species) {
        if (!species || !species.name) {
            console.warn('Invalid species for enqueue:', species);
            return;
        }
        const name = String(species.name).toLowerCase();
        if (!this.speciesInQueue.has(name)) {
            this.queue.push({ name, population: species.population });
            this.speciesInQueue.add(name);
        }
    }

    dequeue() {
        if (this.queue.isEmpty()) {
            console.warn('Attempted to dequeue from empty queue.');
            return null;
        }
        const removed = this.queue.pop();
        if (removed) {
            this.speciesInQueue.delete(removed.name);
        }
        return removed;
    }

    removeSpecies(speciesName) {
        const name = String(speciesName).toLowerCase();
        if (this.speciesInQueue.has(name)) {
            // heap-js doesn't support efficient removal, so rebuild
            const items = this.queue.toArray();
            this.queue = new Heap((a, b) => a.population - b.population);
            items.forEach(item => {
                if (item.name !== name) {
                    this.queue.push(item);
                }
            });
            this.speciesInQueue.delete(name);
        }
    }

    peek() {
        return this.queue.peek();
    }

    isEmpty() {
        return this.queue.isEmpty();
    }

    getAll() {
        return this.queue.toArray();
    }

    getCriticalSpecies() {
        const all = this.queue.toArray();
        return all.map(item => ({ name: item.name, population: item.population }));
    }

    updateSpecies(species) {
        if (!species || !species.name) return;
        const name = String(species.name).toLowerCase();
        if (this.speciesInQueue.has(name)) {
            this.removeSpecies(name);
            this.enqueue(species);
        }
    }

    giveAlert() {
        if (this.isEmpty()) {
            console.log('No species in critical population queue.');
            return [];
        }

        const criticalSpecies = this.getCriticalSpecies();
        if (criticalSpecies.length === 0) {
            console.log('No species currently in critical population.');
            return [];
        }

        console.log('Alert! The following species are in critical population:');
        criticalSpecies.forEach(species => {
            console.log(`- ${species.name} (Population: ${species.population})`);
        });
        return criticalSpecies;
    }
}

export default CriticalPopulation;