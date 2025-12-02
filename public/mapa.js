const API_BASE = 'http://localhost:3001';

let map;
let currentUser;
let puntosInteres = [];
let servicios = [];
let zonas = [];
let drawingMode = false;
let currentAction = null;
let markersLayer = L.layerGroup();
let zonasLayer = L.layerGroup();

// Variables para búsqueda
let currentHighlight = null;
let currentHighlightLayer = null;

// Variables para el dibujo de polígonos
let polygonPoints = [];
let currentPolygon = null;

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
});

function initializeMap() {
    map = L.map('map').setView([19.4326, -99.1332], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    markersLayer.addTo(map);
    zonasLayer.addTo(map);

    addDrawingTools();
}

function addDrawingTools() {
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
                    <button class="btn btn-secondary tool-btn" data-action="cancel">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
                <div id="drawing-instructions" class="drawing-instructions"></div>
            </div>
        `;
        return div;
    };

    drawControl.addTo(map);
}

function setupEventListeners() {
    map.getContainer().addEventListener('click', function(e) {
        if (e.target.closest('.tool-btn')) {
            const button = e.target.closest('.tool-btn');
            const action = button.getAttribute('data-action');
            handleToolAction(action, button);
        }
    });

    // Evento para búsqueda por botón
    document.getElementById('btnBuscar').addEventListener('click', function() {
        performSearch();
    });

    // Evento para búsqueda por Enter
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Evento para búsqueda en tiempo real en tabla
    document.getElementById('searchInput').addEventListener('input', function(e) {
        filterTable(e.target.value);
    });

    document.getElementById('btnLogout').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    document.getElementById('btnMostrarTodo').addEventListener('click', function() {
        markersLayer.addTo(map);
        zonasLayer.addTo(map);
        showMessage('Mostrando todos los elementos', 'info');
    });

    document.getElementById('btnOcultarTodo').addEventListener('click', function() {
        map.removeLayer(markersLayer);
        map.removeLayer(zonasLayer);
        showMessage('Ocultando todos los elementos', 'info');
    });
}

function handleToolAction(action, button) {
    cleanupDrawing();
    
    currentAction = action;
    drawingMode = true;
    
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    button.classList.add('active');
    
    const instructions = document.getElementById('drawing-instructions');
    
    switch(action) {
        case 'punto-interes':
            instructions.innerHTML = '<p>Haz clic en el mapa para colocar un Punto de Interés</p>';
            setupMapClickForMarker('punto');
            break;
        case 'servicio':
            instructions.innerHTML = '<p>Haz clic en el mapa para colocar un Servicio</p>';
            setupMapClickForMarker('servicio');
            break;
        case 'zona-polygon':
            instructions.innerHTML = '<p>Haz clic en el mapa para agregar puntos al polígono. Doble clic para terminar.</p>';
            startPolygonDrawing();
            break;
        case 'zona-rectangle':
            instructions.innerHTML = '<p>Haz clic y arrastra para dibujar un rectángulo</p>';
            startRectangleDrawing();
            break;
        case 'cancel':
            cancelDrawing();
            break;
    }
}

function setupMapClickForMarker(tipo) {
    const clickHandler = function(e) {
        if (currentAction && (currentAction === 'punto-interes' || currentAction === 'servicio')) {
            if (tipo === 'punto') {
                createPuntoInteres(e.latlng);
            } else {
                createServicio(e.latlng);
            }
        }
    };
    
    map.on('click', clickHandler);
    map._currentClickHandler = clickHandler;
}

// El anterior doble click no funcionaba casi nunca.
function startPolygonDrawing() {
    polygonPoints = [];
    currentPolygon = null;
    
    // Mostrar el botón
    document.getElementById("finishPolygonBtn").style.display = "block";
    
    // Limpiar cualquier handler anterior
    if (map._polygonClickHandler) {
        map.off("click", map._polygonClickHandler);
    }
    
    // Handler para agregar puntos
    map._polygonClickHandler = e => {
        polygonPoints.push(e.latlng);
        
        // Actualizar o crear el polígono visual
        if (currentPolygon) {
            map.removeLayer(currentPolygon);
        }
        
        // Solo dibujar si hay al menos 2 puntos
        if (polygonPoints.length >= 2) {
            currentPolygon = L.polygon(polygonPoints, {
                color: "#27ae60",
                fillColor: "#27ae60",
                fillOpacity: 0.3,
                weight: 2
            }).addTo(map);
        }
    };
    
    map.on("click", map._polygonClickHandler);
    
    // Configurar el botón para finalizar
    document.getElementById("finishPolygonBtn").onclick = finishPolygonDrawing;
    
    // Instrucciones
    showMessage('Haz clic en el mapa para agregar puntos al polígono. Luego presiona "Finalizar Polígono"', 'info');
}

function finishPolygonDrawing() {
    if (polygonPoints.length < 3) {
        showMessage("Necesitas al menos 3 puntos para crear un polígono", "warning");
        return;
    }
    
    // Remover el handler de clics
    map.off("click", map._polygonClickHandler);
    map._polygonClickHandler = null;
    
    // Ocultar el botón
    document.getElementById("finishPolygonBtn").style.display = "none";
    
    // Mostrar el formulario para crear la zona
    if (currentPolygon) {
        showPolygonCreationForm(currentPolygon, polygonPoints);
    }
}

function startRectangleDrawing() {
    let startPoint = null;
    let rectangle = null;
    map.dragging.disable();

    const mouseDownHandler = function(e) {
        startPoint = e.latlng;
        rectangle = L.rectangle([startPoint, startPoint], {
            color: '#e67e22',
            fillColor: '#e67e22',
            fillOpacity: 0.3,
            weight: 2
        }).addTo(map);
        
    };

    const mouseMoveHandler = function(e) {
        
        if (rectangle && startPoint) {
            const bounds = L.latLngBounds([startPoint, e.latlng]);
            rectangle.setBounds(bounds);
            
        }
    };

    const mouseUpHandler = function(e) {
        if (rectangle && startPoint) {
            const bounds = rectangle.getBounds();
            const area = (bounds.getNorth() - bounds.getSouth()) * (bounds.getEast() - bounds.getWest());
            
            if (Math.abs(area) < 0.000001) {
                showMessage('El rectángulo es muy pequeño. Intenta con un área más grande.', 'warning');
                map.removeLayer(rectangle);
            } else {
                showRectangleCreationForm(rectangle);
            }
            map.dragging.enable();
            cleanupRectangleDrawing();
            map.removeLayer(rectangle);
        }
    };

    map.on('mousedown', mouseDownHandler);
    map.on('mousemove', mouseMoveHandler);
    map.on('mouseup', mouseUpHandler);

    map._rectangleMouseDown = mouseDownHandler;
    map._rectangleMouseMove = mouseMoveHandler;
    map._rectangleMouseUp = mouseUpHandler;
}

function cleanupDrawing() {
    if (map._currentClickHandler) {
        map.off('click', map._currentClickHandler);
        map._currentClickHandler = null;
    }
    
    if (map._polygonClickHandler) {
        map.off('click', map._polygonClickHandler);
        map.off('dblclick', map._polygonDoubleClickHandler);
        map._polygonClickHandler = null;
        map._polygonDoubleClickHandler = null;
    }
    
    cleanupRectangleDrawing();
    
    if (currentPolygon) {
        map.removeLayer(currentPolygon);
        currentPolygon = null;
    }
    
    polygonPoints = [];
    
    document.getElementById('drawing-instructions').innerHTML = '';
}

function cleanupRectangleDrawing() {
    if (map._rectangleMouseDown) {
        map.off('mousedown', map._rectangleMouseDown);
        map.off('mousemove', map._rectangleMouseMove);
        map.off('mouseup', map._rectangleMouseUp);
        map._rectangleMouseDown = null;
        map._rectangleMouseMove = null;
        map._rectangleMouseUp = null;
    }
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
            addMarkersToMap();
            loadData();
            showMessage('Punto de Interés creado exitosamente', 'success');
            cancelDrawing();
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al crear el Punto de Interés: ' + error.message, 'error');
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
            showMessage('Servicio creado exitosamente', 'success');
            addMarkersToMap();
            loadData();
            cancelDrawing();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error en la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al crear el Servicio: ' + error.message, 'error');
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
            layer.bindPopup(createZonaPopupContent(newZona,));
            zonasLayer.addLayer(layer);
            loadData();
            showMessage('Zona creada exitosamente', 'success');
            cancelDrawing();
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al crear la zona: ' + error.message, 'error');
    }
}

function cancelDrawing() {
    cleanupDrawing();
    document.getElementById("finishPolygonBtn").style.display = "none";
    currentAction = null;
    drawingMode = false;
    map.dragging.enable();
    
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
}

async function loadData() {
    try {
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
                <button onclick="moveLocation('${item._id}', '${tipo}')" class="btn btn-success btn-sm">
                    <i class="fas fa-arrows"></i> Mover
                </button>
                <button onclick="verResenas('${item._id}', '${tipo}')" class="btn btn-primary btn-sm">
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
                <button onclick="editZona('${zona._id}')" class="btn btn-warning btn-sm">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button onclick="deleteZona('${zona._id}')" class="btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `;
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

// ===== FUNCIONALIDAD DE BÚSQUEDA =====

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    if (!searchTerm) {
        showMessage('Ingresa un término de búsqueda', 'warning');
        return;
    }

    // Limpiar highlight anterior
    clearHighlight();

    // Buscar en puntos de interés
    let foundItem = null;
    let foundType = null;
    
    // Buscar en puntos de interés
    puntosInteres.forEach(punto => {
        if (punto.nombre.toLowerCase().includes(searchTerm) || 
            punto.descripcion.toLowerCase().includes(searchTerm)) {
            foundItem = punto;
            foundType = 'punto';
        }
    });

    // Si no se encontró en puntos, buscar en servicios
    if (!foundItem) {
        servicios.forEach(servicio => {
            if (servicio.nombre.toLowerCase().includes(searchTerm) || 
                servicio.descripcion.toLowerCase().includes(searchTerm)) {
                foundItem = servicio;
                foundType = 'servicio';
            }
        });
    }

    // Si no se encontró en servicios, buscar en zonas
    if (!foundItem) {
        zonas.forEach(zona => {
            if (zona.nombre.toLowerCase().includes(searchTerm) || 
                zona.descripcion.toLowerCase().includes(searchTerm)) {
                foundItem = zona;
                foundType = 'zona';
            }
        });
    }

    if (foundItem) {
        highlightAndCenter(foundItem, foundType);
        showMessage(`Encontrado: ${foundItem.nombre}`, 'success');
    } else {
        showMessage('No se encontraron resultados para: ' + searchTerm, 'error');
    }
}

function highlightAndCenter(item, type) {
    // Limpiar highlight anterior
    clearHighlight();

    let latLng;
    let layer;

    if (type === 'punto' || type === 'servicio') {
        // Buscar el marcador correspondiente
        markersLayer.getLayers().forEach(markerLayer => {
            if (markerLayer._id === item._id) {
                layer = markerLayer;
                
                // Crear un icono destacado
                const highlightIcon = createHighlightIcon(
                    type === 'punto' ? '#e74c3c' : '#3498db',
                    type === 'punto' ? 'fa-landmark' : 'fa-concierge-bell'
                );
                
                markerLayer.setIcon(highlightIcon);
                markerLayer.addTo(map);
                latLng = markerLayer.getLatLng();
                
                currentHighlight = markerLayer;
                currentHighlightLayer = markersLayer;
            }
        });
    } else if (type === 'zona') {
        // Buscar la zona correspondiente
        zonasLayer.getLayers().forEach(zoneLayer => {
            if (zoneLayer._id === item._id) {
                layer = zoneLayer;
                
                // Aplicar estilo destacado
                zoneLayer.setStyle({
                    color: '#FFC107',
                    fillColor: '#FFC107',
                    fillOpacity: 0.4,
                    weight: 4,
                    className: 'highlighted-polygon'
                });
                
                latLng = zoneLayer.getBounds().getCenter();
                currentHighlight = zoneLayer;
                currentHighlightLayer = zonasLayer;
            }
        });
    }

    if (latLng) {
        // Centrar el mapa en la ubicación con zoom más cercano
        map.setView(latLng, 16);
        
        // Abrir el popup si es un marcador
        if (layer && layer.openPopup) {
            setTimeout(() => {
                layer.openPopup();
            }, 500);
        }
    }
}

function createHighlightIcon(color, iconClass) {
    return L.divIcon({
        html: `
            <div class="highlighted-marker">
                <i class="fas ${iconClass}" style="
                    color: ${color}; 
                    font-size: 24px; 
                    background: white; 
                    padding: 12px; 
                    border-radius: 50%; 
                    border: 3px solid ${color};
                    box-shadow: 0 0 20px rgba(255, 193, 7, 0.8);
                "></i>
            </div>`,
        className: 'custom-icon',
        iconSize: [48, 48],
        iconAnchor: [24, 24]
    });
}

function clearHighlight() {
    if (currentHighlight && currentHighlightLayer) {
        // Restaurar estilo original
        if (currentHighlight.setIcon) {
            // Es un marcador
            const originalIcon = createCustomIcon(
                currentHighlight._id.includes('punto') ? '#e74c3c' : '#3498db',
                currentHighlight._id.includes('punto') ? 'fa-landmark' : 'fa-concierge-bell'
            );
            currentHighlight.setIcon(originalIcon);
        } else if (currentHighlight.setStyle) {
            // Es una zona
            const isRectangle = currentHighlight.getBounds ? 'rectangle' : 'polygon';
            currentHighlight.setStyle({
                color: isRectangle === 'rectangle' ? '#e74c3c' : '#3498db',
                fillColor: isRectangle === 'rectangle' ? '#e74c3c' : '#3498db',
                fillOpacity: 0.2,
                weight: 2,
                className: ''
            });
        }
        
        currentHighlight = null;
        currentHighlightLayer = null;
    }
}

function filterTable(searchTerm) {
    const rows = document.querySelectorAll('#locationsTable tr');
    let foundInTable = false;
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm.toLowerCase())) {
            row.style.display = '';
            row.style.backgroundColor = 'rgba(112, 179, 201, 0.2)';
            row.style.fontWeight = '600';
            foundInTable = true;
            
            // También buscar y centrar en el mapa
            const nombre = row.cells[0].textContent;
            performMapSearch(nombre);
        } else {
            row.style.display = 'none';
            row.style.backgroundColor = '';
            row.style.fontWeight = '';
        }
    });
    
    if (!foundInTable && searchTerm) {
        showMessage('No se encontró en la tabla', 'info');
    }
}

