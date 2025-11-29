// src/services/PInteresService.js

import APIService from './APIService'; 

const PINTERES_ENDPOINT = '/pinteres';

class PInteresService {
    
    async getAll() {
        return APIService.request(PINTERES_ENDPOINT, 'GET');
    }

    async search(name) {
        return APIService.request(`${PINTERES_ENDPOINT}/search?name=${encodeURIComponent(name)}`, 'GET');
    }

    async create(data) {
        return APIService.request(PINTERES_ENDPOINT, 'POST', data);
    }

    async update(id, data) {
        return APIService.request(`${PINTERES_ENDPOINT}/${id}`, 'PUT', data);
    }

    async delete(id) {
        return APIService.request(`${PINTERES_ENDPOINT}/${id}`, 'DELETE');
    }
}

export default new PInteresService();