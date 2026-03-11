import Storage from './Storage.js';
import CriticalPopulation from './CriticalPopulation.js';
import { FoodChain } from './FoodChain.js';
import { Animal, Plant } from './Species.js';
import { renderCytoScape } from './RenderCytoscape.js'; 

const storage = new Storage();
const criticalPopulation = new CriticalPopulation();
const foodChain = new FoodChain();

let  visualizeBtn, simulateBtn; 

let speciesSelect  ;  
let cyInstance = null; 

document.addEventListener('DOMContentLoaded', () => {
    initializeDOM();
    setupEventListeners();
    console.log('DOM loaded, initializing app... loading optios ');
    loadSampleData(); 
});


function initializeDOM() {
    visualizeBtn = document.getElementById('visualize-btn');
    simulateBtn = document.getElementById('simulate-btn');
     
 
    speciesSelect = document.getElementById('species-select'); 

}


function setupEventListeners() { 
    visualizeBtn.addEventListener('click', visualizeFoodChain);
    simulateBtn.addEventListener('click', handleSimulateRemoval);
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
        updateSpeciesSelect();
        showNotification('Loaded existing ecosystem data');
        return;
    }
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


