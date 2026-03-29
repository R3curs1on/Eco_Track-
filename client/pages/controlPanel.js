import CriticalPopulation from '../core/CriticalPopulation.js';
import { FoodChain } from '../core/FoodChain.js';
import { syncEcosystemState } from '../core/EcosystemRepository.js';
import { broadcastEcosystemChanged } from '../services/EcosystemEvents.js';
import ApiService from '../services/ApiService.js';
import { showNotification } from '../ui/notifications.js';

const criticalPopulation = new CriticalPopulation();
const foodChain = new FoodChain();

const dom = {};
let cachedSpecies = [];

document.addEventListener('DOMContentLoaded', async () => {
    initializeDOM();
    setupEventListeners();
    await refreshLocalState();
});

function initializeDOM() {
    dom.addAnimalBtn = document.getElementById('add-animal-btn');
    dom.addPlantBtn = document.getElementById('add-plant-btn');
    dom.updateSpeciesBtn = document.getElementById('update-species-btn');
    dom.removeAnimalBtn = document.getElementById('remove-animal-btn');
    dom.removePlantBtn = document.getElementById('remove-plant-btn');

    dom.animalForm = document.getElementById('animal-form');
    dom.plantForm = document.getElementById('plant-form');
    dom.updateSpeciesForm = document.getElementById('update-species-form');
    dom.removeAnimalForm = document.getElementById('remove-animal-form');
    dom.removePlantForm = document.getElementById('remove-plant-form');

    dom.animalEatsSelect = document.getElementById('animal-eats-options');
    dom.updateSpeciesSelect = document.getElementById('update-species-name');
    dom.updateSpeciesDisplayName = document.getElementById('update-species-display-name');
    dom.updateSpeciesType = document.getElementById('update-species-type');
    dom.updateSpeciesHabitat = document.getElementById('update-species-habitat');
    dom.updateSpeciesPopulation = document.getElementById('update-species-population');
    dom.updateSpeciesAge = document.getElementById('update-species-age');
    dom.updateAnimalFields = document.getElementById('update-animal-fields');
    dom.updatePlantFields = document.getElementById('update-plant-fields');
    dom.updateSpeciesHealth = document.getElementById('update-species-health');
    dom.updateSpeciesGrowth = document.getElementById('update-species-growth');
    dom.updateSpeciesEats = document.getElementById('update-species-eats');
    dom.removeAnimalSelect = document.getElementById('remove-animal-name');
    dom.removePlantSelect = document.getElementById('remove-plant-name');

    dom.animalFormSubmit = document.getElementById('animal-form-submit');
    dom.plantFormSubmit = document.getElementById('plant-form-submit');
    dom.updateSpeciesFormSubmit = document.getElementById('update-species-form-submit');
    dom.removeAnimalFormSubmit = document.getElementById('remove-animal-form-submit');
    dom.removePlantFormSubmit = document.getElementById('remove-plant-form-submit');
}

function setupEventListeners() {
    dom.addAnimalBtn.addEventListener('click', () => toggleForm('animal'));
    dom.addPlantBtn.addEventListener('click', () => toggleForm('plant'));
    dom.updateSpeciesBtn.addEventListener('click', () => toggleForm('update-species'));
    dom.removeAnimalBtn.addEventListener('click', () => toggleForm('remove-animal'));
    dom.removePlantBtn.addEventListener('click', () => toggleForm('remove-plant'));

    dom.animalFormSubmit.addEventListener('submit', handleAnimalSubmit);
    dom.plantFormSubmit.addEventListener('submit', handlePlantSubmit);
    dom.updateSpeciesFormSubmit.addEventListener('submit', handleUpdateSpeciesSubmit);
    dom.removeAnimalFormSubmit.addEventListener('submit', handleRemoveAnimalSubmit);
    dom.removePlantFormSubmit.addEventListener('submit', handleRemovePlantSubmit);
    dom.updateSpeciesSelect.addEventListener('change', handleUpdateSpeciesSelection);
}

async function refreshLocalState() {
    try {
        const { species } = await syncEcosystemState(foodChain, criticalPopulation);
        cachedSpecies = species;
        populateAnimalEats();
        populateUpdateSpeciesSelector();
        populateRemovalSelectors();
    } catch (error) {
        showNotification(`Failed to load species data: ${error.message}`, 'error');
    }
}

function hideForms() {
    dom.animalForm.style.display = 'none';
    dom.plantForm.style.display = 'none';
    dom.updateSpeciesForm.style.display = 'none';
    dom.removeAnimalForm.style.display = 'none';
    dom.removePlantForm.style.display = 'none';
}

function toggleForm(type) {
    const targetMap = {
        animal: dom.animalForm,
        plant: dom.plantForm,
        'update-species': dom.updateSpeciesForm,
        'remove-animal': dom.removeAnimalForm,
        'remove-plant': dom.removePlantForm
    };

    const target = targetMap[type];
    const nextState = target.style.display === 'none' || !target.style.display ? 'block' : 'none';
    hideForms();
    target.style.display = nextState;

    if (nextState === 'block') {
        populateAnimalEats();
        populateUpdateSpeciesSelector();
        populateRemovalSelectors();
    }
}

function populateAnimalEats() {
    dom.animalEatsSelect.innerHTML = '<option value="">-- Select --</option>';

    cachedSpecies.forEach((species) => {
        const option = document.createElement('option');
        option.value = species.name;
        option.textContent = `${species.name} (${species.speciesType})`;
        dom.animalEatsSelect.appendChild(option);
    });
}

