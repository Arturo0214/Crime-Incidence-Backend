const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Obtener todas las asistencias
router.get('/', attendanceController.getAllAttendance);

// Obtener asistencia por fecha
router.get('/date/:date', attendanceController.getAttendanceByDate);

// Crear nueva asistencia
router.post('/', attendanceController.createAttendance);

// Actualizar asistencia
router.patch('/:id', attendanceController.updateAttendance);

// Eliminar asistencia
router.delete('/:id', attendanceController.deleteAttendance);

// Actualizar asistencia (PUT)
router.put('/:id', attendanceController.updateAttendance);

module.exports = router; 