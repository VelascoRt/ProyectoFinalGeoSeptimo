const express = require("express");
const UserService = require('../services/usersService'); // Importar la clase, no la instancia

const router = express.Router();
// CORRECCIÓN: Instanciar el servicio (asegura que exportas la clase en usersService.js)
const service = new UserService(); 


// 🛑 RUTA DE LOGIN (POST /user/login)
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Faltan credenciales." });
        }
        
        // Llamada al método de Login en el servicio
        const result = await service.login(username, password);

        // Envía el token y la info del usuario
        res.status(200).json({
            message: "Login exitoso",
            token: result.token,
            user: result.user
        });
    } catch (e) {
        res.status(401).json({ message: e.message }); // 401 Unauthorized para errores de credenciales
    }
});

// 🛑 RUTA DE REGISTRO (POST /user/) - Usa el endpoint POST existente
router.post("/", async (req, res) => {
    try {
        const data = req.body;
        // La lógica de hashing está en el servicio/modelo
        const newResource = await service.create(data); 
        res.status(201).json({
            message: "Usuario registrado exitosamente",
            data: newResource
        });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});


// GET
router.get("/", async (req, res) => {
    try {
        const data = await service.getAll();
        res.json(data);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

// GET BY ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const data = await service.getById(id);
        res.json(data);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

// PATCH / UPDATE
router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const changes = req.body;
        const data = await service.update(id, changes);
        res.status(200).json(data);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

// DELETE
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const response = await service.delete(id);
        res.status(200).json({ message: "Resource deleted successfull", data: response })
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

module.exports = router;