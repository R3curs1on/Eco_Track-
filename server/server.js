import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import foodChainRoutes from './routes/foodchain.js';
import speciesRoutes from './routes/species.js';
import { seedDatabaseIfNeeded } from './seed.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT );//|| 5000);
const HOST = process.env.HOST || '0.0.0.0';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecotrack';

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
});

app.use('/api/species', speciesRoutes);
app.use('/api/foodchain', foodChainRoutes);

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        return seedDatabaseIfNeeded();
    })
    .then(({ species, foodChain }) => {
        console.log(`Seed check complete: ${species.length} species, ${foodChain.length} food-chain edges`);
        app.listen(PORT, HOST, () => {
            console.log(`Server running on http://${HOST}:${PORT}`);
            if (process.env.RENDER_EXTERNAL_URL) {
                console.log(`Public URL: ${process.env.RENDER_EXTERNAL_URL}`);
            }
        });
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    });
