/*
to implement : ( no need to implement here just for reference ; mongo has built in functions for these operations )

Species.find();
Species.findOne({ name }); 
Species.create(req.body);
Species.findOneAndUpdate(
    { name: req.params.name.toLocaleLowerCase() },
    updateData,
    { new: true }
);
Species.deleteOne({ name: req.params.name });

this is model file for species ; using mongoose to define schema and model for species collection in MongoDB
for reference :
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
*/
import mongoose from 'mongoose';

// Define the schema for Species
const speciesSchema = new mongoose.Schema(
    {
        name : { 
            type : String ,
            required : true ,
            unique : true , 
            lowercase : true , 
            trim : true },
        speciesType : {
            type : String , 
            lowercase : true ,
            required : true }, // animal or plant
        habitat : { 
            type : String , 
            required : true },
        population : { 
            type : Number , 
            min : 0 ,
            required : true },
        healthStatus : { type : String }, // for animals
        growthStage : { type : String },  // for plants
        age : { type : Number , min : 0 }, // in years
        eats : {
            type : [String] ,  // for animals, list of food items
            default : [] ,  // validate the food items exist in the database when adding/updating species
        }  
    },
    { timestamps : true }
);

// Create the model for Species
const Species = mongoose.model('Species' , speciesSchema);


export default Species;