function performMapSearch(nombre) {
    const searchTerm = nombre.toLowerCase();
    
    // Limpiar highlight anterior
    clearHighlight();
    
    // Buscar y resaltar en el mapa
    let found = false;
    
    puntosInteres.forEach(punto => {
        if (punto.nombre.toLowerCase().includes(searchTerm)) {
            highlightAndCenter(punto, 'punto');
            found = true;
        }
    });
    
    if (!found) {
        servicios.forEach(servicio => {
            if (servicio.nombre.toLowerCase().includes(searchTerm)) {
                highlightAndCenter(servicio, 'servicio');
                found = true;
            }
        });
    }
    
    if (!found) {
        zonas.forEach(zona => {
            if (zona.nombre.toLowerCase().includes(searchTerm)) {
                highlightAndCenter(zona, 'zona');
                found = true;
            }
        });
    }
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// ===== FUNCIONES GLOBALES =====

window.cancelZonaCreation = function() {
    map.closePopup();
    cancelDrawing();
};

window.editLocation = async function(id, tipo) {
    const nombre = prompt('Nuevo nombre:');
    if (nombre === null) return;
    
    const descripcion = prompt('Nueva descripción:');
    if (descripcion === null) return;
    
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
                showMessage('Ubicación actualizada exitosamente', 'success');
            }
        } catch (error) {
            showMessage('Error al actualizar la ubicación', 'error');
        }
    }
};

