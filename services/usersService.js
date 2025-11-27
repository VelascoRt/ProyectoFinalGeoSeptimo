
// Model
const User = require('../models/User')
class UserService {
    
    async getAll() {
        try {
            const data = await User.find({}).lean();
            return data;
        } catch (e) { // Middleware
            throw new Error("Usuarios not found");
        }
    }

    async getByID(id) {
        try {
            const data = await User.findById({_id : id});
            return data;
        } catch (e) { // Middleware
            return null;
        }
    }

    async create(data) {
        try {
            const newUser = new User({ ...data});
            await newUser.save({new: true, lean: true})
            return newUser;
        } catch (e) { // Middleware
            throw new Error("Usuarios creation failed" + e.message);
        }
    }

    async update(id,changes) {
        try {
            return await User.findByIdAndUpdate(id, { $set: changes}, { new: true, lean: true });
        } catch (e) { // Middleware
            throw new Error("Usuarios not found");
        }
    }

    async delete(id) {
        try {
            return await User.deleteOne({_id : id});
        } catch (e) { // Middleware
            throw new Error("Usuarios not found")
        }
    }
}

// Export
module.exports = UserService;