function populateRemovalSelectors() {
    dom.removeAnimalSelect.innerHTML = '<option value="">-- Select --</option>';
    dom.removePlantSelect.innerHTML = '<option value="">-- Select --</option>';

    cachedSpecies.forEach((species) => {
        const option = document.createElement('option');
        option.value = species.name;
        option.textContent = species.name;

        if (species.healthStatus) {
            dom.removeAnimalSelect.appendChild(option);
        } else {
            dom.removePlantSelect.appendChild(option);
        }
    });
}

function populateUpdateSpeciesSelector() {
    const previousValue = dom.updateSpeciesSelect.value;
    dom.updateSpeciesSelect.innerHTML = '<option value="">-- Select --</option>';

    cachedSpecies.forEach((species) => {
        const option = document.createElement('option');
        option.value = species.name;
        option.textContent = species.name;
        dom.updateSpeciesSelect.appendChild(option);
    });

    if (previousValue && cachedSpecies.some((species) => species.name === previousValue)) {
        dom.updateSpeciesSelect.value = previousValue;
        fillUpdateForm(previousValue);
    } else {
        resetUpdateFormFields();
    }
}

function handleUpdateSpeciesSelection(event) {
    fillUpdateForm(event.target.value);
}

function resetUpdateFormFields() {
    dom.updateSpeciesDisplayName.value = '';
    dom.updateSpeciesType.value = '';
    dom.updateSpeciesHabitat.value = '';
    dom.updateSpeciesPopulation.value = '';
    dom.updateSpeciesAge.value = '';
    dom.updateSpeciesHealth.value = '';
    dom.updateSpeciesGrowth.value = '';
    dom.updateSpeciesEats.value = '';
    dom.updateAnimalFields.style.display = 'none';
    dom.updatePlantFields.style.display = 'none';
}

function fillUpdateForm(speciesName) {
    const species = cachedSpecies.find((item) => item.name === speciesName);
    if (!species) {
        resetUpdateFormFields();
        return;
    }

    dom.updateSpeciesDisplayName.value = species.name;
    dom.updateSpeciesType.value = species.speciesType || '';
    dom.updateSpeciesHabitat.value = species.habitat || '';
    dom.updateSpeciesPopulation.value = Number(species.population || 0);
    dom.updateSpeciesAge.value = Number(species.age || 0);

    if (species.healthStatus) {
        dom.updateAnimalFields.style.display = 'grid';
        dom.updatePlantFields.style.display = 'none';
        dom.updateSpeciesHealth.value = species.healthStatus || '';
        dom.updateSpeciesEats.value = Array.isArray(species.eats) ? species.eats.join(', ') : '';
        dom.updateSpeciesGrowth.value = '';
    } else {
        dom.updateAnimalFields.style.display = 'none';
        dom.updatePlantFields.style.display = 'grid';
        dom.updateSpeciesGrowth.value = species.growthStage || '';
        dom.updateSpeciesHealth.value = '';
        dom.updateSpeciesEats.value = '';
    }
}

async function handleAnimalSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const animalData = {
        name: formData.get('animal-name'),
        speciesType: formData.get('animal-type'),
        habitat: formData.get('animal-habitat'),
        population: Number(formData.get('animal-population')),
        healthStatus: formData.get('animal-health'),
        age: Number(formData.get('animal-age')),
        eats: [formData.get('animal-eats')].filter(Boolean)
    };

    try {
        await ApiService.addSpecies(animalData);
        await refreshLocalState();
        broadcastEcosystemChanged('animal-added');
        event.target.reset();
        hideForms();
        showNotification(`Animal "${animalData.name}" added`);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function handlePlantSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const plantData = {
        name: formData.get('plant-name'),
        speciesType: formData.get('plant-type'),
        habitat: formData.get('plant-habitat'),
        population: Number(formData.get('plant-population')),
        growthStage: formData.get('plant-growth'),
        age: Number(formData.get('plant-age'))
    };

    try {
        await ApiService.addSpecies(plantData);
        await refreshLocalState();
        broadcastEcosystemChanged('plant-added');
        event.target.reset();
        hideForms();
        showNotification(`Plant "${plantData.name}" added`);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function handleRemoveAnimalSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('remove-animal-name');

    if (!name) {
        showNotification('Select an animal to remove', 'error');
        return;
    }

    try {
        await ApiService.removeSpecies(name);
        await refreshLocalState();
        broadcastEcosystemChanged('animal-removed');
        event.target.reset();
        hideForms();
        showNotification(`${name} removed`);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function handleUpdateSpeciesSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('update-species-name');
    const currentSpecies = cachedSpecies.find((species) => species.name === name);

    if (!currentSpecies) {
        showNotification('Select a species to update', 'error');
        return;
    }

    const payload = {
        speciesType: formData.get('update-species-type'),
        habitat: formData.get('update-species-habitat'),
        population: Number(formData.get('update-species-population')),
        age: Number(formData.get('update-species-age'))
    };

    if (currentSpecies.healthStatus) {
        payload.healthStatus = formData.get('update-species-health');
        payload.eats = String(formData.get('update-species-eats') || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    } else {
        payload.growthStage = formData.get('update-species-growth');
    }

    try {
        await ApiService.updateSpecies(name, payload);
        await refreshLocalState();
        broadcastEcosystemChanged('species-updated');
        fillUpdateForm(name);
        showNotification(`${name} updated`);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function handleRemovePlantSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('remove-plant-name');

    if (!name) {
        showNotification('Select a plant to remove', 'error');
        return;
    }

    try {
        await ApiService.removeSpecies(name);
        await refreshLocalState();
        broadcastEcosystemChanged('plant-removed');
        event.target.reset();
        hideForms();
        showNotification(`${name} removed`);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

window.ecoTrack = {
    criticalPopulation,
    foodChain
};
