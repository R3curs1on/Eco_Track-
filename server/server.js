// import express from 'express';
// import bodyParser from 'body-parser';
// import cors from 'cors';
// import mongoose from 'mongoose';
// import speciesRoutes from './routes/species.js'; 
 
// import dotenv from 'dotenv'; 

// dotenv.config(); // Load environment variables from .env file

// const MONGODB_URI =  process.env.MONGODB_URI || 'mongodb://localhost:27017/ecotrack';
// const PORT = process.env.PORT ||  5000;
// const app = express();

// app.use(cors()); 
// app.use(express.json());  
// mongoose.connect(MONGODB_URI ).then(
//     () => {console.log('Connected to MongoDB');}).catch(
//     (error) => {console.error('Error connecting to MongoDB:', error); }
// );

// app.use( 'api/health', (_req,res) => {
//     res.json({ status : 'ok' });
// } );
// app.use('/api/species', speciesRoutes);
// app.listen( PORT, () => {
//     console.log(`your server is running on http://localhost:${PORT}`);
// });

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import speciesRoutes from './routes/species.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
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
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });