import express from 'express';
import Species from '../models/Species.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const all = await Species.find();
  res.json(all);
});

router.post('/', async (req, res) => {
  const s = await Species.create(req.body);
  res.json(s);
});

router.delete('/:name', async (req, res) => {
  await Species.deleteOne({ name: req.params.name });
  res.json({ ok: true });
});

export default router;