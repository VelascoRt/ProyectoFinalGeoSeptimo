const API_BASE = 'http://localhost:3001';

let map;
let currentUser;
let puntosInteres = [];
let servicios = [];
let zonas = [];
let drawingMode = false;
let currentLayer = null;
let drawControl = null;
let selectedTipo = 'punto';
let markersLayer = L.layerGroup();
let zonasLayer = L.layerGroup();

// Iconos personalizados
const createCustomIcon = (color, iconClass) => {
    return L.divIcon({
        html: `<i class="fas ${iconClass}" style="color: ${color}; font-size: 20px; background: white; padding: 8px; border-radius: 50%; border: 2px solid ${color};"></i>`,
        className: 'custom-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
    });
};

const iconPuntoInteres = createCustomIcon('#e74c3c', 'fa-landmark');
const iconReview = createCustomIcon('#f39c12', 'fa-star');
const iconServicio = createCustomIcon('#3498db', 'fa-concierge-bell');

document.addEventListener('DOMContentLoaded', function() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '/';
        return;
    }

    initializeMap();
    loadData();
    setupEventListeners();
    initializeDrawControl();
});

function initializeMap() {
    map = L.map('map').setView([19.4326, -99.1332], 13); // Ciudad de México

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    markersLayer.addTo(map);
    zonasLayer.addTo(map);
}

function initializeDrawControl() {
    const drawControl = new L.Control.Draw({
        draw: {
            polygon: {
                shapeOptions: {
                    color: '#3498db',
                    fillColor: '#3498db',
                    fillOpacity: 0.2
                }
            },
            polyline: false,
            circle: false,
            rectangle: {
                shapeOptions: {
                    color: '#e74c3c',
                    fillColor: '#e74c3c',
                    fillOpacity: 0.2
                }
            },
            circlemarker: false,
            marker: {
                icon: selectedTipo === 'punto' ? iconPuntoInteres : iconServicio
            }
        },
        edit: {
            featureGroup: markersLayer,
            remove: true
        }
    });
    
    map.addControl(drawControl);

    // Eventos para dibujar
    map.on(L.Draw.Event.CREATED, function (e) {
        const layer = e.layer;
        showCreationForm(layer);
    });

    map.on(L.Draw.Event.EDITED, function (e) {
        const layers = e.layers;
        layers.eachLayer(function (layer) {
            updateLayerInDatabase(layer);
        });
    });

    map.on(L.Draw.Event.DELETED, function (e) {
        const layers = e.layers;
        layers.eachLayer(function (layer) {
            deleteLayerFromDatabase(layer);
        });
    });
}

function showCreationForm(layer) {
    const form = `
        <div class="creation-form">
            <h3>Crear ${selectedTipo === 'punto' ? 'Punto de Interés' : 'Servicio'}</h3>
            <form id="creationForm">
                <div class="form-group">
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" required>
                </div>
                <div class="form-group">
                    <label for="descripcion">Descripción:</label>
                    <textarea id="descripcion" required></textarea>
                </div>
                <div class="button-group">
                    <button type="submit" class="btn btn-success">Guardar</button>
                    <button type="button" class="btn btn-secondary" onclick="cancelCreation()">Cancelar</button>
                </div>
            </form>
        </div>
    `;

    const popup = L.popup()
        .setLatLng(layer.getLatLng ? layer.getLatLng() : layer.getBounds().getCenter())
        .setContent(form)
        .openOn(map);

    document.getElementById('creationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveNewLocation(layer, popup);
    });
}

