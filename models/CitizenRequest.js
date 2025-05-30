const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const citizenRequestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    requester: {
        name: { type: String, required: true },
        phone: { type: String, required: true }
    },
    location: {
        street: { type: String, required: true },
        coordinates: {
            type: { type: String, default: 'Point' },
            coordinates: {
                type: [Number],
                required: true
            }
        }
    },
    status: {
        type: String,
        enum: ['Pendiente', 'Asignado', 'En investigación', 'En Proceso', 'Atendido', 'Archivado'],
        default: 'Pendiente'
    },
    comments: [commentSchema]
}, { timestamps: true });

// Índice para búsquedas geoespaciales
citizenRequestSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('CitizenRequest', citizenRequestSchema); 