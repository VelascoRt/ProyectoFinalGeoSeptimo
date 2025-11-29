// src/components/LocationTable.js
import React from 'react';
import PInteresService from '../services/PInteresService'; 

// Estilos básicos para la tabla (puedes moverlos a tu CSS)
const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
};
const thTdStyle = {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
};
const headerStyle = {
    ...thTdStyle,
    backgroundColor: '#f2f2f2',
};

function LocationTable({ locations, onLocationDeleted }) {
    
    const handleDeleteFromTable = async (id) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar esta ubicación de la tabla?")) {
            try {
                await PInteresService.delete(id);
                alert("Ubicación eliminada exitosamente.");
                // Llama al callback para notificar a PrincipalPage que recargue la lista/mapa
                onLocationDeleted(); 
            } catch (error) {
                alert("Error al eliminar la ubicación: " + error.message);
            }
        }
    };

    if (locations.length === 0) {
        return <p>No hay ubicaciones registradas o no se encontraron resultados.</p>;
    }

    return (
        <div>
            <h3>Ubicaciones Registradas</h3>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={headerStyle}>Nombre</th>
                        <th style={headerStyle}>Descripción</th>
                        <th style={headerStyle}>Latitud</th>
                        <th style={headerStyle}>Longitud</th>
                        <th style={headerStyle}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {locations.map((loc) => (
                        <tr key={loc._id}>
                            <td style={thTdStyle}>{loc.nombre}</td>
                            <td style={thTdStyle}>{loc.descripcion}</td>
                            {/* GeoJSON stores coordinates as [lng, lat]. We display [lat, lng] */}
                            <td style={thTdStyle}>{loc.coordinates[1]?.toFixed(4)}</td>
                            <td style={thTdStyle}>{loc.coordinates[0]?.toFixed(4)}</td>
                            <td style={thTdStyle}>
                                <button 
                                    onClick={() => handleDeleteFromTable(loc._id)}
                                    style={{ background: 'red', color: 'white', border: 'none', padding: '5px' }}
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default LocationTable;