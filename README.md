## Antes de iniciar

Primero corre el comando:

### `npm i`

Después crea el archivo .env y agrega la variable de MONGODB:

### `MONGODB=TUCONNECT`

Y solamente corre `npm run api` o `npm start` para correr la API o el frontend.
o
### `npm run dev`
Para correr ambas.

## Scripts Disponibles

In the project directory, you can run:

### `npm run api`

Para correr la API.


### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run api`

Para correr la API.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
### `npm run eject`

## Modelos

### PInteres

Puntos de interés
Ejemplo:

`{    
    "nombre": "Plaza Mayor",
    "descripcion": "Esta es la famosa plaza mayor de León Guanajuato, es una plaza en León Guanajuato",
    "location" : {
        "type" : "Point",
        "coordinates": [-101.69524669647218, 21.15743637827049]
    }
}`

### Review
Reseñas de cada Servicio, ocupa un usuario y un servicio
Ejemplo:
`{
    "user" : "6928db0d57f5edc5e9d084c4",
    "calificacion" : 5,
    "opinion" : "Es una buena plaza en mi opinion",
    "servicioTuristico" : "6927e36098685bd72dbd406e"
}`

### Servicio

Servicio turistico, ocupa coordenadas.
`{    
    "id": 1,
    "nombre": "Plaza Mayor",
    "descripcion": "Esta es la famosa plaza mayor de León Guanajuato, es una plaza en León Guanajuato",
    "location" : {
        "type" : "Point",
        "coordinates": [-101.69524669647218, 21.15743637827049]
    }
}`

### User

Usuario
Ejemplo:
`{
    "username" : "atervictor",
    "password" : "ADS131312DASDASDMKÑ"
}`

### Zona

Zona, puedes escoger entre poligonos, cuadrado, circulo y marcador.

Ejemplo:
`{
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
}`
