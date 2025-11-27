
// Model
const Servicio = require('../models/Servicio')
class servicioService {
    async getAll() {
        try {
            const data = await Servicio.find({}).lean();
            return data;
        } catch (e) { // Middleware
            throw new Error("Servicios not found");
        }
    }

    async getByID(id) {
        try {
            const data = await Servicio.findById({_id : id});
            return data;
        } catch (e) { // Middleware
            return null;
        }
    }

    async create(data) {
        try {
            const newServicio = new Servicio({ ...data});
            await newServicio.save({new: true, lean: true})
            return newServicio;
        } catch (e) { // Middleware
            throw new Error("Servicios creation failed" + e.message);
        }
    }

    async update(id,changes) {
        try {
            return await Servicio.findByIdAndUpdate(id, { $set: changes}, { new: true, lean: true });
        } catch (e) { // Middleware
            throw new Error("Servicio not found");
        }
    }

    async delete(id) {
        try {
            return await Servicio.deleteOne({_id : id});
        } catch (e) { // Middleware
            throw new Error("Servicio not found")
        }
    }
}

// Export
module.exports = servicioService;