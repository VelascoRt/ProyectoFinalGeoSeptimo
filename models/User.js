const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Importar bcrypt

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // Puedes añadir otros campos necesarios, como 'nombre'
    // nombre: { type: String, required: true },
});

// Middleware PRE-SAVE: Hashear la contraseña antes de guardar
UserSchema.pre('save', async function(next) {
    const user = this;
    // Solo hashear si la contraseña ha sido modificada (o es nueva)
    if (!user.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
        next();
    } catch (error) {
        return next(error);
    }
});

// Método para comparar la contraseña (usado en el Login)
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        return false;
    }
};

module.exports = mongoose.model('User', UserSchema);