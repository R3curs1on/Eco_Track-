
// queue (priority queue) for critical population species monitoring

class CriticalPopulation {
    constructor() {
        this.queue = [];
    }

    enqueue(species) {
        this.queue.push(species);
        this.queue.sort((a, b) => a.population - b.population); // sort by population ascending
    }

    dequeue() {
        return this.queue.shift();
    }

    peek() {
        return this.queue[0];
    }

    isEmpty() {
        return this.queue.length === 0;
    }

    getAll() {
        return this.queue;
    }

    getCriticalSpecies(threshold=2) {

        if(this.isEmpty()){
            return ;
        }

        let level = 0 ;
        let criticalSpeciesList = [] ;
        let iter = 0;
        while(level<= threshold){
            const curr = this.queue[iter];
            criticalSpeciesList.push(curr);
            level = (curr.speciesType=='Animal') ? curr.healthStatus : curr.growthStage ;
            iter++;
            
        }
        return criticalSpeciesList;
    }

    updateSpecies(species) {
        this.queue = this.queue.filter(s => s.name.toLowerCase() !== species.name.toLowerCase() );
        this.enqueue(species);
    }


    giveAlert(){
        if(this.isEmpty()){
            console.log("No species in critical population queue.");
            return;
        }

        const criticalSpecies = this.getCriticalSpecies();
        if(criticalSpecies.length === 0){
            console.log("No species currently in critical population.");
            return;
        }

        console.log("Alert! The following species are in critical population:");
        criticalSpecies.forEach(species => {
            console.log(`- ${species.name.toLowerCase() } (Population: ${species.population})`);
        });
        return criticalSpecies;
    }

}

export default CriticalPopulation;