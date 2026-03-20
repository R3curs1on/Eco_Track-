import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import speciesRoutes from './routes/species.js'; 


const PORT = 5000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static('client'));

const MONGODB_URL = 'mongodb://localhost:27017/ecotrack';
mongoose.connect(MONGODB_URL ).then(
    () => {console.log('Connected to MongoDB');}).catch(
    (error) => {console.error('Error connecting to MongoDB:', error); }
);

app.listen( PORT, () => {
    console.log(`your server is running on http://localhost:${PORT}`);
});

app.get("/", (req,res)=>{
    console.log("Hello from EcoTrack server!");
    res.sendFile("./index.html" , {root : "./client"} );
});

app.get("/simulate", (req,res)=>{
    console.log("Simulating species removal..."); 
    res.sendFile("SImulation.html", {root : "./client"});
});

app.get("/control-panel", (req,res)=>{
    console.log("Accessing Control Panel...");
    res.sendFile("./ControlPanel.html", {root : "./client"});
});

app.use('/api/species', speciesRoutes);