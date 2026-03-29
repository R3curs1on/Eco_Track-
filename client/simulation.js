import CriticalPopulation from './CriticalPopulation.js';
import { FoodChain } from './FoodChain.js';
import { renderCytoScape } from './RenderCytoscape.js';
import { syncEcosystemState } from './EcosystemRepository.js';
import { analyzeEcosystem } from './EcosystemAnalyzer.js';
import { applySandboxSession, createSandboxSession } from './SandboxMode.js';
import { broadcastEcosystemChanged } from './EcosystemEvents.js';
import { toTitleCase } from './speciesUtils.js';

const criticalPopulation = new CriticalPopulation();
const foodChain = new FoodChain();

const state = {
    species: [],
    analysis: null,
    sandboxSession: null,
    cyInstance: null
};

const dom = {};

document.addEventListener('DOMContentLoaded', async () => {
    initializeDOM();
    setupEventListeners();
    await refreshLiveSnapshot();
});

function initializeDOM() {
    dom.visualizeBtn = document.getElementById('visualize-btn');
    dom.simulateBtn = document.getElementById('simulate-btn');
    dom.applyBtn = document.getElementById('apply-btn');
    dom.speciesSelect = document.getElementById('species-select');
    dom.sandboxStatus = document.getElementById('sandbox-status');
    dom.simulationResults = document.getElementById('simulation-results');
    dom.keystonePanel = document.getElementById('keystone-panel');
}

function setupEventListeners() {
    dom.visualizeBtn.addEventListener('click', () => {
        refreshLiveSnapshot(true);
    });

    dom.simulateBtn.addEventListener('click', handleSandboxSimulation);
    dom.applyBtn.addEventListener('click', handleApplySandbox);
}

async function refreshLiveSnapshot(showToast = false) {
    try {
        const { species } = await syncEcosystemState(foodChain, criticalPopulation);
        state.species = species;
        state.analysis = analyzeEcosystem(foodChain);
        state.sandboxSession = null;

        populateSpeciesSelect();
        renderKeystonePanel();
        renderLiveGraph();
        renderIdleSandbox();

        if (showToast) {
            showNotification('Live snapshot refreshed');
        }
    } catch (error) {
        dom.sandboxStatus.textContent = `Failed to refresh live snapshot: ${error.message}`;
        dom.simulationResults.innerHTML = `<h3>Impact Summary</h3><p>Failed to load live data: ${error.message}</p>`;
        showNotification(`Failed to load ecosystem: ${error.message}`, 'error');
    }
}

function populateSpeciesSelect() {
    dom.speciesSelect.innerHTML = '<option value="">-- Select Species --</option>';

    state.species.forEach((species) => {
        const option = document.createElement('option');
        option.value = species.name;
        option.textContent = `${toTitleCase(species.name)} (${toTitleCase(species.speciesType)})`;
        dom.speciesSelect.appendChild(option);
    });
}

function renderKeystonePanel() {
    const keystoneSpecies = state.analysis.keystoneSpecies;

    if (!keystoneSpecies.length) {
        dom.keystonePanel.innerHTML = '<p>No articulation-point keystone species detected in the live graph.</p>';
        return;
    }

    dom.keystonePanel.innerHTML = `
        <table class="analysis-table">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Impact Score</th>
                </tr>
            </thead>
            <tbody>
                ${keystoneSpecies.map((entry, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${toTitleCase(entry.species.name)}</td>
                        <td>${entry.impactScore}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderLiveGraph() {
    renderGraph(foodChain.graph, state.analysis);
}

function renderGraph(graph, analysis) {
    if (state.cyInstance) {
        state.cyInstance.destroy();
    }

    state.cyInstance = renderCytoScape(graph, 'cy', { analysis });
}

function handleSandboxSimulation() {
    const selectedSpecies = dom.speciesSelect.value;
    if (!selectedSpecies) {
        showNotification('Select a species before running the sandbox', 'error');
        return;
    }

    const session = createSandboxSession(foodChain, selectedSpecies);
    if (!session) {
        showNotification('Unable to build a sandbox scenario for that species', 'error');
        return;
    }

    state.sandboxSession = session;
    const sandboxChain = new FoodChain();
    sandboxChain.graph = session.simulation.simulatedGraph;
    const sandboxAnalysis = analyzeEcosystem(sandboxChain);

    renderGraph(session.simulation.simulatedGraph, sandboxAnalysis);
    renderSandboxResults();
    dom.applyBtn.disabled = false;
}

function renderIdleSandbox() {
    dom.applyBtn.disabled = true;
    dom.sandboxStatus.textContent = 'Sandbox is idle. The live ecosystem remains unchanged.';
    dom.simulationResults.innerHTML = `
        <h3>Impact Summary</h3>
        <p>Run a sandbox simulation to preview the removal impact.</p>
    `;
}

function renderSandboxResults() {
    const session = state.sandboxSession;
    const removedSpecies = session.simulation.removedSpecies;
    const impacts = session.simulation.results;

    dom.sandboxStatus.innerHTML = `
        Sandbox mode active. <strong>${toTitleCase(removedSpecies.name)}</strong> is removed only in memory.
        Live MongoDB data and the live graph are still unchanged.
    `;

    dom.simulationResults.innerHTML = `
        <h3>Impact Summary</h3>
        <p><strong>Removed Species:</strong> ${toTitleCase(removedSpecies.name)}</p>
        <p><strong>Total Population Lost:</strong> ${session.simulation.totalPopulationLoss}</p>
        <div class="impact-list">
            ${impacts.length ? impacts.map((impact) => {
                const severity = impact.populationLost > 50 ? 'high' : impact.populationLost > 10 ? 'medium' : 'low';
                return `
                    <div class="impact-item ${severity}">
                        <strong>${toTitleCase(impact.species.name)}</strong>
                        <span>${impact.direction === 'predator' ? 'Predator loses prey' : 'Prey loses predator'}</span>
                        <span>${impact.beforePopulation} → ${impact.afterPopulation}</span>
                    </div>
                `;
            }).join('') : '<p>No downstream species were affected.</p>'}
        </div>
    `;
}

async function handleApplySandbox() {
    if (!state.sandboxSession) {
        showNotification('No sandbox scenario is ready to apply', 'error');
        return;
    }

    try {
        await applySandboxSession(state.sandboxSession);
        broadcastEcosystemChanged('sandbox-applied');
        showNotification('Sandbox scenario applied to the live ecosystem');
        await refreshLiveSnapshot();
    } catch (error) {
        showNotification(`Failed to apply sandbox scenario: ${error.message}`, 'error');
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3200);
}

window.ecoTrack = {
    criticalPopulation,
    foodChain,
    refreshLiveSnapshot
};
