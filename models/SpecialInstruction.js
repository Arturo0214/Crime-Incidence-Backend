const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const specialInstructionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['designado', 'atendido', 'en proceso', 'en seguimiento'],
        default: 'designado'
    },
    comments: [commentSchema]
}, { timestamps: true });

module.exports = mongoose.model('SpecialInstruction', specialInstructionSchema); 