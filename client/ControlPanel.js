// import Storage from '../Storage.js';
import CriticalPopulation from './CriticalPopulation.js';
import { FoodChain } from './FoodChain.js';
import { Animal, Plant } from './Species.js'; 
import ApiService from './ApiService.js';
// const storage = new Storage();
const criticalPopulation = new CriticalPopulation();
const foodChain = new FoodChain();

let addAnimalBtn, addPlantBtn , removeAnimalBtn, removePlantBtn ;  
let animalForm, plantForm , removeAnimalForm, removePlantForm ; 

document.addEventListener('DOMContentLoaded', () => {
    initializeDOM();
    setupEventListeners();
    // loadSampleData(); 
    loadFromDatabase();
});


function initializeDOM() {
    addAnimalBtn = document.getElementById('add-animal-btn');
    addPlantBtn = document.getElementById('add-plant-btn'); 
    removeAnimalBtn = document.getElementById('remove-animal-btn');
    removePlantBtn = document.getElementById('remove-plant-btn');

    animalForm = document.getElementById('animal-form');
    plantForm = document.getElementById('plant-form'); 
    removeAnimalForm = document.getElementById('remove-animal-form');
    removePlantForm = document.getElementById('remove-plant-form');


}


function setupEventListeners() {
    addAnimalBtn.addEventListener('click', () => toggleForm('animal'));
    addPlantBtn.addEventListener('click', () => toggleForm('plant'));

    removeAnimalBtn.addEventListener('click', () => toggleForm('remove-animal'));
    removePlantBtn.addEventListener('click', () => toggleForm('remove-plant'));
     
    document.getElementById('animal-form-submit').addEventListener('submit', handleAnimalSubmit);
    document.getElementById('plant-form-submit').addEventListener('submit', handlePlantSubmit);
    document.getElementById('remove-animal-form-submit').addEventListener('submit', handleRemoveAnimalSubmit);
    document.getElementById('remove-plant-form-submit').addEventListener('submit', handleRemovePlantSubmit);

}

async function toggleForm(type) {
    if (type === 'animal') {
        animalForm.style.display = animalForm.style.display === 'none' ? 'block' : 'none';
        plantForm.style.display = 'none';
    } else if (type === 'plant') {
        plantForm.style.display = plantForm.style.display === 'none' ? 'block' : 'none';
        animalForm.style.display = 'none';
    }
    else if (type === 'remove-animal') {
        removeAnimalForm.style.display = removeAnimalForm.style.display === 'none' ? 'block' : 'none';
        removePlantForm.style.display = 'none';
        let removeOption = document.getElementById('remove-animal-name');
        removeOption.innerHTML = '<option value="">-- Select --</option>';
        
        try {
            const allSpecies = await ApiService.getAllSpecies();  // fetch from MongoDB
            if (allSpecies.length === 0) {
                return;
            }

            allSpecies
            .filter(s => s.eats && Array.isArray(s.eats) )
            .forEach(animal => {
                const option = document.createElement('option');
                option.value = animal.name;
                option.textContent = animal.name;
                removeOption.appendChild(option);
            });

        }
        catch(err){
            console.log(' error removing animal '+err.message);
        }

    }   
    else if (type === 'remove-plant') {
        removePlantForm.style.display = removePlantForm.style.display === 'none' ? 'block' : 'none';
        removeAnimalForm.style.display = 'none';
        let removeOption = document.getElementById('remove-plant-name');
        removeOption.innerHTML = '<option value="">-- Select --</option>';
        
         try {
            const allSpecies = await ApiService.getAllSpecies();  // fetch from MongoDB
            if (allSpecies.length === 0) {
                // await seedSampleData();   // only seed if DB is empty
                return;
            }

        // const allSpecies = storage.getAllSpecies();

            allSpecies
            .filter(s => !s.eats && !Array.isArray(s.eats) === false )
            .forEach(plant => {
                const option = document.createElement('option');
                option.value = plant.name;
                option.textContent = plant.name;
                removeOption.appendChild(option);
            });

        }
        catch(err){
            console.log(' error removing animal '+err.message);
        }

    }

}

async function handleAnimalSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const animalData = { 
     name : formData.get('animal-name'),
     speciesType : formData.get('animal-type'),
     habitat : formData.get('animal-habitat'),
     population :parseInt(formData.get('animal-population')),
     healthStatus : formData.get('animal-health'),
     age : parseInt(formData.get('animal-age')),
     eats : formData.get('animal-eats').split(',').map(item => item.trim()).filter(item => item),
    }
    
    try {
        await ApiService.addSpecies(animalData);   // ← save to MongoDB
        const animal = new Animal(           // ← update local graph
          animalData.name, animalData.speciesType,
          animalData.habitat, animalData.population,
          animalData.healthStatus, animalData.age,
          animalData.eats
        );
        foodChain.addSpecies(animal);

        if (animalData.population < 30 || animalData.healthStatus.toLowerCase() === 'critical') {
            criticalPopulation.enqueue(animal);
         }

         e.target.reset();
         animalForm.style.display = 'none';  
        showNotification(`Animal "${animalData.name}" added!`);
    } catch (err) {
        showNotification(err.message, 'error');
    }

}

