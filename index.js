// Main application entry point
import Storage from './Storage.js';
import CriticalPopulation from './CriticalPopulation.js';
import { FoodChain } from './FoodChain.js';
import { Animal, Plant } from './Species.js';
import { renderCytoScape } from './RenderCytoscape.js';

// Initialize core data structures
const storage = new Storage();
const criticalPopulation = new CriticalPopulation();
const foodChain = new FoodChain();

// DOM Elements
let addAnimalBtn, addPlantBtn, visualizeBtn //, simulateBtn;
let animalForm, plantForm, dashboardDiv, alertsDiv ; // ,speciesSelect ;

// Cytoscape instances
let cyInstance = null; 
// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeDOM();
    setupEventListeners();
    loadSampleData();
    updateDashboard();
});



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
     
    showNotification('Sample ecosystem data loaded');
}

function initializeDOM() {
    addAnimalBtn = document.getElementById('add-animal-btn');
    addPlantBtn = document.getElementById('add-plant-btn');
    visualizeBtn = document.getElementById('visualize-btn');
    
    animalForm = document.getElementById('animal-form');
    plantForm = document.getElementById('plant-form'); 
    dashboardDiv = document.getElementById('dashboard');
    alertsDiv = document.getElementById('alerts');
}

function setupEventListeners() {
    if(addAnimalBtn) addAnimalBtn.addEventListener('click', () => toggleForm('animal'));
    if(addPlantBtn) addPlantBtn.addEventListener('click', () => toggleForm('plant'));
    
    if(document.getElementById('animal-form-submit')) {
        document.getElementById('animal-form-submit').addEventListener('submit', handleAnimalSubmit);
    }
    if(document.getElementById('plant-form-submit')) {
        document.getElementById('plant-form-submit').addEventListener('submit', handlePlantSubmit);
    }
    
    if(visualizeBtn) visualizeBtn.addEventListener('click', visualizeFoodChain);
    // if(simulateBtn) simulateBtn.addEventListener('click', handleSimulateRemoval);
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
    updateDashboard(); 
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
    showNotification(`Plant "${name}" added successfully!`);
}

function updateDashboard() {
    const allSpecies = storage.getAllSpecies();
    
    let html = '<h3>Species Overview</h3>';
    html += '<div class="species-grid">';
    
    allSpecies.forEach(species => {
        const statusClass = species.population === 0 ? 'extinct' : 
                          species.population < 30 ? 'critical' : 'stable';
        
        html += `
            <div class="species-card ${statusClass}">
                <h4>${species.name}</h4>
                <p><strong>Type:</strong> ${species.speciesType}</p>
                <p><strong>Habitat:</strong> ${species.habitat}</p>
                <p><strong>Population:</strong> ${species.population}</p>
                <p><strong>Status:</strong> <span class="status-badge ${statusClass}">${
                    species.population === 0 ? 'EXTINCT' : 
                    species.population < 30 ? 'CRITICAL' : 'STABLE'
                }</span></p>
            </div>
        `;
    });
    
    html += '</div>';
    if(dashboardDiv) dashboardDiv.innerHTML = html;
    
    updateAlerts();
}

function updateAlerts() {
    const critical = criticalPopulation.getCriticalSpecies(30);
    
    if (critical.length === 0) {
        alertsDiv.innerHTML = '<p class="no-alerts">✓ No critical populations detected</p>';
        return;
    }
    
    let html = '<h3>⚠️ Critical Population Alerts</h3>';
    html += '<div class="alert-list">';
    
    critical.forEach(species => {
        html += `
            <div class="alert-item ${species.population === 0 ? 'extinct' : 'critical'}">
                <strong>${species.name}</strong>: Population ${species.population} 
                ${species.population === 0 ? '(EXTINCT)' : '(CRITICAL)'}
            </div>
        `;
    });
    
    html += '</div>';
    alertsDiv.innerHTML = html;
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


// Export for debugging
window.ecoTrack = {
    storage,
    criticalPopulation,
    foodChain,
    visualizeFoodChain,
    updateDashboard
};