async function saveNewLocation(layer, popup) {
    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    
    let locationData = {
        nombre,
        descripcion
    };

    if (layer instanceof L.Marker) {
        const latlng = layer.getLatLng();
        locationData.location = {
            type: 'Point',
            coordinates: [latlng.lng, latlng.lat]
        };

        try {
            const endpoint = selectedTipo === 'punto' ? '/pinteres' : '/servicio';
            const response = await fetch(API_BASE + endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(locationData)
            });

            if (response.ok) {
                const newItem = await response.json();
                layer._id = newItem._id;
                layer.bindPopup(createPopupContent(newItem, selectedTipo));
                markersLayer.addLayer(layer);
                map.closePopup(popup);
                updateTable();
                showMessage('Ubicación creada exitosamente', 'success');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error al crear la ubicación', 'error');
        }
    } else if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
        // Guardar zona
        const bounds = layer.getBounds();
        const centro = bounds.getCenter();
        
        const zonaData = {
            nombre,
            descripcion,
            tipo: layer instanceof L.Polygon ? 'polygon' : 'rectangle',
            centro: {
                lat: centro.lat,
                lng: centro.lng
            },
            bounds: {
                norte: bounds.getNorth(),
                sur: bounds.getSouth(),
                este: bounds.getEast(),
                oeste: bounds.getWest()
            }
        };

        try {
            const response = await fetch(API_BASE + '/zona', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(zonaData)
            });

            if (response.ok) {
                const newZona = await response.json();
                layer._id = newZona._id;
                layer.bindPopup(createZonaPopupContent(newZona));
                zonasLayer.addLayer(layer);
                map.closePopup(popup);
                updateTable();
                showMessage('Zona creada exitosamente', 'success');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error al crear la zona', 'error');
        }
    }
}

function createPopupContent(item, tipo) {
    return `
        <div class="popup-content">
            <h4>${item.nombre}</h4>
            <p>${item.descripcion}</p>
            <div class="popup-actions">
                <button onclick="editLocation('${item._id}', '${tipo}')" class="btn btn-warning btn-sm">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button onclick="deleteLocation('${item._id}', '${tipo}')" class="btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
                <button onclick="verreviews('${item._id}', '${tipo}')" class="btn btn-primary btn-sm">
                    <i class="fas fa-star"></i> Reseñas
                </button>
            </div>
        </div>
    `;
}

function createZonaPopupContent(zona) {
    return `
        <div class="popup-content">
            <h4>${zona.nombre}</h4>
            <p>${zona.descripcion}</p>
            <p><strong>Tipo:</strong> ${zona.tipo}</p>
            <div class="popup-actions">
                <button onclick="deleteZona('${zona._id}')" class="btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `;
}

async function loadData() {
    try {
        // Cargar puntos de interés
        const [pinteresResponse, serviciosResponse, zonasResponse] = await Promise.all([
            fetch(API_BASE + '/pinteres'),
            fetch(API_BASE + '/servicio'),
            fetch(API_BASE + '/zona')
        ]);

        puntosInteres = await pinteresResponse.json();
        servicios = await serviciosResponse.json();
        zonas = await zonasResponse.json();

        addMarkersToMap();
        addZonasToMap();
        updateTable();
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

function addMarkersToMap() {
    markersLayer.clearLayers();

    // Puntos de interés
    puntosInteres.forEach(punto => {
        if (punto.location && punto.location.coordinates) {
            const marker = L.marker([
                punto.location.coordinates[1], 
                punto.location.coordinates[0]
            ], { icon: iconPuntoInteres }).addTo(markersLayer);
            
            marker._id = punto._id;
            marker.bindPopup(createPopupContent(punto, 'punto'));
        }
    });

    // Servicios
    servicios.forEach(servicio => {
        if (servicio.location && servicio.location.coordinates) {
            const marker = L.marker([
                servicio.location.coordinates[1], 
                servicio.location.coordinates[0]
            ], { icon: iconServicio }).addTo(markersLayer);
            
            marker._id = servicio._id;
            marker.bindPopup(createPopupContent(servicio, 'servicio'));
        }
    });
}

function addZonasToMap() {
    zonasLayer.clearLayers();

    zonas.forEach(zona => {
        let layer;
        
        switch(zona.tipo) {
            case 'polygon':
                if (zona.coordenadas && zona.coordenadas[0]) {
                    const coordinates = zona.coordenadas[0].map(coord => [coord.lat, coord.lng]);
                    layer = L.polygon(coordinates, { 
                        color: '#3498db', 
                        fillOpacity: 0.2,
                        weight: 2
                    });
                }
                break;
            case 'rectangle':
                if (zona.bounds) {
                    layer = L.rectangle([
                        [zona.bounds.norte, zona.bounds.oeste],
                        [zona.bounds.sur, zona.bounds.este]
                    ], { 
                        color: '#e74c3c', 
                        fillOpacity: 0.2,
                        weight: 2
                    });
                }
                break;
        }
        
        if (layer) {
            layer._id = zona._id;
            layer.bindPopup(createZonaPopupContent(zona));
            zonasLayer.addLayer(layer);
        }
    });
}

function setupEventListeners() {
    // Selector de tipo
    document.getElementById('tipoSelector').addEventListener('change', function(e) {
        selectedTipo = e.target.value;
    });

    // Búsqueda
    document.getElementById('searchInput').addEventListener('input', function(e) {
        filterTable(e.target.value);
    });

    // Logout
    document.getElementById('btnLogout').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = '/';
    });

    // Botones de filtro
    document.getElementById('btnMostrarTodo').addEventListener('click', function() {
        markersLayer.addTo(map);
        zonasLayer.addTo(map);
    });

    document.getElementById('btnOcultarTodo').addEventListener('click', function() {
        map.removeLayer(markersLayer);
        map.removeLayer(zonasLayer);
    });
}

