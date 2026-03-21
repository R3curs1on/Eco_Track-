// Main application entry point
// // import Storage from '../Storage.js';
// import CriticalPopulation from './CriticalPopulation.js';
// import { FoodChain } from '../FoodChain.js';
// import { Animal, Plant } from './Species.js';
// import { renderCytoScape } from './RenderCytoscape.js';
// import ApiService from './ApiService.js';

import CriticalPopulation from './CriticalPopulation.js';
import { FoodChain } from './FoodChain.js'; // fixed
import { Animal, Plant } from './Species.js';
import { renderCytoScape } from './RenderCytoscape.js';
import ApiService from './ApiService.js';

// Initialize core data structures
// const storage = new Storage();
const criticalPopulation = new CriticalPopulation();
const foodChain = new FoodChain();

// DOM Elements
let visualizeBtn ;//, simulateBtn;
let animalForm, plantForm, dashboardDiv, alertsDiv ; // ,speciesSelect ;

// Cytoscape instances
let cyInstance = null; 
// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeDOM();
    setupEventListeners();
    // loadSampleData();
    loadFromDatabase();
    updateDashboard();
});



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
//     // Sample plants
//     const grass = new Plant('grass', 'Producer', 'Grassland', 500, 'mature', 2);
//         const berryBush = new Plant('berry bush', 'Producer', 'Forest', 200, 'fruiting', 5);
//         const oak = new Plant('oak tree', 'Producer', 'Forest', 150, 'mature', 50);
        
//         [grass, berryBush, oak].forEach(plant => {
//             storage.addSpecies(plant);
//             foodChain.addSpecies(plant);
//         });
        
//         // Sample animals
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
    
//     // updateSpeciesSelect();
//     showNotification('Sample ecosystem data loaded');
// }

// Replace loadSampleData() with:
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

    updateDashboard();
    showNotification('Ecosystem loaded from database');
  } catch (err) {
    console.log('err caught '+err.message );
    showNotification('Failed to load data: ' + err.message, 'error');
  }
}


function initializeDOM() { 
    visualizeBtn = document.getElementById('visualize-btn');
    dashboardDiv = document.getElementById('dashboard');
    alertsDiv = document.getElementById('alerts');
}

function setupEventListeners() {
    visualizeBtn.addEventListener('click', visualizeFoodChain); 
}
    
async function updateDashboard() {
    // const allSpecies = storage.getAllSpecies();
    try{
        const allSpecies = await ApiService.getAllSpecies();
        console.log('yes loaded and got some species' + allSpecies.length);
        if (allSpecies.length === 0) {
            await seedSampleData();   // only seed if DB is empty
            return;
        }

        let html = '<h3>Species Overview</h3>';
        html += '<div class="species-grid">';

    // Rebuild in-memory graph from DB data
    allSpecies.forEach(species => {
        const statusClass =  species.population === 0 ? 'extinct' :  species.population < 30 ? 'critical' : 'stable';
        const populationStage = species.speciesType=='animal' ? species.healthStatus : species.growthStage ;
            html += `
                <div class="species-card ${statusClass}">
                    <h4>${species.name}</h4>
                    <p><strong>Type:</strong> ${species.speciesType}</p>
                    <p><strong>Habitat:</strong> ${species.habitat}</p>
                    <p><strong>Population:</strong> ${species.population}</p>
                    <p><strong>Status:</strong> 
                        <span class="status-badge ${statusClass}">
                        ${
                            // species.population === 0 ? 'EXTINCT' : 
                            // species.population < 30 ? 'CRITICAL' : 'STABLE'
                            populationStage
                        }
                        </span>
                    </p>
                </div>
            `;
    });

        html += '</div>';
        if(dashboardDiv) dashboardDiv.innerHTML = html;

        updateAlerts();
        
        // allSpecies.forEach(species => {
        //     const statusClass = species.population === 0 ? 'extinct' : 
        //                       species.population < 30 ? 'critical' : 'stable';

        //     html += `
        //         <div class="species-card ${statusClass}">
        //             <h4>${species.name}</h4>
        //             <p><strong>Type:</strong> ${species.speciesType}</p>
        //             <p><strong>Habitat:</strong> ${species.habitat}</p>
        //             <p><strong>Population:</strong> ${species.population}</p>
        //             <p><strong>Status:</strong> <span class="status-badge ${statusClass}">${
        //                 species.population === 0 ? 'EXTINCT' : 
        //                 species.population < 30 ? 'CRITICAL' : 'STABLE'
        //             }</span></p>
        //         </div>
        //     `;
        // });

        // html += '</div>';
        // if(dashboardDiv) dashboardDiv.innerHTML = html;

        // updateAlerts();
    }
    catch(err){

    }
}

function updateAlerts() {
    const critical = criticalPopulation.getCriticalSpecies();
    
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
    // storage,
    ApiService,
    criticalPopulation,
    foodChain,
    visualizeFoodChain,
    updateDashboard
};
