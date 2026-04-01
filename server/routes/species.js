import express from 'express';
import Species from '../models/species.js';
import { syncFoodChainFromSpecies } from '../seed.js';

const router = express.Router();

function normalizeSpeciesPayload(payload) {
    return {
        ...payload,
        name: payload?.name ? String(payload.name).trim().toLowerCase() : undefined,
        speciesType: payload?.speciesType ? String(payload.speciesType).trim() : undefined,
        habitat: payload?.habitat ? String(payload.habitat).trim() : undefined,
        healthStatus: payload?.healthStatus ? String(payload.healthStatus).trim() : undefined,
        growthStage: payload?.growthStage ? String(payload.growthStage).trim() : undefined,
        eats: Array.isArray(payload?.eats)
            ? payload.eats.map((item) => String(item).trim().toLowerCase()).filter(Boolean)
            : undefined
    };
}

function sendServerError(res, action, error, statusCode = 500) {
    console.error(`${action} failed:`, error);
    res.status(statusCode).json({ error: error.message });
}

async function syncFoodChainBestEffort(action) {
    try {
        await syncFoodChainFromSpecies();
    } catch (error) {
        console.error(`${action}: foodchain sync failed:`, error);
    }
}

router.get('/', async (_req, res) => {
    try {
        const species = await Species.find().sort({ name: 1 });
        res.json(species);
    } catch (error) {
        sendServerError(res, 'GET /api/species', error);
    }
});

router.get('/:name', async (req, res) => {
    try {
        const species = await Species.findOne({ name: String(req.params.name).toLowerCase() });
        if (!species) {
            return res.status(404).json({ error: 'Species not found' });
        }

        res.json(species);
    } catch (error) {
        sendServerError(res, 'GET /api/species/:name', error);
    }
});

router.post('/', async (req, res) => {
    try {
        const payload = normalizeSpeciesPayload(req.body);
        const species = await Species.create(payload);
        void syncFoodChainBestEffort('POST /api/species');
        res.status(201).json(species);
    } catch (error) {
        sendServerError(res, 'POST /api/species', error, 400);
    }
});

router.put('/:name', async (req, res) => {
    try {
        const payload = normalizeSpeciesPayload(req.body);
        delete payload.name;

        const updatedSpecies = await Species.findOneAndUpdate(
            { name: String(req.params.name).toLowerCase() },
            payload,
            { new: true, runValidators: true }
        );

        if (!updatedSpecies) {
            return res.status(404).json({ error: 'Species not found' });
        }

        void syncFoodChainBestEffort('PUT /api/species/:name');
        res.json(updatedSpecies);
    } catch (error) {
        sendServerError(res, 'PUT /api/species/:name', error, 400);
    }
});

router.delete('/:name', async (req, res) => {
    try {
        const result = await Species.deleteOne({ name: String(req.params.name).toLowerCase() });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Species not found' });
        }

        void syncFoodChainBestEffort('DELETE /api/species/:name');
        res.json({ ok: true });
    } catch (error) {
        sendServerError(res, 'DELETE /api/species/:name', error);
    }
});

export default router;
