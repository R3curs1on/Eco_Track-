
class Species {

    constructor(name , speciesType , habitat) {
        this.name = name.toLowerCase();
        this.speciesType = speciesType;
        this.habitat = habitat;
    }

}

class Animal extends Species {
    
    constructor(name, speciesType, habitat, population, healthStatus , age , eats ) {
        super(name, speciesType, habitat);   // call parent constructor for name etc 
        this.population = population;      // number of individuals decides health of species
        this.healthStatus = healthStatus;  // eg 5 stages from critical to excellent
        this.age = age;    // in years
        this.eats = eats;  // can be a list of food items
    }
    
}

class Plant extends Species {
    
    constructor(name, speciesType, habitat, population  , growthStage , age ) {
        super(name, speciesType, habitat);   // call parent constructor for name etc    
        this.growthStage = growthStage;  // eg seedling, mature , flowering , Fruiting , dormant , dying
        this.population = population;     // number of individuals decides health of species
        this.age = age;
    }
    
}

export { Animal, Plant, Species };