function updateTable() {
    const tableBody = document.getElementById('locationsTable');
    tableBody.innerHTML = '';

    const allItems = [
        ...puntosInteres.map(p => ({...p, tipo: 'Punto de Interés'})),
        ...servicios.map(s => ({...s, tipo: 'Servicio'})),
        ...zonas.map(z => ({...z, tipo: 'Zona'}))
    ];

    allItems.forEach(item => {
        const row = document.createElement('tr');
        
        let locationInfo = '';
        if (item.location) {
            const coords = item.location.coordinates;
            locationInfo = `Lat: ${coords[1].toFixed(4)}, Lng: ${coords[0].toFixed(4)}`;
        } else if (item.centro) {
            locationInfo = `Lat: ${item.centro.lat.toFixed(4)}, Lng: ${item.centro.lng.toFixed(4)}`;
        }

        row.innerHTML = `
            <td>${item.nombre}</td>
            <td>${item.descripcion}</td>
            <td>${item.tipo}</td>
            <td>${locationInfo}</td>
        `;
        tableBody.appendChild(row);
    });
}

function filterTable(searchTerm) {
    const rows = document.querySelectorAll('#locationsTable tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
    });
}

// Funciones globales para los popups
window.editLocation = async function(id, tipo) {
    const nombre = prompt('Nuevo nombre:');
    const descripcion = prompt('Nueva descripción:');
    
    if (nombre && descripcion) {
        try {
            const endpoint = tipo === 'punto' ? '/pinteres' : '/servicio';
            const response = await fetch(API_BASE + endpoint + '/' + id, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre, descripcion })
            });

            if (response.ok) {
                loadData();
                showMessage('Ubicación actualizada', 'success');
            }
        } catch (error) {
            showMessage('Error al actualizar', 'error');
        }
    }
};

window.deleteLocation = async function(id, tipo) {
    if (confirm('¿Estás seguro de eliminar esta ubicación?')) {
        try {
            const endpoint = tipo === 'punto' ? '/pinteres' : '/servicio';
            const response = await fetch(API_BASE + endpoint + '/' + id, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadData();
                showMessage('Ubicación eliminada', 'success');
            }
        } catch (error) {
            showMessage('Error al eliminar', 'error');
        }
    }
};

window.deleteZona = async function(id) {
    if (confirm('¿Estás seguro de eliminar esta zona?')) {
        try {
            const response = await fetch(API_BASE + '/zona/' + id, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadData();
                showMessage('Zona eliminada', 'success');
            }
        } catch (error) {
            showMessage('Error al eliminar', 'error');
        }
    }
};

window.verreviews = function(id, tipo) {
    localStorage.setItem('currentPlaceId', id);
    localStorage.setItem('currentPlaceType', tipo);
    window.location.href = '/reviews';
};

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

window.cancelCreation = function() {
    map.closePopup();
};





