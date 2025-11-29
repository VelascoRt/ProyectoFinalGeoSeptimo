const express = require('express');
const router = express.Router();

// 🛑 CORRECCIÓN DE RUTA:
// Usamos '../' para salir de la carpeta 'routes' y buscar en 'services'
const reviewsService = require('../services/reviewsService');

// 1. OBTENER todas las reseñas para un punto de interés
// GET /review/pinteres/:pinteresId
router.get('/pinteres/:pinteresId', async (req, res, next) => {
    try {
        // Asegúrate de que el método en el servicio se llame 'getReviewsByPInteresId'
        const reviews = await reviewsService.getReviewsByPInteresId(req.params.pinteresId);
        res.status(200).json(reviews);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 2. CREAR una nueva reseña
// POST /review/
router.post('/', async (req, res, next) => {
    try {
        const newReview = await reviewsService.create(req.body);
        res.status(201).json(newReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 3. ACTUALIZAR una reseña
// PUT /review/:reviewId
router.put('/:reviewId', async (req, res, next) => {
    try {
        const updatedReview = await reviewsService.update(req.params.reviewId, req.body);
        res.status(200).json(updatedReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 4. ELIMINAR una reseña
// DELETE /review/:reviewId
router.delete('/:reviewId', async (req, res, next) => {
    try {
        const result = await reviewsService.delete(req.params.reviewId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
