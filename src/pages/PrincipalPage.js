// src/pages/PrincipalPage.js

import React, { useState, useEffect } from 'react';
import MapComponent from '../components/MapComponent';
import LocationTable from '../components/LocationTable';
import PInteresService from '../services/PInteresService'; 


function PrincipalPage() {
    const [locations, setLocations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAllLocations = async () => {
        try {
            const data = await PInteresService.getAll(); 
            setLocations(data);
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const data = await PInteresService.search(searchTerm);
            setLocations(data); 
        } catch (error) {
            console.error("Error searching locations:", error);
            setLocations([]); 
        }
    };

    useEffect(() => {
        fetchAllLocations();
    }, []);

    return (
        <div className="principal-page">
            <h2>🌍 Vista Principal: Gestión Geoespacial</h2>
            
            {/* Componente de Búsqueda de Ubicaciones */}
            <form onSubmit={handleSearch} style={{marginBottom: '10px'}}>
                <input 
                    type="text" 
                    placeholder="Buscar ubicación por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit">Buscar</button>
                <button type="button" onClick={fetchAllLocations}>Mostrar Todos</button>
            </form>
            
            <div style={{ display: 'flex' }}>
                {/* Mapa (debes crear e implementar MapComponent.js) */}
                <div style={{ flex: 2, marginRight: '20px' }}>
                    <MapComponent 
                        locations={locations} 
                        onLocationChange={fetchAllLocations}
                    />
                </div>

                {/* Tabla (debes crear e implementar LocationTable.js) */}
                <div style={{ flex: 1 }}>
                    <LocationTable 
                        locations={locations} 
                        onLocationDeleted={fetchAllLocations}
                    />
                </div>
            </div>
        </div>
    );
}

export default PrincipalPage;