document.addEventListener('DOMContentLoaded', function() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '/';
        return;
    }

    initializeMap();
    loadData();
    setupEventListeners();
});

function initializeMap() {
    map = L.map('map').setView([19.4326, -99.1332], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    markersLayer.addTo(map);
    zonasLayer.addTo(map);

    // Agregar controles de dibujo manualmente
    addDrawingTools();
}

function addDrawingTools() {
    // Crear un control personalizado para las herramientas de dibujo
    const drawControl = L.control({ position: 'topright' });

    drawControl.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'draw-control');
        div.innerHTML = `
            <div class="draw-tools">
                <h4>Herramientas de Creación</h4>
                <div class="tool-buttons">
                    <button class="btn btn-danger tool-btn" data-action="punto-interes">
                        <i class="fas fa-landmark"></i> Punto Interés
                    </button>
                    <button class="btn btn-primary tool-btn" data-action="servicio">
                        <i class="fas fa-concierge-bell"></i> Servicio
                    </button>
                    <button class="btn btn-success tool-btn" data-action="zona-polygon">
                        <i class="fas fa-draw-polygon"></i> Zona Polígono
                    </button>
                    <button class="btn btn-warning tool-btn" data-action="zona-rectangle">
                        <i class="fas fa-vector-square"></i> Zona Rectángulo
                    </button>
                    <button class="btn btn-info tool-btn" data-action="review">
                        <i class="fas fa-star"></i> Agregar Reseña
                    </button>
                    <button class="btn btn-secondary tool-btn" data-action="cancel">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </div>
        `;
        return div;
    };

    drawControl.addTo(map);
}

function setupEventListeners() {
    // Eventos para los botones de herramientas
    document.addEventListener('click', function(e) {
        if (e.target.closest('.tool-btn')) {
            const button = e.target.closest('.tool-btn');
            const action = button.getAttribute('data-action');
            handleToolAction(action);
        }
    });

    // Búsqueda
    document.getElementById('searchInput').addEventListener('input', function(e) {
        filterTable(e.target.value);
    });

    // Logout
    document.getElementById('btnLogout').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = '/';
    });

    // Botones de filtro
    document.getElementById('btnMostrarTodo').addEventListener('click', function() {
        markersLayer.addTo(map);
        zonasLayer.addTo(map);
    });

    document.getElementById('btnOcultarTodo').addEventListener('click', function() {
        map.removeLayer(markersLayer);
        map.removeLayer(zonasLayer);
    });

    // Evento de clic en el mapa para creación
    map.on('click', function(e) {
        if (currentAction) {
            handleMapClick(e);
        }
    });
}

function handleToolAction(action) {
    currentAction = action;
    drawingMode = true;
    
    // Remover clases activas de todos los botones
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Agregar clase activa al botón clickeado
    event.target.closest('.tool-btn').classList.add('active');
    
    switch(action) {
        case 'punto-interes':
            showMessage('Haz clic en el mapa para colocar un Punto de Interés', 'info');
            break;
        case 'servicio':
            showMessage('Haz clic en el mapa para colocar un Servicio', 'info');
            break;
        case 'review':
            showMessage('Haz clic en un lugar existente para agregar una reseña', 'info');
            break;
        case 'zona-polygon':
            startPolygonDrawing();
            break;
        case 'zona-rectangle':
            startRectangleDrawing();
            break;
        case 'cancel':
            cancelDrawing();
            break;
    }
}

function handleMapClick(e) {
    switch(currentAction) {
        case 'punto-interes':
            createPuntoInteres(e.latlng);
            break;
        case 'servicio':
            createServicio(e.latlng);
            break;
        case 'review':
            // Para reseñas, necesitamos verificar si hay un lugar en esa ubicación
            checkForExistingLocation(e.latlng);
            break;
    }
}

function startPolygonDrawing() {
    showMessage('Haz clic en el mapa para comenzar a dibujar el polígono. Doble clic para terminar.', 'info');
    
    const polygon = L.polygon([], {
        color: '#3498db',
        fillColor: '#3498db',
        fillOpacity: 0.2,
        weight: 2
    }).addTo(map);

    let points = [];

    function onMapClick(e) {
        points.push(e.latlng);
        polygon.setLatLngs(points);
        
        if (points.length >= 3) {
            showPolygonCreationForm(polygon, points);
            map.off('click', onMapClick);
        }
    }

    map.on('click', onMapClick);
}

