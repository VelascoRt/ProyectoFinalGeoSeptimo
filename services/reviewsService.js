// services/reviewsService.js

const Review = require('../models/Review');

class ReviewsService {

    // 1. Obtener todas las reseñas para un Punto de Interés 
    async getReviewsByPInteresId(pinteresId) {
        try {
            const data = await Review.find({ servicioTuristico: pinteresId })
                .populate('user', 'nombre email')
                .lean();
            return data;
        } catch (e) {
            throw new Error("Error fetching reviews: " + e.message);
        }
    }

    // 2. Crear una nueva reseña
    async create(data) {
        try {
            const newReview = new Review({ ...data });
            await newReview.save();
            return newReview;
        } catch (e) {
            throw new Error("Review creation failed: " + e.message);
        }
    }

    // 3. Actualizar una reseña
    async update(id, changes) {
        try {
            const review = await Review.findByIdAndUpdate(
                { _id: id },
                { $set: changes },
                { new: true, runValidators: true }
            );
            if (!review) {
                throw new Error("Review not found for update");
            }
            return review;
        } catch (e) {
            throw new Error("Review update failed: " + e.message);
        }
    }

    // 4. Eliminar una reseña
    async delete(id) {
        try {
            const result = await Review.deleteOne({ _id: id });
            if (result.deletedCount === 0) {
                throw new Error("Review not found for deletion");
            }
            return { message: 'Review deleted successfully' };
        } catch (e) {
            throw new Error("Review deletion failed: " + e.message);
        }
    }
}

module.exports = new ReviewsService();
