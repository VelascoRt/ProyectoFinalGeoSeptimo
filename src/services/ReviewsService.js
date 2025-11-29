// src/services/ReviewsService.js

import APIService from './APIService'; 

const REVIEWS_ENDPOINT = '/review';

class ReviewsService {
    
    // OBTENER por ID de Punto de Interés
    async getByPInteres(pinteresId) {
        return APIService.request(`${REVIEWS_ENDPOINT}/pinteres/${pinteresId}`, 'GET');
    }

    // CREAR
    async create(data) {
        return APIService.request(REVIEWS_ENDPOINT, 'POST', data);
    }

    // ACTUALIZAR
    async update(reviewId, data) {
        return APIService.request(`${REVIEWS_ENDPOINT}/${reviewId}`, 'PUT', data);
    }

    // ELIMINAR
    async delete(reviewId) {
        return APIService.request(`${REVIEWS_ENDPOINT}/${reviewId}`, 'DELETE');
    }
}

export default new ReviewsService();