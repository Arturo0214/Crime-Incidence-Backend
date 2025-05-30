const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    participants: [{
        participantId: {
            type: String,
            required: true
        },
        attendance: {
            type: String,
            enum: ['titular', 'suplente', 'ausente'],
            default: 'ausente'
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
}, {
    timestamps: true
});

// Índice para búsquedas por fecha
attendanceSchema.index({ date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema); 