async function handlePlantSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const plantData = {
     name : formData.get('plant-name'),
     speciesType : formData.get('plant-type'),
     habitat : formData.get('plant-habitat'),
     population :parseInt(formData.get('plant-population')),
     growthStage : formData.get('plant-growth'),
     age : parseInt(formData.get('plant-age'))
    }
    
    try {
        await ApiService.addSpecies(plantData);   // ← save to MongoDB
        const plant  = new Plant(           // ← update local graph
          plantData.name, plantData.speciesType,
          plantData.habitat, plantData.population,
          plantData.growthStage, plantData.age
        );
        foodChain.addSpecies(plant);

        if (plantData.population < 30 || plantData.growthStage.toLowerCase() === 'dying') {
            criticalPopulation.enqueue(plant);
         }

         e.target.reset();
         plantForm.style.display = 'none';  
        showNotification(`Plant "${plantData.name}" added!`);
    } catch (err) {
        showNotification(err.message, 'error');
    }   

    // const name = formData.get('plant-name');
    // const speciesType = formData.get('plant-type');
    // const habitat = formData.get('plant-habitat');
    // const population = parseInt(formData.get('plant-population'));
    // const growthStage = formData.get('plant-growth');
    // const age = parseInt(formData.get('plant-age'));
    
    // const plant = new Plant(name, speciesType, habitat, population, growthStage, age);
    
    // storage.addSpecies(plant);
    // foodChain.addSpecies(plant);
    
    // if (population < 30 || growthStage.toLowerCase() === 'dying') {
    //     criticalPopulation.enqueue(plant);
    // }
    // e.target.reset();
    // plantForm.style.display = 'none';
     
    // showNotification(`Plant "${name}" added successfully!`);
}
async function handleRemoveAnimalSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('animal-name');
    
    if (!name) {
        showNotification('Please enter animal name', 'error');
        return;
    }
    
    // const species = storage.getSpecies(name);

    try {
        const remove = await ApiService.removeSpecies(name) ; 
        foodChain.removeSpecies(name);
        criticalPopulation.removeSpecies(name);
        
        showNotification(`${name} removed successfully!`);
        e.target.reset();
        removeAnimalForm.style.display = 'none';
    }
    catch(err){
        console.log('err remove animal submit () '+err.message);
    }

    // if (!species) {
    //     showNotification(`Animal "${name}" not found`, 'error');
    //     return;
    // }
    
    // Remove from all data structures
    // storage.removeSpecies(name);
    // foodChain.removeSpecies(name);
    // criticalPopulation.removeSpecies(name);
    
    // showNotification(`${name} removed successfully!`);
    // e.target.reset();
    // removeAnimalForm.style.display = 'none';
}

async function handleRemovePlantSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('plant-name');
    
    if (!name) {
        showNotification('Please enter plant name', 'error');
        return;
    }
    
    // const species = storage.getSpecies(name);

    // if (!species) {
    //     showNotification(`Plant "${name}" not found`, 'error');
    //     return;
    // }

    try {
        const remove = await ApiService.removeSpecies(name) ; 
        foodChain.removeSpecies(name);
        criticalPopulation.removeSpecies(name);
        
        showNotification(`${name} removed successfully!`);
        e.target.reset();
        removePlantForm.style.display = 'none';
    }
    catch(err){
        console.log('err remove animal submit () '+err.message);
    }


    
    // Remove from all data structures
    // storage.removeSpecies(name);
    // foodChain.removeSpecies(name);
    // criticalPopulation.removeSpecies(name);
    
    // showNotification(`${name} removed successfully!`);
    // e.target.reset();
    // removePlantForm.style.display = 'none';
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}


// function loadSampleData() {
//     const saved = localStorage.getItem('ecotrack-species');
//     if (saved && saved !== '[]') {
//         console.log('Using existing data from localStorage');
        
//         // Clear existing foodChain and criticalPopulation
//         // They may have stale data
//         storage.getAllSpecies().forEach(species => {
//             foodChain.addSpecies(species);
//             if (species.population < 30) {
//                 criticalPopulation.enqueue(species);
//             }
//         });
        
