const User = require('../models/User');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'secretkey';

exports.register = async (req, res) => {
    try {
        const { username, name, password, role } = req.body;
        const user = new User({ username, name, password, role });
        await user.save();
        res.status(201).json({ message: 'Usuario registrado' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });
        const token = jwt.sign({ id: user._id, username: user.username, name: user.name, role: user.role }, SECRET, { expiresIn: '7d' });
        res.status(200).json({ token, user: { id: user._id, username: user.username, name: user.name, role: user.role } });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 