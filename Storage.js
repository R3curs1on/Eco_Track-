// to be discarded - was used in earlier dev of local storage handling, now we are using indexedDB for better performance and reliability

// hashmap or map in js for storing species ( animal or plants ) data

import { Animal, Plant, Species } from './client/Species.js';

class Storage {
    constructor() {
        this.speciesMap = new Map();  // key : species name , value : species object ( animal or plant )
        this.loadFromLocalStorage();
    }
    loadFromLocalStorage() {
        const saved = localStorage.getItem('ecotrack-species');
        if (saved) {
            const data = JSON.parse(saved);
            data.forEach(item => {
                let species;
                if (item.eats) {
                    species = new Animal(item.name.toLowerCase(), item.speciesType, item.habitat, 
                                        item.population, item.healthStatus, item.age, item.eats);
                } else {
                    species = new Plant(item.name.toLowerCase(), item.speciesType, item.habitat,
                                       item.population, item.growthStage, item.age);
                }
                this.speciesMap.set(species.name.toLowerCase(), species);
            });
        }
    }

    saveToLocalStorage() {
        const data = Array.from(this.speciesMap.values()).map(species => ({
            name: species.name.toLowerCase(),
            speciesType: species.speciesType,
            habitat: species.habitat,
            population: species.population,
            age: species.age,
            ...(species.eats ? { eats: species.eats, healthStatus: species.healthStatus } : 
                { growthStage: species.growthStage })
        }));
        localStorage.setItem('ecotrack-species', JSON.stringify(data));
    }

    addSpecies(species) {
        species.name = species.name.toLowerCase(); // ensure name is stored in lowercase for consistency
        this.speciesMap.set(species.name, species);
        this.saveToLocalStorage();
    }

    getSpecies(name) {
        if (!this.speciesMap.has(name.toLowerCase())) {
            console.log("no species found with name `$(name)` !!!")
            return null;
        }
        return this.speciesMap.get(name.toLowerCase());
    }

    getAllSpecies() {
        return Array.from(this.speciesMap.values());
    }

    removeSpecies(name) {
        this.speciesMap.delete(name.toLowerCase());
        this.saveToLocalStorage();
    }

}

export default Storage;


