### 🌍 Trotamundos - Aplicación de Sistemas Geo-Referenciados

Trotamundos es una aplicación web Full Stack diseñada para centralizar y democratizar la información sobre puntos de interés turístico y cultural. Permite a los usuarios registrarse, explorar un mapa interactivo y contribuir a la comunidad mediante la creación de marcadores y reseñas geolocalizadas.

### 🚀 Características Principales

Autenticación Segura: Sistema de Login y Registro con encriptación de contraseñas (bcrypt) y manejo de sesiones con JSON Web Tokens (JWT).

Mapa Interactivo: Integración con Leaflet para visualización de mapas, navegación fluida y renderizado de marcadores.

Gestión de Ubicaciones (CRUD): Los usuarios pueden crear, leer, editar y eliminar puntos de interés directamente desde el mapa.

Sistema de Reseñas: Funcionalidad para calificar y comentar sobre los lugares registrados.

Búsqueda: Filtro de ubicaciones por nombre en tiempo real.

Arquitectura MERN: Backend robusto en Node/Express y Frontend reactivo en React.

### 🛠️ Tecnologías Utilizadas

Frontend: React 19, React Router DOM, React Leaflet, CSS3.

Backend: Node.js, Express.js.

Base de Datos: MongoDB Atlas (Nube), Mongoose (ODM).

Seguridad: Bcrypt (Hashing), JWT (Auth), CORS.

Herramientas: Visual Studio Code, Git, npm.

### 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

Node.js (v16 o superior recomendado)

Git

Una cuenta activa en MongoDB Atlas para obtener tu cadena de conexión.

### ⚙️ Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto en tu entorno local:

### 1. Clonar el repositorio
``` bash
git clone [https://github.com/TU_USUARIO/ProyectoFinalGeoSeptimo.git](https://github.com/TU_USUARIO/ProyectoFinalGeoSeptimo.git)```

```bash
cd ProyectoFinalGeoSeptimo ```



### 2. Instalar dependencias

Dado que el frontend y el backend comparten el package.json en la raíz, solo necesitas ejecutar:
``` bash
npm install ```



### 3. Configurar Variables de Entorno
Crea un archivo llamado .env en la raíz del proyecto y agrega tu cadena de conexión de MongoDB Atlas. Importante: Reemplaza <password> con la contraseña de tu usuario de base de datos (no la de tu cuenta de Atlas).

MONGODB=mongodb+srv://TU_USUARIO_DB:TU_CONTRASEÑA@TU_CLUSTER.mongodb.net/?appName=TU_APP
JWT_SECRET=tu_palabra_secreta_super_segura



### ▶️ Ejecución

El proyecto está configurado para ejecutar tanto el servidor (Express) como el cliente (React) simultáneamente.

Opción A: Modo Desarrollo (Recomendado)

Inicia ambos servidores (Backend en puerto 3001 y Frontend en puerto 3000) con un solo comando:
``` bash
npm run dev```



Opción B: Ejecución Individual

Si prefieres correrlos en terminales separadas para depuración:

Terminal 1 (Backend - API):
``` bash
npm run api```
# Deberías ver: "My server is running on port: 3001" y "Conexion a MongoDB exitosa"



Terminal 2 (Frontend - React):
``` bash 
npm start```
# Abrirá http://localhost:3000 en tu navegador



### 📡 Endpoints de la API

La API corre en http://localhost:3001 y cuenta con las siguientes rutas principales:

Usuarios (/user)

POST /user/: Registrar un nuevo usuario.

POST /user/login: Iniciar sesión (Devuelve Token JWT).

Puntos de Interés (/pinteres)

GET /pinteres: Obtener todas las ubicaciones.

GET /pinteres/search?name=...: Buscar ubicación por nombre.

POST /pinteres: Crear nueva ubicación (GeoJSON).

PUT /pinteres/:id: Actualizar ubicación.

DELETE /pinteres/:id: Eliminar ubicación.

