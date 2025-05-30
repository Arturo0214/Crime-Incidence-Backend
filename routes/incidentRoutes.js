const express = require('express');
const router = express.Router();
const {
    createIncident,
    createIncidentsBulk,
    getIncidents,
    getIncidentsByStreet,
    getStatistics,
    getMapData,
    updateIncident,
    deleteIncident
} = require('../controllers/incidentController');

// Create new incident (single)
router.post('/', createIncident);

// Create multiple incidents (bulk)
router.post('/bulk', createIncidentsBulk);

// Get all incidents
router.get('/', getIncidents);

// Get incidents by street
router.get('/street/:street', getIncidentsByStreet);

// Get incident statistics
router.get('/statistics', getStatistics);

// Get map data
router.get('/map', getMapData);

// Update incident
router.put('/:id', updateIncident);

// Delete incident
router.delete('/:id', deleteIncident);

module.exports = router; 