function startRectangleDrawing() {
    showMessage('Haz clic y arrastra para dibujar un rectángulo', 'info');
    
    let startLatLng;
    let rectangle;

    function onMouseDown(e) {
        startLatLng = e.latlng;
        rectangle = L.rectangle([startLatLng, startLatLng], {
            color: '#e74c3c',
            fillColor: '#e74c3c',
            fillOpacity: 0.2,
            weight: 2
        }).addTo(map);
    }

    function onMouseMove(e) {
        if (rectangle && startLatLng) {
            const bounds = L.latLngBounds(startLatLng, e.latlng);
            rectangle.setBounds(bounds);
        }
    }

    function onMouseUp(e) {
        if (rectangle && startLatLng) {
            showRectangleCreationForm(rectangle);
            map.off('mousedown', onMouseDown);
            map.off('mousemove', onMouseMove);
            map.off('mouseup', onMouseUp);
        }
    }

    map.on('mousedown', onMouseDown);
    map.on('mousemove', onMouseMove);
    map.on('mouseup', onMouseUp);
}

async function createPuntoInteres(latlng) {
    const nombre = prompt('Nombre del Punto de Interés:');
    if (!nombre) {
        cancelDrawing();
        return;
    }
    
    const descripcion = prompt('Descripción del Punto de Interés:');
    if (!descripcion) {
        cancelDrawing();
        return;
    }

    const puntoData = {
        nombre,
        descripcion,
        location: {
            type: 'Point',
            coordinates: [latlng.lng, latlng.lat]
        }
    };

    try {
        const response = await fetch(API_BASE + '/pinteres', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(puntoData)
        });

        if (response.ok) {
            const newPunto = await response.json();
            addMarkerToMap(newPunto, 'punto');
            updateTable();
            showMessage('Punto de Interés creado exitosamente', 'success');
            cancelDrawing();
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al crear el Punto de Interés', 'error');
    }
}

async function createServicio(latlng) {
    const nombre = prompt('Nombre del Servicio:');
    if (!nombre) {
        cancelDrawing();
        return;
    }
    
    const descripcion = prompt('Descripción del Servicio:');
    if (!descripcion) {
        cancelDrawing();
        return;
    }

    const servicioData = {
        nombre,
        descripcion,
        location: {
            type: 'Point',
            coordinates: [latlng.lng, latlng.lat]
        }
    };

    try {
        const response = await fetch(API_BASE + '/servicio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(servicioData)
        });

        if (response.ok) {
            const newServicio = await response.json();
            addMarkerToMap(newServicio, 'servicio');
            updateTable();
            showMessage('Servicio creado exitosamente', 'success');
            cancelDrawing();
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al crear el Servicio', 'error');
    }
}

function showPolygonCreationForm(polygon, points) {
    const form = `
        <div class="creation-form">
            <h3>Crear Zona (Polígono)</h3>
            <form id="polygonForm">
                <div class="form-group">
                    <label for="zonaNombre">Nombre:</label>
                    <input type="text" id="zonaNombre" required>
                </div>
                <div class="form-group">
                    <label for="zonaDescripcion">Descripción:</label>
                    <textarea id="zonaDescripcion" required></textarea>
                </div>
                <div class="button-group">
                    <button type="submit" class="btn btn-success">Guardar Zona</button>
                    <button type="button" class="btn btn-secondary" onclick="cancelZonaCreation()">Cancelar</button>
                </div>
            </form>
        </div>
    `;

    const popup = L.popup()
        .setLatLng(polygon.getBounds().getCenter())
        .setContent(form)
        .openOn(map);

    document.getElementById('polygonForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const nombre = document.getElementById('zonaNombre').value;
        const descripcion = document.getElementById('zonaDescripcion').value;

        const zonaData = {
            nombre,
            descripcion,
            tipo: 'polygon',
            coordenadas: [points.map(point => ({ lat: point.lat, lng: point.lng }))],
            centro: {
                lat: polygon.getBounds().getCenter().lat,
                lng: polygon.getBounds().getCenter().lng
            }
        };

        await saveZona(zonaData, polygon);
        map.closePopup(popup);
    });
}

