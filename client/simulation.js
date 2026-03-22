// import Storage from '../Storage.js';
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

// const storage = new Storage();
const criticalPopulation = new CriticalPopulation();
const foodChain = new FoodChain();

let  visualizeBtn, simulateBtn; 
let  keystoneSpeciescontainer ;

let speciesSelect  ;  
let cyInstance = null; 

document.addEventListener('DOMContentLoaded', () => {
    initializeDOM();
    setupEventListeners();
    console.log('DOM loaded, initializing app... loading optios ');
    // loadSampleData(); 
    loadFromDatabase();
});


function initializeDOM() {
    visualizeBtn = document.getElementById('visualize-btn');
    simulateBtn = document.getElementById('simulate-btn');
     
    keystoneSpeciescontainer = document.getElementById('Keystone-species-show-button');
    speciesSelect = document.getElementById('species-select'); 

}


function setupEventListeners() { 
    visualizeBtn.addEventListener('click', visualizeFoodChain);
    simulateBtn.addEventListener('click', handleSimulateRemoval);
    keystoneSpeciescontainer.addEventListener('click', fillKeystoneSpeciesInfo );
}


async function updateSpeciesSelect() {
    // const allSpecies = storage.getAllSpecies();
    // speciesSelect.innerHTML = '<option value="">-- Select Species --</option>';
    
    // allSpecies.forEach(species => {
    //     const option = document.createElement('option');
    //     option.value = species.name;
    //     option.textContent = `${species.name} (${species.speciesType})`;
    //     speciesSelect.appendChild(option);
    // });

    try {
        const allSpecies = await ApiService.getAllSpecies();  // fetch from MongoDB
        if (allSpecies.length === 0) {
          await seedSampleData();   // only seed if DB is empty
          return;
        }

        speciesSelect.innerHTML = '<option value="">-- Select Species --</option>';

        // Rebuild in-memory graph from DB data
        allSpecies.forEach(species => {
            const option = document.createElement('option');
            option.value = species.name;
            option.textContent = `${species.name} (${species.speciesType})`;
            speciesSelect.appendChild(option);
        });

  } catch (err) {
    showNotification('Failed to load data: ' + err.message, 'error');
  }

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
async function fillKeystoneSpeciesInfo() {
    try {
        const keystoneSpecies = await foodChain.findKeystoneSpecies();
        const container = document.getElementById('Keystone-species-list');
        keystoneSpecies.forEach( speciesAndImpact =>{
            const species = speciesAndImpact.species;
            const impactList = speciesAndImpact.impactList;
            // <!-- <button id="Speciesi"> Speciesi </button>
            //         <ul id="speciesi-impact" class="species-impact"> // keep css property hidden until button click
            //             <li> speciesj : impact x% </li>
            //         </ul> -->

            const speciesBtn = document.createElement('button');
            speciesBtn.textContent = species.name;
            speciesBtn.className = 'keystone-species-btn';
            container.appendChild(speciesBtn);

            const impactUl = document.createElement('ul');
            impactUl.className = 'species-impact';
            impactUl.style.display = 'none'; // hide by default

            impactUl.innerHTML = impactList.map(impact =>
                `<li>${impact.species.name}: impact ${(impact.impactFactor * 100).toFixed(0)}%</li>`
            ).join('');

            speciesBtn.addEventListener('click', () => {  
                impactUl.style.display = impactUl.style.display === 'none' ? 'block' : 'none';
            });

            container.appendChild(impactUl);
        });
    }
    catch (error) {
        console.error('Error finding keystone species:', error);
        showNotification('Error finding keystone species: ' + error.message, 'error');
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
//         updateSpeciesSelect();
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
    
//     updateSpeciesSelect();
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
    
    updateSpeciesSelect();
    // updateDashboard();
    showNotification('Ecosystem loaded from database');
  } catch (err) {
    showNotification('Failed to load data: ' + err.message, 'error');
  }
}

// Export for debugging
window.ecoTrack = {
    // storage,
    criticalPopulation,
    foodChain,
    visualizeFoodChain
};


