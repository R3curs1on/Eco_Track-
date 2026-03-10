import Storage from './Storage.js';
import CriticalPopulation from './CriticalPopulation.js';
import { FoodChain } from './FoodChain.js';
import { Animal, Plant } from './Species.js';
import { renderCytoScape } from './RenderCytoscape.js';

// Initialize core data structures
const storage = new Storage();
const criticalPopulation = new CriticalPopulation();
const foodChain = new FoodChain();

let addAnimalBtn, addPlantBtn, visualizeBtn, simulateBtn; 

let animalForm, plantForm, speciesSelect  ; // , dashboardDiv, alertsDiv;

let cyInstance = null; 

document.addEventListener('DOMContentLoaded', () => {
    initializeDOM();
    setupEventListeners();
    loadSampleData(); 
});


function initializeDOM() {
    addAnimalBtn = document.getElementById('add-animal-btn');
    addPlantBtn = document.getElementById('add-plant-btn');
    visualizeBtn = document.getElementById('visualize-btn');
    simulateBtn = document.getElementById('simulate-btn');
     

    animalForm = document.getElementById('animal-form');
    plantForm = document.getElementById('plant-form');
    speciesSelect = document.getElementById('species-select'); 

}


function setupEventListeners() {
    addAnimalBtn.addEventListener('click', () => toggleForm('animal'));
    addPlantBtn.addEventListener('click', () => toggleForm('plant'));
     
    document.getElementById('animal-form-submit').addEventListener('submit', handleAnimalSubmit);
    
    document.getElementById('plant-form-submit').addEventListener('submit', handlePlantSubmit);
    
    visualizeBtn.addEventListener('click', visualizeFoodChain);
    simulateBtn.addEventListener('click', handleSimulateRemoval);

}


function toggleForm(type) {
    if (type === 'animal') {
        animalForm.style.display = animalForm.style.display === 'none' ? 'block' : 'none';
        plantForm.style.display = 'none';
    } else {
        plantForm.style.display = plantForm.style.display === 'none' ? 'block' : 'none';
        animalForm.style.display = 'none';
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
    
    if (population < 30) {
        criticalPopulation.enqueue(animal);
    }
    
    e.target.reset();
    animalForm.style.display = 'none'; 
    updateSpeciesSelect();
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
    
    if (population < 30) {
        criticalPopulation.enqueue(plant);
    }
    
    e.target.reset();
    plantForm.style.display = 'none';
    updateDashboard();
    updateSpeciesSelect();
    showNotification(`Plant "${name}" added successfully!`);
}


function updateSpeciesSelect() {
    const allSpecies = storage.getAllSpecies();
    speciesSelect.innerHTML = '<option value="">-- Select Species --</option>';
    
    allSpecies.forEach(species => {
        const option = document.createElement('option');
        option.value = species.name;
        option.textContent = `${species.name} (${species.speciesType})`;
        speciesSelect.appendChild(option);
    });
}


function visualizeFoodChain() {
    const container = document.getElementById('cy');
    if (!container) {
        showNotification('Visualization container not found', 'error');
        return;
    }
    
    try {
        // Destroy previous instance if it exists
        if (cyInstance) {
            cyInstance.destroy();
            cyInstance = null;
        }
        
        // Clear the container
        container.innerHTML = '';
        
        // Create new visualization
        cyInstance = renderCytoScape(foodChain.graph, container.id);
        showNotification('Food chain visualized!');
    } catch (error) {
        console.error('Visualization error:', error);
        showNotification('Error visualizing food chain: ' + error.message, 'error');
    }
}



function handleSimulateRemoval() {
    const selectedSpecies = speciesSelect.value;
    
    if (!selectedSpecies) {
        showNotification('Please select a species to simulate removal', 'error');
        return;
    }
    
    const result = foodChain.simulateRemoval(selectedSpecies);
    
    if (!result) {
        showNotification('Species not found in food chain', 'error');
        return;
    }
    
    const { results, simulatedGraph } = result;
    
    // Render simulated graph
    try {
        // Destroy previous instance if it exists
        if (cyInstance) {
            cyInstance.destroy();
            cyInstance = null;
        }
        
        // Clear the container
        const container = document.getElementById('cy');
        if (container) {
            container.innerHTML = '';
        }
        
        // Create new visualization with simulated data
        cyInstance = renderCytoScape(simulatedGraph, 'cy');
        
        // Show impact summary
        let impactHTML = `<h3>Impact of Removing "${selectedSpecies}"</h3>`;
        impactHTML += '<div class="impact-list">';
        
        results.forEach(({ species, impactFactor }) => {
            const severity = impactFactor > 0.7 ? 'high' : impactFactor > 0.3 ? 'medium' : 'low';
            impactHTML += `
                <div class="impact-item ${severity}">
                    <strong>${species.name}</strong>: 
                    Impact ${(impactFactor * 100).toFixed(0)}% 
                    (Pop: ${species.population})
                </div>
            `;
        });
        
        impactHTML += '</div>';
        
        const impactDiv = document.getElementById('simulation-results');
        if (impactDiv) {
            impactDiv.innerHTML = impactHTML;
            impactDiv.style.display = 'block';
        }
        
        showNotification(`Simulation complete: ${results.length} species affected`);
    } catch (error) {
        console.error('Simulation error:', error);
        showNotification('Error during simulation: ' + error.message, 'error');
    }
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
    // Sample plants
    const grass = new Plant('grass', 'Producer', 'Grassland', 500, 'mature', 2);
        const berryBush = new Plant('berry bush', 'Producer', 'Forest', 200, 'fruiting', 5);
        const oak = new Plant('oak tree', 'Producer', 'Forest', 150, 'mature', 50);
        
        [grass, berryBush, oak].forEach(plant => {
            storage.addSpecies(plant);
            foodChain.addSpecies(plant);
        });
        
        // Sample animals
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
    
    updateSpeciesSelect();
    showNotification('Sample ecosystem data loaded');
}

// Export for debugging
window.ecoTrack = {
    storage,
    criticalPopulation,
    foodChain,
    visualizeFoodChain
};

window.ecoTrack = {
    storage,
    criticalPopulation,
    foodChain,
    visualizeFoodChain
};


