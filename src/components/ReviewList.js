// src/components/ReviewList.js
import React, { useState } from 'react';
import ReviewsService from '../services/ReviewsService'; 
// Importa tu servicio de usuario para saber quién está logueado
// import UserService from '../services/UserService'; 

// Componente auxiliar para el formulario de CREACIÓN de reseña
const ReviewForm = ({ pinteresId, onReviewChange }) => {
    const [calificacion, setCalificacion] = useState(5);
    const [opinion, setOpinion] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // **IMPORTANTE:** Necesitas obtener el ID del usuario logueado. 
        // Reemplaza esto con lógica de autenticación (ej: de un contexto de usuario)
        const userId = 'ID_DEL_USUARIO_LOGUEADO'; // <--- ¡CAMBIA ESTO!
        
        if (!userId || !pinteresId) {
            alert("Error: No se puede enviar la reseña. Usuario o Punto de Interés no identificados.");
            return;
        }

        const data = {
            user: userId,
            servicioTuristico: pinteresId,
            calificacion: parseInt(calificacion),
            opinion: opinion,
        };

        try {
            await ReviewsService.create(data);
            alert("Reseña creada exitosamente.");
            setCalificacion(5);
            setOpinion('');
            onReviewChange(); // Notifica a ReviewsPage para recargar la lista
        } catch (error) {
            alert("Error al crear la reseña: " + error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
            <h4>Añadir Nueva Reseña</h4>
            <div style={{ marginBottom: '10px' }}>
                <label>Calificación (1-5): </label>
                <input 
                    type="number" 
                    min="1" 
                    max="5" 
                    value={calificacion} 
                    onChange={(e) => setCalificacion(e.target.value)} 
                    required 
                />
            </div>
            <textarea 
                placeholder="Tu opinión..." 
                value={opinion} 
                onChange={(e) => setOpinion(e.target.value)} 
                rows="3" 
                maxLength="1000"
                required
                style={{ width: '100%', marginBottom: '10px' }}
            />
            <button type="submit">Enviar Reseña</button>
        </form>
    );
};

// Componente principal para listar las reseñas
function ReviewList({ reviews, pinteresId, onReviewChange }) {
    
    // Placeholder para el ID de usuario logueado para fines de prueba
    const currentUser = 'ID_DEL_USUARIO_LOGUEADO'; // <--- ¡CAMBIA ESTO!

    const handleDelete = async (reviewId) => {
        if (window.confirm("¿Eliminar esta reseña?")) {
            try {
                await ReviewsService.delete(reviewId);
                alert("Reseña eliminada.");
                onReviewChange();
            } catch (error) {
                alert("Error al eliminar: " + error.message);
            }
        }
    };

    return (
        <div>
            <ReviewForm pinteresId={pinteresId} onReviewChange={onReviewChange} />

            <h4>Reseñas Existentes ({reviews.length})</h4>
            {reviews.map(review => (
                <div key={review._id} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px' }}>
                    
                    {/* El backend trae el nombre/email del usuario gracias a populate() */}
                    <p><strong>Usuario:</strong> {review.user ? review.user.nombre : 'Anónimo'}</p>
                    <p><strong>Calificación:</strong> {review.calificacion} ⭐</p>
                    <p>{review.opinion}</p>
                    
                     {/* Nota: Aquí iría la lógica condicional para editar/eliminar */}
                     <button onClick={() => handleDelete(review._id)}>Eliminar Reseña</button>
                </div>
            ))}
        </div>
    );
}

export default ReviewList;