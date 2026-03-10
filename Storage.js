
// hashmap or map in js for storing species ( animal or plants ) data

import { Animal, Plant, Species } from './Species.js';

class Storage {
    constructor() {
        this.speciesMap = new Map();  // key : species name , value : species object ( animal or plant )
    }

    addSpecies(species) {
        this.speciesMap.set(species.name.toLowerCase(), species);
    }

    getSpecies(name) {
        if (!this.speciesMap.has(name.toLowerCase())) {
            return null;
        }
        return this.speciesMap.get(name.toLowerCase());
    }

    getAllSpecies() {
        return Array.from(this.speciesMap.values());
    }

    removeSpecies(name) {
        this.speciesMap.delete(name);
    }

}

export default Storage;


