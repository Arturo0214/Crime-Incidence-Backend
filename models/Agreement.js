const mongoose = require('mongoose');

const agreementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pendiente', 'en_progreso', 'completado', 'cancelado', 'informacion'],
        default: 'pendiente'
    },
    responsible: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Participant'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    priority: {
        type: String,
        enum: ['baja', 'media', 'alta'],
        default: 'media'
    },
    attachments: [{
        filename: String,
        path: String,
        uploadedAt: Date
    }],
    comments: [{
        text: String,
        author: String,
        date: Date
    }]
}, {
    timestamps: true
});

// Índices para búsquedas comunes
agreementSchema.index({ status: 1, date: -1 });
agreementSchema.index({ assignedTo: 1 });
agreementSchema.index({ responsible: 1 });
agreementSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Agreement', agreementSchema); 