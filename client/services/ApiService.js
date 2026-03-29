const BASE_URL = '/api/species';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function parseJsonSafely(response) {
    const text = await response.text();
    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

async function requestJson(path = '', options = {}, retries = 1) {
    let lastError = null;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            const response = await fetch(`${BASE_URL}${path}`, {
                headers: JSON_HEADERS,
                ...options
            });
            const payload = await parseJsonSafely(response);

            if (!response.ok) {
                const message = payload?.error || `Request failed with status ${response.status}`;
                throw new Error(message);
            }

            return payload;
        } catch (error) {
            lastError = error;
            if (attempt < retries) {
                await new Promise((resolve) => setTimeout(resolve, 300));
            }
        }
    }

    throw lastError || new Error('Unknown network error');
}

const ApiService = {
    async getAllSpecies() {
        return requestJson('', { method: 'GET' }, 2);
    },

    async getSpeciesByName(name) {
        return requestJson(`/${encodeURIComponent(name)}`, { method: 'GET' });
    },

    async addSpecies(speciesData) {
        return requestJson('', {
            method: 'POST',
            body: JSON.stringify(speciesData)
        });
    },

    async removeSpecies(name) {
        return requestJson(`/${encodeURIComponent(name)}`, { method: 'DELETE' });
    },

    async updateSpecies(name, updateData) {
        return requestJson(`/${encodeURIComponent(name)}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }
};

export default ApiService;
