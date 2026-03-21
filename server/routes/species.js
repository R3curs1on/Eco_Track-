// import express from 'express';
// import Species from '../models/species.js';

// const router = express.Router();

// router.get('/', async (req, res) => {
//   try {
//   const all = await Species.find();
//   res.json(all);
//   }
//   catch (error) {
//     res.status(500).json({ error: 'Error fetching species', details: error.message });
//   }
// });

// router.get( '/:name' , async (req,res) => {
//   if (!req.body.name) {return res.status(400).json({ error: "Name required" });}

//   const name = req.params.name.toLowerCase();
//   try {
//     const s = await Species.findOne({ name });
//     if (!s) {
//       return res.status(404).json({ error: 'Species not found' });
//     }
//     res.json(s);
//   }
//   catch (error) {
//     res.status(500).json({ error: 'Error fetching species', details: error.message });
//   }

// });

// router.post('/', async (req, res) => {
//     if (!req.body) {return res.status(400).json({ error: "No data provided" });}
//   try{
//     const s = await Species.create(req.body);
//     res.json(s);
//   } 
//   catch (error) {
//     res.status(400).json({ error: 'Error creating species', details: error.message });
//   }
// });

// router.put( '/:name' , async (req,res) =>{
//   if (!req.body.name) {return res.status(400).json({ error: "Name required" });}

//   const updateData = req.body;
//   const name = req.params.name.toLowerCase();
//   try {
//     const updated = await Species.findOneAndUpdate(
//       { name },
//       updateData ,
//       { new: true }
//     );
//     if (!updated) {
//       return res.status(404).json({ error: 'Species not found' });
//     }
//     res.json(updated);
//   }
//   catch (error) {
//     res.status(400).json({ error: 'Error updating species', details: error.message });
//   }

// })



// router.delete('/:name', async (req, res) => {
//   if (!req.body.name) {return res.status(400).json({ error: "Name required" });}

//   try {
//     await Species.deleteOne({ name: req.params.name.toLowerCase() });
//     res.json({ ok: true });
//   }
//   catch (error) {
//     res.status(500).json({ error: 'Error deleting species', details: error.message });
//   }
// });

// export default router;


import express from 'express';
import Species from '../models/species.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const all = await Species.find();
    res.json(all);
  } catch (error) {
    console.error('GET /api/species failed:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

router.get('/:name', async (req, res) => {
  try {
    const s = await Species.findOne({ name: req.params.name.toLowerCase() });
    if (!s) return res.status(404).json({ error: 'Species not found' });
    res.json(s);
  } catch (error) {
    console.error('GET /api/species/:name failed:', error);
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = { ...req.body, name: String(req.body.name || '').toLowerCase() };
    const s = await Species.create(payload);
    res.status(201).json(s);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:name', async (req, res) => {
  try {
    const updated = await Species.findOneAndUpdate(
      { name: req.params.name.toLowerCase() },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Species not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:name', async (req, res) => {
  try {
    await Species.deleteOne({ name: req.params.name.toLowerCase() });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;