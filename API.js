const express = require("express");
const app = express();
const port = 3001; // Asegúrate de que este puerto sea el que espera el frontend (BASE_URL en APIService.js)
const routerApi = require('./routes/rutas');
const cors = require('cors'); 
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config(); // Cargar variables de entorno

// ----------------------------------------------------
// 🛑 MODIFICACIÓN DE CORS: Permite la conexión desde http://localhost:3000
// ----------------------------------------------------
const whitelist = ['http://localhost:3000']; 
const options = {
  origin: (origin, callback) => {
    // Permite la conexión si el origen está en la lista blanca o si es una petición sin origen (como Postman)
    if (whitelist.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true, 
};
app.use(cors(options)); 

// ----------------------------------------------------
// 🛑 CORRECCIÓN DE ORDEN: Middlewares de JSON deben ir PRIMERO
// Esto es CRÍTICO para que req.body funcione en las rutas POST/PUT
// ----------------------------------------------------
app.use(bodyParser.json()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// RUTA DE PRUEBA
app.get("/", (req, res) => {
    res.send("Hello world on Express");
});

// RUTAS: DEBE IR DESPUÉS DE LOS MIDDLEWARES DE JSON/BODY-PARSER
routerApi(app); 


// 🛑 MODIFICACIÓN DE CONEXIÓN A MONGO: Inicia el servidor solo si la conexión es exitosa
mongoose.connect(process.env.MONGODB)
    .then(() => {
        console.log('Conexion a MongoDB exitosa');
        
        // Listen: INICIA EL SERVIDOR SOLO DESPUÉS DE CONECTARSE A MONGO
        app.listen(port, () => {
            console.log(`My server is running on port: ${port}`);
        });

    })
    .catch(err => {
        console.error('No se puede conectar a MongoDB:', err);
    });