import CriticalPopulation from './CriticalPopulation.js';
import { FoodChain } from './FoodChain.js';
import { renderCytoScape } from './RenderCytoscape.js';
import { syncEcosystemState } from './EcosystemRepository.js';
import { analyzeEcosystem } from './EcosystemAnalyzer.js';
import { subscribeToEcosystemChanges } from './EcosystemEvents.js';
import { getSpeciesStatus, inferTrophicLevel, toTitleCase } from './speciesUtils.js';

const criticalPopulation = new CriticalPopulation();
const foodChain = new FoodChain();

const state = {
    species: [],
    analysis: null,
    cyInstance: null,
    unsubscribe: () => {}
};

const dom = {};

document.addEventListener('DOMContentLoaded', async () => {
    initializeDOM();
    setupEventListeners();
    await refreshDashboard();
    state.unsubscribe = subscribeToEcosystemChanges(() => {
        refreshDashboard();
    });
});

window.addEventListener('beforeunload', () => {
    state.unsubscribe();
});

function initializeDOM() {
    dom.visualizeBtn = document.getElementById('visualize-btn');
    dom.legendToggleBtn = document.getElementById('legend-toggle');
    dom.statsBar = document.getElementById('stats-bar');
    dom.scoreSummary = document.getElementById('score-summary');
    dom.dashboard = document.getElementById('dashboard');
    dom.alerts = document.getElementById('alerts');
    dom.cycleNote = document.getElementById('cycle-note');
    dom.cyclePanel = document.getElementById('cycle-panel');
    dom.keystonePanel = document.getElementById('keystone-panel');
    dom.speciesInfoPanel = document.getElementById('species-info-panel');
    dom.graphLegend = document.getElementById('graph-legend');
}

function setupEventListeners() {
    dom.visualizeBtn.addEventListener('click', () => {
        refreshDashboard(true);
    });

    dom.legendToggleBtn.addEventListener('click', () => {
        dom.graphLegend.classList.toggle('hidden');
    });
}

async function refreshDashboard(showToast = false) {
    try {
        const { species } = await syncEcosystemState(foodChain, criticalPopulation);
        state.species = species;
        state.analysis = analyzeEcosystem(foodChain);

        renderStats();
        renderScoreSummary();
        renderSpeciesOverview();
        renderAlerts();
        renderCyclePanel();
        renderKeystonePanel();
        renderGraph();

        if (showToast) {
            showNotification('Dashboard synced with MongoDB');
        }
    } catch (error) {
        renderFailure(error);
    }
}

function renderStats() {
    const criticalCount = criticalPopulation.getCriticalSpecies().length;
    const extinctCount = state.species.filter((species) => Number(species.population || 0) === 0).length;
    const score = state.analysis?.score?.score || 0;

    dom.statsBar.innerHTML = `
        <div class="stat-card">
            <span class="stat-label">Total Species</span>
            <strong>${state.species.length}</strong>
        </div>
        <div class="stat-card">
            <span class="stat-label">Health Score</span>
            <strong>${score}</strong>
        </div>
        <div class="stat-card">
            <span class="stat-label">Critical Species</span>
            <strong>${criticalCount}</strong>
        </div>
        <div class="stat-card">
            <span class="stat-label">Extinct Species</span>
            <strong>${extinctCount}</strong>
        </div>
    `;
}

function renderScoreSummary() {
    const score = state.analysis.score;
    const weakestMessage = {
        biodiversity: 'Low biodiversity is pulling the score down.',
        trophicBalance: 'Trophic pyramid imbalance is weakening the ecosystem.',
        connectivity: 'Food-web connectivity is outside the target range.'
    };

    dom.scoreSummary.innerHTML = `
        <h2>Ecosystem Health</h2>
        <div class="score-pill">${score.score}/100</div>
        <div class="metric-grid">
            <div class="metric-chip">
                <span>Biodiversity</span>
                <strong>${score.metrics.biodiversity}</strong>
            </div>
            <div class="metric-chip">
                <span>Trophic Balance</span>
                <strong>${score.metrics.trophicBalance}</strong>
            </div>
            <div class="metric-chip">
                <span>Connectivity</span>
                <strong>${score.metrics.connectivity}</strong>
            </div>
        </div>
        <p class="analysis-caption">${weakestMessage[score.weakestMetric]}</p>
    `;
}

function renderSpeciesOverview() {
    const cards = state.species.map((species) => {
        const status = getSpeciesStatus(species);
        const stage = species.healthStatus || species.growthStage || 'unknown';

        return `
            <article class="species-card ${status}">
                <div class="species-card-header">
                    <h3>${toTitleCase(species.name)}</h3>
                    <span class="status-badge ${status}">${status}</span>
                </div>
                <p><strong>Type:</strong> ${toTitleCase(species.speciesType)}</p>
                <p><strong>Habitat:</strong> ${species.habitat || 'Unknown'}</p>
                <p><strong>Population:</strong> ${Number(species.population || 0)}</p>
                <p><strong>Lifecycle:</strong> ${toTitleCase(stage)}</p>
                <p><strong>Trophic Level:</strong> ${inferTrophicLevel(species)}</p>
            </article>
        `;
    }).join('');

    dom.dashboard.innerHTML = `
        <div class="section-heading compact">
            <div>
                <p class="eyebrow">Inventory</p>
                <h2>Species Overview</h2>
            </div>
        </div>
        <div class="species-grid">${cards}</div>
    `;
}

