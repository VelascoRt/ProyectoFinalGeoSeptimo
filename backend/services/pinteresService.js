
// Model
const PInteres = require('../models/PInteres')
class PIntereservice {
    
    async getAll() {
        try {
            const data = await PInteres.find({}).lean();
            return data;
        } catch (e) { // Middleware
            throw new Error("PInteres not found");
        }
    }

    async getByID(id) {
        try {
            const data = await PInteres.findById({_id : id});
            return data;
        } catch (e) { // Middleware
            throw new Error("PInteres not found");
        }
    }

    async create(data) {
        try {
            const newPInteres= new PInteres({ ...data});
            await newPInteres.save({new: true, lean: true})
            return newPInteres;
        } catch (e) { // Middleware
            throw new Error("PInteres creation failed" + e.message);
        }
    }

    async update(id,changes) {
        try {
            return await PInteres.findByIdAndUpdate(id, { $set: changes}, { new: true, lean: true });
        } catch (e) { // Middleware
            throw new Error("PInteres not found");
        }
    }

    async delete(id) {
        try {
            return await PInteres.deleteOne({_id : id});
        } catch (e) { // Middleware
            throw new Error("PInteres not found")
        }
    }
}

// Export
module.exports = PIntereservice;