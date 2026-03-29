

import { Graph } from 'graphlib';
import { Animal, Plant, Species } from './Species.js';


class DSU{
    parent;
    rank;
    n;
    constructor(n) {
        this.n = n;
        this.parent = (new Array(n).fill(0)).map((_,i) => i);
        this.rank = (new Array(n).fill(0));
    }

    find(x){
        if(this.parent[x] != x){
            this.parent[x] = this.find(this.parent[x]);
        }
        return this.parent[x];
    }

    union(x,y){
        let rootX = this.find(x);
        let rootY = this.find(y);
        if(rootX == rootY) return;
        if(this.rank[rootX] > this.rank[rootY]){
            this.parent[rootY] = rootX;
            this.rank[rootX] += this.rank[rootY];
        }else{
            this.parent[rootX] = rootY;
            this.rank[rootY] += this.rank[rootX];
        }
    }

}

export { DSU };