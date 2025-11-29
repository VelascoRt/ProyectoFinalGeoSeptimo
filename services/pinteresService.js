// services/pinteresService.js

const PInteres = require('../models/PInteres'); // Asegúrate que el path sea correcto

class PInteresService {
    
    // Métodos CRUD existentes (debes asegurarte que coincidan con tu código)
    async getAll() {
        try {
            const data = await PInteres.find().lean();
            return data;
        } catch (e) {
            throw new Error("PInteres not found");
        }
    }

    async getByID(id) {
        try {
            const data = await PInteres.findById(id).lean();
            return data;
        } catch (e) {
            return null;
        }
    }

    async create(data) {
        try {
            const newPinteres = new PInteres(data);
            await newPinteres.save();
            return newPinteres;
        } catch (e) {
            throw new Error("Pinteres creation failed: " + e.message);
        }
    }

    async update(id, changes) {
        try {
            const updatedPinteres = await PInteres.findByIdAndUpdate(
                id, 
                { $set: changes }, 
                { new: true, runValidators: true }
            );
            if (!updatedPinteres) {
                throw new Error("PInteres not found for update");
            }
            return updatedPinteres;
        } catch (e) {
            throw new Error("Pinteres not found");
        }
    }

    async delete(id) {
        try {
            const result = await PInteres.deleteOne({ _id: id });
            if (result.deletedCount === 0) {
                 throw new Error("PInteres not found for deletion");
            }
            return { message: 'PInteres deleted successfully' };
        } catch (e) {
            throw new Error("Pinteres not found");
        }
    }

    // *** MÉTODO DE BÚSQUEDA AGREGADO ***
    async searchByName(name) {
        try {
            const data = await PInteres.find({
                nombre: { $regex: new RegExp(name, 'i') }
            }).lean();
            if (data.length === 0) {
                 throw new Error("No PInteres found with that name.");
            }
            return data;
        } catch (e) {
            throw new Error(e.message || "Error searching PInteres by name.");
        }
    }
}

module.exports = new PInteresService();
