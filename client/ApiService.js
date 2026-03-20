
const BASE_URL = '/api/species';

const ApiService = {
    async getSpecies() {
        try {
            const response = await fetch(`${BASE_URL}`);
            if (!response.ok) {
                throw new Error('Failed to fetch species data');
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error fetching species:', error);
            throw error;
        }
    },

    async getSpeciesByName(name) {
        try{
            const response = await fetch(`${BASE_URL}/${encodeURIComponent(name)}`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            if (!response.ok) {
                throw new Error(`Failed to fetch species with name ${name}`);
            }
            return await response.json();
        } 
        catch (error) {
            console.error(`Error fetching species with name ${name}:`, error);
            throw error;
        }
    },

    async addSpecies(speciesData) {
        try{
            const response = await fetch(`${BASE_URL}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body : JSON.stringify(speciesData)
                }
            );
            if (!response.ok) {
                throw new Error(`Failed to add species with name ${speciesData.name}`);
            }
            return await response.json();
        } 
        catch (error) {
            console.error(`Error adding species withname ${speciesData.name}:`, error);
            throw error; 
        }
    },

    async removeSpecies(name) {
        try{
            const response = await fetch(`${BASE_URL}/${encodeURIComponent(name)}`,
                {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body : JSON.stringify({ name })
                }
            );
            if (!response.ok) {
                throw new Error(`Failed to remove species with name ${name}`);
            }
            return await response.json();
        } 
        catch (error) {
            console.error(`Error removing species with name ${name}:`, error);
            throw error;
        }
    },

    async updateSpecies(name, updateData) {
        try{
            const response = await fetch(`${BASE_URL}/${encodeURIComponent(name)}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body : JSON.stringify(updateData)
                }
            );
            if (!response.ok) {
                throw new Error(`Failed to update species with name ${name}`);
            }
            return await response.json();
        } 
        catch (error) {
            console.error(`Error updating species with name ${name}:`, error);
            throw error;
        }
    }
}

export default ApiService;
