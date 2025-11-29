// src/pages/ReviewsPage.js

import React, { useState, useEffect } from 'react';
// Rutas corregidas (solo un '../' porque 'components' y 'services' están al mismo nivel que 'pages')
import ReviewList from '../components/ReviewList'; 
import PInteresService from '../services/PInteresService'; 
import ReviewsService from '../services/ReviewsService'; 

function ReviewsPage() {
    const [pintereses, setPintereses] = useState([]);
    const [selectedPinteresId, setSelectedPinteresId] = useState('');
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Cargar la lista de Puntos de Interés
    useEffect(() => {
        const fetchPintereses = async () => {
            try {
                const data = await PInteresService.getAll();
                setPintereses(data);
                if (data.length > 0) {
                    setSelectedPinteresId(data[0]._id); 
                }
            } catch (error) {
                console.error("Error fetching PIntereses:", error);
            }
        };
        fetchPintereses();
    }, []);

    // 2. Cargar las reseñas para el Punto de Interés seleccionado
    const fetchReviews = async (id) => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await ReviewsService.getByPInteres(id); 
            setReviews(data);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchReviews(selectedPinteresId);
    }, [selectedPinteresId]); 

    return (
        <div className="reviews-page">
            <h2>⭐ Vista de Reseñas</h2>

            {/* Selector de Puntos de Interés */}
            <select 
                value={selectedPinteresId} 
                onChange={(e) => setSelectedPinteresId(e.target.value)}
                disabled={loading}
            >
                <option value="">-- Selecciona un Lugar --</option>
                {pintereses.map(pi => (
                    <option key={pi._id} value={pi._id}>{pi.nombre}</option>
                ))}
            </select>

            <hr/>

            {/* Componente para mostrar y gestionar las reseñas (debes crear e implementar ReviewList.js) */}
            {selectedPinteresId && (
                <>
                    <h3>Reseñas para: {pintereses.find(p => p._id === selectedPinteresId)?.nombre}</h3>
                    {loading ? (
                        <p>Cargando reseñas...</p>
                    ) : (
                        <ReviewList 
                            reviews={reviews} 
                            pinteresId={selectedPinteresId}
                            onReviewChange={() => fetchReviews(selectedPinteresId)} 
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default ReviewsPage;