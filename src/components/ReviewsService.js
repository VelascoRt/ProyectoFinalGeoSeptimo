// src/services/ReviewsService.js

import APIService from './APIService'; // Importamos el servicio base 

const REVIEWS_ENDPOINT = '/review';

class ReviewsService {
    
    // OBTENER: Obtiene todas las reseñas para un Punto de Interés específico
    // Llama al endpoint GET /review/pinteres/:pinteresId
    async getByPInteres(pinteresId) {
        return APIService.request(`${REVIEWS_ENDPOINT}/pinteres/${pinteresId}`, 'GET');
    }

    // CREAR: Registra una nueva reseña
    // (Asegúrate de pasar el user ID y el pinteres ID en el objeto 'data')
    async create(data) {
        return APIService.request(REVIEWS_ENDPOINT, 'POST', data);
    }

    // ACTUALIZAR: Edita una reseña existente
    async update(reviewId, data) {
        return APIService.request(`${REVIEWS_ENDPOINT}/${reviewId}`, 'PUT', data);
    }

    // ELIMINAR: Elimina una reseña
    async delete(reviewId) {
        return APIService.request(`${REVIEWS_ENDPOINT}/${reviewId}`, 'DELETE');
    }
}

export default new ReviewsService();