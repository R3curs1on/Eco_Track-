import express from 'express';
import FoodChain from '../models/foodchain.js';
import { syncFoodChainFromSpecies } from '../seed.js';

const router = express.Router();

function sendServerError(res, action, error, statusCode = 500) {
    console.error(`${action} failed:`, error);
    res.status(statusCode).json({ error: error.message });
}

router.get('/', async (_req, res) => {
    try {
        const foodChain = await FoodChain.find().sort({ predator: 1, prey: 1 });
        res.json(foodChain);
    } catch (error) {
        sendServerError(res, 'GET /api/foodchain', error);
    }
});

router.post('/sync', async (_req, res) => {
    try {
        const { foodChain } = await syncFoodChainFromSpecies();
        res.json(foodChain);
    } catch (error) {
        sendServerError(res, 'POST /api/foodchain/sync', error);
    }
});

export default router;