function renderAlerts() {
    const criticalSpecies = criticalPopulation.getCriticalSpecies();

    if (!criticalSpecies.length) {
        dom.alerts.innerHTML = `
            <h2>Critical Populations</h2>
            <p class="no-alerts">No species are currently in the critical population queue.</p>
        `;
        return;
    }

    dom.alerts.innerHTML = `
        <h2>Critical Populations</h2>
        <div class="alert-list">
            ${criticalSpecies.map((species) => `
                <div class="alert-item ${species.population === 0 ? 'extinct' : 'critical'}">
                    <strong>${toTitleCase(species.name)}</strong>
                    <span>Population ${species.population}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderCyclePanel() {
    const cycles = state.analysis.cycles;

    dom.cycleNote.innerHTML = cycles.length
        ? '<p>Feedback loops cause population oscillation. Cycle-member nodes are marked with orange borders.</p>'
        : '<p>No structural feedback loops detected in the current food web.</p>';

    if (!cycles.length) {
        dom.cyclePanel.innerHTML = `
            <h3>Cycles</h3>
            <p>No cycles detected.</p>
        `;
        return;
    }

    dom.cyclePanel.innerHTML = `
        <h3>Cycles</h3>
        <ul class="analysis-list">
            ${cycles.map((cycle) => `<li>${cycle.map(toTitleCase).join(' → ')} → ${toTitleCase(cycle[0])}</li>`).join('')}
        </ul>
    `;
}

function renderKeystonePanel() {
    const keystoneSpecies = state.analysis.keystoneSpecies;

    if (!keystoneSpecies.length) {
        dom.keystonePanel.innerHTML = `
            <h3>Keystone Ranking</h3>
            <p>No articulation-point keystone species were detected.</p>
        `;
        return;
    }

    dom.keystonePanel.innerHTML = `
        <h3>Keystone Ranking</h3>
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

function renderGraph() {
    if (state.cyInstance) {
        state.cyInstance.destroy();
        state.cyInstance = null;
    }

    state.cyInstance = renderCytoScape(foodChain.graph, 'cy', {
        analysis: state.analysis,
        onNodeTap: renderSpeciesInfo
    });

    const firstNode = foodChain.graph.nodes()[0];
    if (firstNode) {
        renderSpeciesInfo(foodChain.graph.node(firstNode));
    }
}

function renderSpeciesInfo(species) {
    if (!species) {
        dom.speciesInfoPanel.classList.add('empty');
        dom.speciesInfoPanel.innerHTML = `
            <h3>Species Details</h3>
            <p>Select a node in the graph to inspect predators, prey, trophic level, and robustness impact.</p>
        `;
        return;
    }

    const prey = foodChain.getAllPrey(species.name).map(toTitleCase);
    const predators = foodChain.getAllPredators(species.name).map(toTitleCase);
    const robustnessImpact = state.analysis.robustnessByName[species.name] || 0;
    const isKeystone = state.analysis.keystoneSet.has(species.name);

    dom.speciesInfoPanel.classList.remove('empty');
    dom.speciesInfoPanel.innerHTML = `
        <h3>${toTitleCase(species.name)}</h3>
        ${isKeystone ? '<span class="badge badge-danger">Keystone Species</span>' : ''}
        <p><strong>Population:</strong> ${Number(species.population || 0)}</p>
        <p><strong>Trophic Level:</strong> ${inferTrophicLevel(species)}</p>
        <p><strong>Predators:</strong> ${predators.length ? predators.join(', ') : 'None'}</p>
        <p><strong>Prey:</strong> ${prey.length ? prey.join(', ') : 'None'}</p>
        <p><strong>Robustness Impact:</strong> ${robustnessImpact}% connectivity lost</p>
    `;
}

function renderFailure(error) {
    const message = `Failed to sync ecosystem data: ${error.message}`;
    dom.scoreSummary.innerHTML = `<h2>Ecosystem Health</h2><p>${message}</p>`;
    dom.dashboard.innerHTML = `<h2>Species Overview</h2><p>${message}</p>`;
    dom.alerts.innerHTML = `<h2>Critical Populations</h2><p>${message}</p>`;
    dom.cyclePanel.innerHTML = `<h3>Cycles</h3><p>${message}</p>`;
    dom.keystonePanel.innerHTML = `<h3>Keystone Ranking</h3><p>${message}</p>`;
    dom.cycleNote.innerHTML = `<p>${message}</p>`;
    renderSpeciesInfo(null);
    showNotification(message, 'error');
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
    refreshDashboard
};