function showRectangleCreationForm(rectangle) {
    const form = `
        <div class="creation-form">
            <h3>Crear Zona (Rectángulo)</h3>
            <form id="rectangleForm">
                <div class="form-group">
                    <label for="zonaNombre">Nombre:</label>
                    <input type="text" id="zonaNombre" required>
                </div>
                <div class="form-group">
                    <label for="zonaDescripcion">Descripción:</label>
                    <textarea id="zonaDescripcion" required></textarea>
                </div>
                <div class="button-group">
                    <button type="submit" class="btn btn-success">Guardar Zona</button>
                    <button type="button" class="btn btn-secondary" onclick="cancelZonaCreation()">Cancelar</button>
                </div>
            </form>
        </div>
    `;

    const popup = L.popup()
        .setLatLng(rectangle.getBounds().getCenter())
        .setContent(form)
        .openOn(map);

    document.getElementById('rectangleForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const nombre = document.getElementById('zonaNombre').value;
        const descripcion = document.getElementById('zonaDescripcion').value;

        const bounds = rectangle.getBounds();
        const zonaData = {
            nombre,
            descripcion,
            tipo: 'rectangle',
            bounds: {
                norte: bounds.getNorth(),
                sur: bounds.getSouth(),
                este: bounds.getEast(),
                oeste: bounds.getWest()
            },
            centro: {
                lat: bounds.getCenter().lat,
                lng: bounds.getCenter().lng
            }
        };

        await saveZona(zonaData, rectangle);
        map.closePopup(popup);
    });
}

async function saveZona(zonaData, layer) {
    try {
        const response = await fetch(API_BASE + '/zona', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(zonaData)
        });

        if (response.ok) {
            const newZona = await response.json();
            layer._id = newZona._id;
            layer.bindPopup(createZonaPopupContent(newZona));
            zonasLayer.addLayer(layer);
            updateTable();
            showMessage('Zona creada exitosamente', 'success');
            cancelDrawing();
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al crear la zona', 'error');
    }
}

function checkForExistingLocation(latlng) {
    // Buscar si hay algún marcador en esa ubicación
    let foundLocation = null;
    let foundType = null;

    markersLayer.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
            const distance = layer.getLatLng().distanceTo(latlng);
            if (distance < 50) { // 50 metros de tolerancia
                foundLocation = layer;
                foundType = layer._icon.innerHTML.includes('landmark') ? 'punto' : 'servicio';
            }
        }
    });

    if (foundLocation) {
        createReview(foundLocation._id, foundType);
    } else {
        showMessage('No se encontró un lugar en esta ubicación. Primero crea un Punto de Interés o Servicio.', 'warning');
    }
}

async function createReview(locationId, locationType) {
    const calificacion = prompt('Calificación (1-5):');
    if (!calificacion || calificacion < 1 || calificacion > 5) {
        showMessage('La calificación debe ser entre 1 y 5', 'error');
        return;
    }

    const opinion = prompt('Tu opinión:');
    if (!opinion) {
        showMessage('La opinión es requerida', 'error');
        return;
    }

    const reviewData = {
        user: currentUser._id,
        calificacion: parseInt(calificacion),
        opinion: opinion,
        servicioTuristico: locationId
    };

    try {
        const response = await fetch(API_BASE + '/review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reviewData)
        });

        if (response.ok) {
            showMessage('Reseña agregada exitosamente', 'success');
            cancelDrawing();
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al crear la reseña', 'error');
    }
}

function cancelDrawing() {
    currentAction = null;
    drawingMode = false;
    
    // Remover clases activas de todos los botones
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    showMessage('Modo de creación cancelado', 'info');
}



window.cancelZonaCreation = function() {
    map.closePopup();
    cancelDrawing();
};
