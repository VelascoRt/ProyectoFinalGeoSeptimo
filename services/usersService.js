const User = require('../models/User'); // Asegúrate que la ruta sea correcta
const jwt = require('jsonwebtoken'); // Importar jsonwebtoken

// Define una clave secreta para firmar los tokens (¡Cámbiala en producción!)
const SECRET_KEY = process.env.JWT_SECRET || 'mi_clave_secreta_super_segura'; 

class UserService {

    // Método auxiliar para generar un token JWT
    generateToken(user) {
        return jwt.sign({ 
            _id: user._id, 
            username: user.username 
        }, SECRET_KEY, { expiresIn: '1h' });
    }

    // Método de LOGIN
    async login(username, password) {
        try {
            const user = await User.findOne({ username });
            if (!user) {
                throw new Error("Usuario o contraseña incorrectos.");
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                throw new Error("Usuario o contraseña incorrectos.");
            }

            // Éxito: Generar y devolver el token
            const token = this.generateToken(user);
            return { user: { _id: user._id, username: user.username }, token };

        } catch (e) {
            throw new Error(e.message || "Error al iniciar sesión.");
        }
    }

    // Sobreescribe el método CREATE para el REGISTRO de usuarios
    async create(data) {
        try {
            // El hash de la contraseña se hace automáticamente en el middleware pre-save del modelo
            const newUser = new User(data);
            await newUser.save();
            
            // Opcional: Generar token inmediatamente después del registro
            // const token = this.generateToken(newUser);
            // return { user: { _id: newUser._id, username: newUser.username }, token };

            return { _id: newUser._id, username: newUser.username }; // Devolver solo info pública

        } catch (e) {
            if (e.code === 11000) { // Error de duplicidad de Mongo
                throw new Error("El nombre de usuario ya está registrado.");
            }
            throw new Error("Error al registrar el usuario: " + e.message);
        }
    }
    
    // Métodos CRUD básicos (mantener para cumplimiento de la rúbrica si es necesario)

    async getAll() {
        try {
            const data = await User.find().lean();
            return data;
        } catch (e) {
            throw new Error("Usuarios not found");
        }
    }

    async getByID(id) {
        try {
            const data = await User.findById(id).lean();
            return data;
        } catch (e) {
            return null;
        }
    }

    async update(id, changes) {
        try {
            // Considerar si quieres hashear la contraseña si se actualiza
            const data = await User.findByIdAndUpdate(id, { $set: changes }, { new: true, lean: true });
            return data;
        } catch (e) {
            throw new Error("Usuarios not found");
        }
    }

    async delete(id) {
        try {
            const data = await User.deleteOne({ _id: id });
            return data;
        } catch (e) {
            throw new Error("Usuarios not found");
        }
    }
}

module.exports = UserService;