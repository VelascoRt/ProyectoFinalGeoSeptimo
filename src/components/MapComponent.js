import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import PInteresService from '../services/PInteresService'; 

// Define el icono del marcador por defecto para evitar problemas de visualización
// Nota: Debes tener instalado 'leaflet' y 'react-leaflet'
delete L.Icon.Default.prototype._getIconUrl // Evitar error de webpack con iconos
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


// Componente auxiliar para forzar el redibujado del mapa (soluciona los mosaicos cortados)
function MapResetView() {
    const map = useMap(); 

    useEffect(() => {
        // Forzar el recálculo de las dimensiones después de un breve tiempo
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100); 

        return () => clearTimeout(timer); 
    }, [map]); 

    return null;
}

// Componente interno para manejar los eventos del mapa (clics)
function LocationMarker({ onLocationAdd }) {
    useMapEvents({
        click(e) {
            onLocationAdd(e.latlng); // Envía latlng a la función en MapComponent
        },
    });
    return null;
}

// Componente principal del Mapa
function MapComponent({ locations, onLocationChange }) {
    const [center, setCenter] = useState([21.1213, -101.6705]); // Coordenadas iniciales (León, GTO)
    const [newLocation, setNewLocation] = useState(null); 
    const [editMode, setEditMode] = useState(null); 

    const handleSaveNewLocation = async (name, description) => {
        if (!newLocation) return;
        
        const data = {
            nombre: name,
            descripcion: description,
            location: 'Point', 
            coordinates: [newLocation.lng, newLocation.lat], // GeoJSON es [lng, lat]
        };

        try {
            await PInteresService.create(data);
            window.alert("Ubicación registrada exitosamente.");
            setNewLocation(null); 
            onLocationChange(); 
        } catch (error) {
            window.alert("Error al registrar: " + error.message);
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm("¿Seguro que deseas eliminar esta ubicación?")) {
            try {
                await PInteresService.delete(id);
                window.alert("Ubicación eliminada.");
                onLocationChange(); 
            } catch (error) {
                window.alert("Error al eliminar: " + error.message);
            }
        }
    };

    const handleUpdate = async (id, changes) => {
        try {
            const updateData = {
                nombre: changes.name,
                descripcion: changes.description,
                // Si la ubicación geográfica se edita, se deben actualizar las coordenadas también
            };
            await PInteresService.update(id, updateData);
            window.alert("Ubicación actualizada.");
            setEditMode(null);
            onLocationChange(); 
        } catch (error) {
            window.alert("Error al actualizar: " + error.message);
        }
    };

    return (
        <MapContainer 
            center={center} 
            zoom={13} 
            // Altura y ancho fijos para inicialización correcta
            style={{ height: '600px', width: '100%', borderRadius: '8px' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Componente que fuerza el redibujado */}
            <MapResetView /> 
            
            {/* Componente para detectar clics y agregar nueva ubicación */}
            <LocationMarker onLocationAdd={(latlng) => setNewLocation(latlng)} />

            {/* Marcador TEMPORAL para la nueva ubicación (Registro) */}
            {newLocation && (
                <Marker position={newLocation} icon={defaultIcon}>
                    <Popup>
                        <RegistrationForm 
                            onSave={handleSaveNewLocation} 
                            onCancel={() => setNewLocation(null)}
                        />
                    </Popup>
                </Marker>
            )}

            {/* Marcadores de UBICACIONES REGISTRADAS (CRUD) */}
            {locations.map(loc => (
                <Marker 
                    key={loc._id} 
                    position={[loc.coordinates[1], loc.coordinates[0]]} // GeoJSON es [lng, lat]
                    icon={defaultIcon}
                >
                    <Popup>
                        {editMode === loc._id ? (
                            <EditForm 
                                location={loc}
                                onSave={(changes) => handleUpdate(loc._id, changes)}
                                onCancel={() => setEditMode(null)}
                            />
                        ) : (
                            <LocationDetails 
                                location={loc}
                                onEdit={() => setEditMode(loc._id)}
                                onDelete={() => handleDelete(loc._id)}
                            />
                        )}
                    </Popup>
                </Marker>
            ))}

            {/* Nota: Aquí iría la lógica de GeoJSON para dibujar ZONAS (polígonos/líneas) */}

        </MapContainer>
    );
}

export default MapComponent;


// Componente auxiliar para el formulario de REGISTRO
const RegistrationForm = ({ onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    
    return (
        <div style={{ padding: '5px', maxWidth: '200px' }}>
            <strong>Nueva Ubicación</strong>
            <input 
                type="text" 
                placeholder="Nombre" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', margin: '5px 0' }}
            />
            <textarea 
                placeholder="Descripción" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', margin: '5px 0', height: '60px' }}
            />
            <button onClick={() => onSave(name, description)} disabled={!name} style={{ marginRight: '5px', padding: '5px 10px' }}>Guardar</button>
            <button onClick={onCancel} style={{ padding: '5px 10px' }}>Cancelar</button>
        </div>
    );
};

// Componente auxiliar para DETALLES DE UBICACIÓN
const LocationDetails = ({ location, onEdit, onDelete }) => (
    <div style={{ maxWidth: '200px' }}>
        <strong>{location.nombre}</strong>
        <p>{location.descripcion}</p>
        <p style={{ fontSize: '10px' }}>Lat: {location.coordinates[1]?.toFixed(4)}, Lng: {location.coordinates[0]?.toFixed(4)}</p>
        <button onClick={onEdit} style={{ marginRight: '5px', padding: '5px 10px' }}>Editar</button>
        <button onClick={onDelete} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px' }}>Eliminar</button>
    </div>
);

// Componente auxiliar para el formulario de EDICIÓN
const EditForm = ({ location, onSave, onCancel }) => {
    const [name, setName] = useState(location.nombre);
    const [description, setDescription] = useState(location.descripcion);
    
    return (
        <div style={{ padding: '5px', maxWidth: '200px' }}>
            <strong>Editar Ubicación</strong>
            <input 
                type="text" 
                placeholder="Nombre" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', margin: '5px 0' }}
            />
            <textarea 
                placeholder="Descripción" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', margin: '5px 0', height: '60px' }}
            />
            <button onClick={() => onSave({ name, description })} disabled={!name} style={{ marginRight: '5px', padding: '5px 10px' }}>Guardar</button>
            <button onClick={onCancel} style={{ padding: '5px 10px' }}>Cancelar</button>
        </div>
    );
};