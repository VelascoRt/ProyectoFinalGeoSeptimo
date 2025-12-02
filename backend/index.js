const express = require("express");
const app = express();
const port = 3000;
// dotenv
require('dotenv').config();
const routerApi = require('./routes/rutas');
// Importar MongoDB
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { logError, errorHandler,  notFoundHandler, asyncErrorHandler } = require('./middlewares/errorHandler');

// Configurar CORS correctamente
app.use(cors({
    origin: ['http://localhost', 'http://localhost:80','http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Hello world
app.get("/", (req,res) => {
  res.send("Hello world on Express");
});

// Routers
routerApi(app);
app.use(notFoundHandler);
app.use(logError);       
app.use(errorHandler); 

// MongoDB
app.use(bodyParser.json());

// VICTOR
mongoose.connect(`${process.env.MONGODB}`)
.then(()=> console.log('Conexion a MongoDB exitosa'))
.catch(err => console.error('No se puede conectar a MongoDB', err));

// Listen
app.listen(port, () => {
  console.log("My server is on port : " + port)
})