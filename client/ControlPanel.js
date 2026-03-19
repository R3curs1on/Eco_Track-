import Storage from '../Storage.js';
import CriticalPopulation from './CriticalPopulation.js';
import { FoodChain } from '../FoodChain.js';
import { Animal, Plant } from './Species.js'; 
const storage = new Storage();
const criticalPopulation = new CriticalPopulation();
const foodChain = new FoodChain();

let addAnimalBtn, addPlantBtn , removeAnimalBtn, removePlantBtn ;  
let animalForm, plantForm , removeAnimalForm, removePlantForm ; 

document.addEventListener('DOMContentLoaded', () => {
    initializeDOM();
    setupEventListeners();
    loadSampleData(); 
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


function toggleForm(type) {
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

        storage.getAllSpecies().filter(s => s instanceof Animal).forEach(animal => {
            const option = document.createElement('option');
            option.value = animal.name;
            option.textContent = animal.name;
            removeOption.appendChild(option);
        });

    }   
    else if (type === 'remove-plant') {
        removePlantForm.style.display = removePlantForm.style.display === 'none' ? 'block' : 'none';
        removeAnimalForm.style.display = 'none';
        let removeOption = document.getElementById('remove-plant-name');
        removeOption.innerHTML = '<option value="">-- Select --</option>';
        
        storage.getAllSpecies().filter(s => s instanceof Plant).forEach(plant => {
            const option = document.createElement('option');
            option.value = plant.name;
            option.textContent = plant.name;
            removeOption.appendChild(option);
        });

    }

}

function handleAnimalSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const name = formData.get('animal-name');
    const speciesType = formData.get('animal-type');
    const habitat = formData.get('animal-habitat');
    const population = parseInt(formData.get('animal-population'));
    const healthStatus = formData.get('animal-health');
    const age = parseInt(formData.get('animal-age'));
    const eatsRaw = formData.get('animal-eats');
    const eats = eatsRaw.split(',').map(item => item.trim()).filter(item => item);
    
    const animal = new Animal(name, speciesType, habitat, population, healthStatus, age, eats);
    
    storage.addSpecies(animal);
    foodChain.addSpecies(animal);
    
    if (population < 30 || healthStatus.toLowerCase() === 'critical') {
        criticalPopulation.enqueue(animal);
    }
    
    e.target.reset();
    animalForm.style.display = 'none';  
    showNotification(`Animal "${name}" added successfully!`);
}

function handlePlantSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const name = formData.get('plant-name');
    const speciesType = formData.get('plant-type');
    const habitat = formData.get('plant-habitat');
    const population = parseInt(formData.get('plant-population'));
    const growthStage = formData.get('plant-growth');
    const age = parseInt(formData.get('plant-age'));
    
    const plant = new Plant(name, speciesType, habitat, population, growthStage, age);
    
    storage.addSpecies(plant);
    foodChain.addSpecies(plant);
    
    if (population < 30 || growthStage.toLowerCase() === 'dying') {
        criticalPopulation.enqueue(plant);
    }
    
    e.target.reset();
    plantForm.style.display = 'none';
     
    showNotification(`Plant "${name}" added successfully!`);
}
function handleRemoveAnimalSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('animal-name');
    
    if (!name) {
        showNotification('Please enter animal name', 'error');
        return;
    }
    
    const species = storage.getSpecies(name);
    if (!species) {
        showNotification(`Animal "${name}" not found`, 'error');
        return;
    }
    
    // Remove from all data structures
    storage.removeSpecies(name);
    foodChain.removeSpecies(name);
    criticalPopulation.removeSpecies(name);
    
    showNotification(`${name} removed successfully!`);
    e.target.reset();
    removeAnimalForm.style.display = 'none';
}

function handleRemovePlantSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('plant-name');
    
    if (!name) {
        showNotification('Please enter plant name', 'error');
        return;
    }
    
    const species = storage.getSpecies(name);
    if (!species) {
        showNotification(`Plant "${name}" not found`, 'error');
        return;
    }
    
    // Remove from all data structures
    storage.removeSpecies(name);
    foodChain.removeSpecies(name);
    criticalPopulation.removeSpecies(name);
    
    showNotification(`${name} removed successfully!`);
    e.target.reset();
    removePlantForm.style.display = 'none';
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


function loadSampleData() {
    const saved = localStorage.getItem('ecotrack-species');
    if (saved && saved !== '[]') {
        console.log('Using existing data from localStorage');
        
        // Clear existing foodChain and criticalPopulation
        // They may have stale data
        storage.getAllSpecies().forEach(species => {
            foodChain.addSpecies(species);
            if (species.population < 30) {
                criticalPopulation.enqueue(species);
            }
        });
        
        showNotification('Loaded existing ecosystem data');
        return;
    }
    
    const grass = new Plant('grass', 'Producer', 'Grassland', 500, 'mature', 2);
        const berryBush = new Plant('berry bush', 'Producer', 'Forest', 200, 'fruiting', 5);
        const oak = new Plant('oak tree', 'Producer', 'Forest', 150, 'mature', 50);
        
        [grass, berryBush, oak].forEach(plant => {
            storage.addSpecies(plant);
            foodChain.addSpecies(plant);
        });
         
        const rabbit = new Animal('rabbit', 'Herbivore', 'Grassland', 120, 'healthy', 3, ['grass', 'berry bush']);
        const deer = new Animal('deer', 'Herbivore', 'Forest', 80, 'healthy', 5, ['grass', 'berry bush', 'oak tree']);
        const fox = new Animal('fox', 'Carnivore', 'Forest', 25, 'critical', 4, ['rabbit']);
        const wolf = new Animal('wolf', 'Carnivore', 'Forest', 15, 'critical', 6, ['rabbit', 'deer']);
        const hawk = new Animal('hawk', 'Carnivore', 'Sky', 20, 'critical', 3, ['rabbit']);
        
        [rabbit, deer, fox, wolf, hawk].forEach(animal => {
            storage.addSpecies(animal);
            foodChain.addSpecies(animal);
            if (animal.population < 30) {
                criticalPopulation.enqueue(animal);
            }
        });
     
    showNotification('Sample ecosystem data loaded');
}
 
window.ecoTrack = {
    storage,
    criticalPopulation,
    foodChain, 
};

window.ecoTrack = {
    storage,
    criticalPopulation,
    foodChain, 
};


