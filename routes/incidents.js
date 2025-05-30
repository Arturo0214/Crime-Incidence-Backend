const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');

// Obtener todos los incidentes
router.get('/', async (req, res) => {
    try {
        const incidents = await Incident.find()
            .sort({ date: -1 });
        res.json({ data: incidents });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener incidentes por calle
router.get('/street/:street', async (req, res) => {
    try {
        const incidents = await Incident.find({
            'location.street': { $regex: req.params.street, $options: 'i' }
        }).sort({ date: -1 });
        res.json({ data: incidents });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener estadísticas
router.get('/statistics', async (req, res) => {
    try {
        const totalIncidents = await Incident.countDocuments();
        const highImpactIncidents = await Incident.countDocuments({ crimeImpact: 'ALTO' });
        const lowImpactIncidents = await Incident.countDocuments({ crimeImpact: 'BAJO' });

        const incidentsByType = await Incident.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        res.json({
            total: totalIncidents,
            highImpact: highImpactIncidents,
            lowImpact: lowImpactIncidents,
            byType: incidentsByType
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Crear nuevo incidente
router.post('/', async (req, res) => {
    try {
        const incident = new Incident(req.body);
        const newIncident = await incident.save();
        res.status(201).json(newIncident);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Actualizar incidente
router.put('/:id', async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);
        if (!incident) {
            return res.status(404).json({ message: 'Incidente no encontrado' });
        }

        // Actualizar campos permitidos
        const allowedUpdates = [
            'type', 'crimeType', 'crimeImpact', 'location', 'date', 'description',
            'reportedBy', 'status', 'additionalDetails'
        ];

        allowedUpdates.forEach(update => {
            if (req.body[update] !== undefined) {
                incident[update] = req.body[update];
            }
        });

        const updatedIncident = await incident.save();
        res.json(updatedIncident);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Eliminar incidente
router.delete('/:id', async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);
        if (!incident) {
            return res.status(404).json({ message: 'Incidente no encontrado' });
        }

        await incident.deleteOne();
        res.json({ message: 'Incidente eliminado' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 