Reseñas (/review)

GET /review/pinteres/:pinteresId: Obtener reseñas de un lugar.

POST /review: Crear una reseña.

DELETE /review/:reviewId: Eliminar una reseña.

### 📂 Estructura del Proyecto

PROYECTOFINALGEOSEPTIMO/
├── models/             # Esquemas de Mongoose (User, PInteres, Review)
├── routes/             # Definición de rutas de Express
├── services/           # Lógica de negocio del Backend
├── src/                # Código fuente del Frontend (React)
│   ├── components/     # Componentes reutilizables (Map, Table, Lists)
│   ├── pages/          # Vistas principales (Login, Principal, Reviews)
│   ├── services/       # Servicios para consumo de API (fetch)
│   ├── App.js          # Configuración de rutas de React
│   └── index.js        # Punto de entrada de React
├── API.js              # Archivo principal del servidor Express
└── package.json        # Dependencias y scripts



### Antes de iniciar

Primero corre el comando:
``` bash
npm i ```

### Después crea el archivo .env y agrega la variable de MONGODB:

MONGODB=TUCONNECT

Y solamente corre npm run api o npm start para correr la API o el frontend.
o
``` bash 
npm run dev```

### Para correr ambas.

Scripts Disponibles

### In the project directory, you can run:
``` bash 
npm run api```

### Para correr la API.
``` bash 
npm start```

### Runs the app in the development mode.

Open http://localhost:3000 to view it in your browser.

The page will reload when you make changes.

You may also see any lint errors in the console.
``` bash
npm test```

Launches the test runner in the interactive watch mode.

See the section about running tests for more information.
``` bash 
npm run build```

Builds the app for production to the build folder.

It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

Your app is ready to be deployed!

See the section about deployment for more information.
``` bash
npm run eject```

Modelos

PInteres

### Puntos de interés
Ejemplo:

{    
    "nombre": "Plaza Mayor",
    "descripcion": "Esta es la famosa plaza mayor de León Guanajuato, es una plaza en León Guanajuato",
    "location" : {
        "type" : "Point",
        "coordinates": [-101.69524669647218, 21.15743637827049]
    }
}


### Review

Reseñas de cada Servicio, ocupa un usuario y un servicio
Ejemplo:

{
    "user" : "6928db0d57f5edc5e9d084c4",
    "calificacion" : 5,
    "opinion" : "Es una buena plaza en mi opinion",
    "servicioTuristico" : "6927e36098685bd72dbd406e"
}



### Servicio

Servicio turistico, ocupa coordenadas.

{    
    "id": 1,
    "nombre": "Plaza Mayor",
    "descripcion": "Esta es la famosa plaza mayor de León Guanajuato, es una plaza en León Guanajuato",
    "location" : {
        "type" : "Point",
        "coordinates": [-101.69524669647218, 21.15743637827049]
    }
}


### USER

Usuario
Ejemplo:

{
    "username" : "atervictor",
    "password" : "ADS131312DASDASDMKÑ"
}


### ZONA

Zona, puedes escoger entre poligonos, cuadrado, circulo y marcador.

Ejemplo:

{
  "nombre": "Zona Arqueológica Principal",
  "descripcion": "Polígono de prueba para un área arqueológica.",
  "tipo": "polygon",
  "coordenadas": [
    [
      { "lat": 19.4321, "lng": -99.1331 },
      { "lat": 19.4331, "lng": -99.1340 },
      { "lat": 19.4315, "lng": -99.1345 },
      { "lat": 19.4308, "lng": -99.1334 },
      { "lat": 19.4321, "lng": -99.1331 }
    ]
  ]
}


SI llego a esta parte favor de dejar su like y compartir el video

✒️ Autores

Victor Manuel Ortiz Feregrino
Edgar Emilio Salcedo Elías
Marco Antonio Sánchez Murillo


📄 Licencia

Este proyecto es de uso académico para la Universidad La Salle Bajío.