//         showNotification('Loaded existing ecosystem data');
//         return;
//     }
    
//     const grass = new Plant('grass', 'Producer', 'Grassland', 500, 'mature', 2);
//         const berryBush = new Plant('berry bush', 'Producer', 'Forest', 200, 'fruiting', 5);
//         const oak = new Plant('oak tree', 'Producer', 'Forest', 150, 'mature', 50);
        
//         [grass, berryBush, oak].forEach(plant => {
//             storage.addSpecies(plant);
//             foodChain.addSpecies(plant);
//         });
         
//         const rabbit = new Animal('rabbit', 'Herbivore', 'Grassland', 120, 'healthy', 3, ['grass', 'berry bush']);
//         const deer = new Animal('deer', 'Herbivore', 'Forest', 80, 'healthy', 5, ['grass', 'berry bush', 'oak tree']);
//         const fox = new Animal('fox', 'Carnivore', 'Forest', 25, 'critical', 4, ['rabbit']);
//         const wolf = new Animal('wolf', 'Carnivore', 'Forest', 15, 'critical', 6, ['rabbit', 'deer']);
//         const hawk = new Animal('hawk', 'Carnivore', 'Sky', 20, 'critical', 3, ['rabbit']);
        
//         [rabbit, deer, fox, wolf, hawk].forEach(animal => {
//             storage.addSpecies(animal);
//             foodChain.addSpecies(animal);
//             if (animal.population < 30) {
//                 criticalPopulation.enqueue(animal);
//             }
//         });
     
//     showNotification('Sample ecosystem data loaded');
// }
// Replace loadSampleData() with:
// ...existing code...
async function seedSampleData() {
  const samples = [
    { name: 'grass', speciesType: 'Producer', habitat: 'Grassland', population: 500, growthStage: 'mature', age: 2 },
    { name: 'berry bush', speciesType: 'Producer', habitat: 'Forest', population: 200, growthStage: 'fruiting', age: 5 },
    { name: 'oak tree', speciesType: 'Producer', habitat: 'Forest', population: 150, growthStage: 'mature', age: 50 },
    { name: 'rabbit', speciesType: 'Herbivore', habitat: 'Grassland', population: 120, healthStatus: 'healthy', age: 3, eats: ['grass', 'berry bush'] },
    { name: 'deer', speciesType: 'Herbivore', habitat: 'Forest', population: 80, healthStatus: 'healthy', age: 5, eats: ['grass', 'berry bush', 'oak tree'] },
    { name: 'fox', speciesType: 'Carnivore', habitat: 'Forest', population: 25, healthStatus: 'critical', age: 4, eats: ['rabbit'] },
    { name: 'wolf', speciesType: 'Carnivore', habitat: 'Forest', population: 15, healthStatus: 'critical', age: 6, eats: ['rabbit', 'deer'] },
    { name: 'hawk', speciesType: 'Carnivore', habitat: 'Sky', population: 20, healthStatus: 'critical', age: 3, eats: ['rabbit'] }
  ];

  for (const s of samples) {
    try {
      await ApiService.addSpecies(s);
      let species;
      if (s.eats) {
        species = new Animal(s.name, s.speciesType, s.habitat, s.population, s.healthStatus, s.age, s.eats);
      } else {
        species = new Plant(s.name, s.speciesType, s.habitat, s.population, s.growthStage, s.age);
      }
      foodChain.addSpecies(species);
      if (s.population < 30) criticalPopulation.enqueue(species);
    } catch (e) {
      console.error(`Failed to seed ${s.name}:`, e);
    }
  }
  updateSpeciesSelect();
  showNotification('Sample data seeded');
}

async function loadFromDatabase() {
  try {
    const speciesList = await ApiService.getAllSpecies();  // fetch from MongoDB

    if (speciesList.length === 0) {
      await seedSampleData();   // only seed if DB is empty
      return;
    }

    // Rebuild in-memory graph from DB data
    speciesList.forEach(data => {
      let species;
      if (data.eats) {
        species = new Animal(
          data.name, data.speciesType, data.habitat,
          data.population, data.healthStatus, data.age,
          data.eats
        );
      } else {
        species = new Plant(
          data.name, data.speciesType, data.habitat,
          data.population, data.growthStage, data.age
        );
      }
      foodChain.addSpecies(species);       // rebuild graph
      if (species.population < 30) {
        criticalPopulation.enqueue(species); // rebuild queue
      }
    });

    // updateDashboard();
    showNotification('Ecosystem loaded from database');
  } catch (err) {
    showNotification('Failed to load data: ' + err.message, 'error');
  }
}
 
window.ecoTrack = {
    // storage,
    criticalPopulation,
    foodChain, 
};