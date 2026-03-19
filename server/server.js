import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const PORT = 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static('client'));

app.listen( PORT, () => {
    console.log(`your server is running on http://localhost:${PORT}`);
});

app.get("/", (req,res)=>{
    console.log("Hello from EcoTrack server!");
    res.sendFile("./index.html" , {root : "./client"} );
});

app.get("/simulate", (req,res)=>{
    console.log("Simulating species removal...");
    console.log(process.cwd());
    res.sendFile("SImulation.html", {root : "./client"});
});

app.get("/control-panel", (req,res)=>{
    console.log("Accessing Control Panel...");
    res.sendFile("./ControlPanel.html", {root : "./client"});
});



