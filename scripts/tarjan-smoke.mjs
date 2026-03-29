import { runTarjanSmokeTest } from '../client/graph/TarjanAlgo.js';

const result = runTarjanSmokeTest();

console.log(JSON.stringify(result, null, 2));
