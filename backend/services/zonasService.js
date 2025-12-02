
// Model
const Zona = require('../models/Zona')
class ZonaService {
    
    async getAll() {
        try {
            const data = await Zona.find({}).lean();
            return data;
        } catch (e) { // Middleware
            throw new Error("Zonas not found");
        }
    }

    async getByID(id) {
        try {
            const data = await Zona.findById({_id : id});
            return data;
        } catch (e) { // Middleware
            throw new Error("Zona not found");
        }
    }

    async create(data) {
        try {
            const newZona = new Zona({ ...data});
            await newZona.save({new: true, lean: true})
            return newZona;
        } catch (e) { // Middleware
            throw new Error("Zonas creation failed" + e.message);
        }
    }

    async update(id,changes) {
        try {
            return await Zona.findByIdAndUpdate(id, { $set: changes}, { new: true, lean: true });
        } catch (e) { // Middleware
            throw new Error("Zonas not found");
        }
    }

    async delete(id) {
        try {
            return await Zona.deleteOne({_id : id});
        } catch (e) { // Middleware
            throw new Error("Zonas not found")
        }
    }
}

// Export
module.exports = ZonaService;