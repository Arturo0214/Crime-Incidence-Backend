const SpecialInstruction = require('../models/SpecialInstruction');

exports.getAll = async (req, res) => {
    try {
        const instructions = await SpecialInstruction.find().sort({ createdAt: -1 });
        res.json(instructions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { title, description, status } = req.body;
        const instruction = new SpecialInstruction({ title, description, status });
        await instruction.save();
        res.status(201).json(instruction);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const instruction = await SpecialInstruction.findByIdAndUpdate(id, { status }, { new: true });
        res.json(instruction);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, author } = req.body;
        const instruction = await SpecialInstruction.findById(id);
        if (!instruction) return res.status(404).json({ error: 'Not found' });
        instruction.comments.push({ text, author });
        await instruction.save();
        res.json(instruction);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.editComment = async (req, res) => {
    try {
        const { id, commentIdx } = req.params;
        const { text } = req.body;
        const instruction = await SpecialInstruction.findById(id);
        if (!instruction) return res.status(404).json({ error: 'Not found' });
        if (!instruction.comments[commentIdx]) return res.status(404).json({ error: 'Comentario no encontrado' });
        instruction.comments[commentIdx].text = text;
        await instruction.save();
        res.json(instruction);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const { id, commentIdx } = req.params;
        const instruction = await SpecialInstruction.findById(id);
        if (!instruction) return res.status(404).json({ error: 'Not found' });
        if (!instruction.comments[commentIdx]) return res.status(404).json({ error: 'Comentario no encontrado' });
        instruction.comments.splice(commentIdx, 1);
        await instruction.save();
        res.json(instruction);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await SpecialInstruction.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}; 