// Moving
let moveHandler = null;

window.moveLocation = function(id, tipo) {
    map.closePopup();

    showMessage("Da click en un nuevo punto del mapa para mover la ubicación...", "info");

    // Por si acaso
    if (moveHandler) {
        map.off("click", moveHandler);
        moveHandler = null;
    }

    moveHandler = async function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        map.off("click", moveHandler);
        moveHandler = null;

        try {
            const endpoint = tipo === "punto" ? "/pinteres" : "/servicio";

            const response = await fetch(API_BASE + endpoint + "/" + id, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    location : {
                    type : "Point",
                    coordinates: [lng, lat]
                }})
            });

            if (response.ok) {
                loadData();
                showMessage("Ubicación actualizada exitosamente", "success");
            } else {
                showMessage("Error al actualizar la ubicación", "error");
            }
        } catch (error) {
            showMessage("Error al actualizar la ubicación", "error");
        }
    };

    // Activar escucha del clic
    map.on("click", moveHandler);
};

window.editZona = async function(id) {
    const nombre = prompt('Nuevo nombre:');
    if (nombre === null) return;
    
    const descripcion = prompt('Nueva descripción:');
    if (descripcion === null) return;
    
    if (nombre && descripcion) {
        try {
            const response = await fetch(API_BASE + '/zona/' + id, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre, descripcion })
            });

            if (response.ok) {
                loadData();
                showMessage('Ubicación actualizada exitosamente', 'success');
            }
        } catch (error) {
            showMessage('Error al actualizar la ubicación', 'error');
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
                showMessage('Ubicación eliminada exitosamente', 'success');
            }
        } catch (error) {
            showMessage('Error al eliminar la ubicación', 'error');
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
                showMessage('Zona eliminada exitosamente', 'success');
            }
        } catch (error) {
            showMessage('Error al eliminar la zona', 'error');
        }
    }
};

window.verResenas = function(id, tipo) {
    localStorage.setItem('currentPlaceId', id);
    localStorage.setItem('currentPlaceType', tipo);
    window.location.href = 'reviews.html';
};