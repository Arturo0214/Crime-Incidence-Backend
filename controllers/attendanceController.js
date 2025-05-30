const Attendance = require('../models/Attendance');

// Obtener todas las asistencias
exports.getAllAttendance = async (req, res) => {
    try {
        console.log('[getAllAttendance]');
        const attendance = await Attendance.find()
            .populate('participants.participantId', 'name role')
            .sort({ date: -1 });
        console.log('[getAllAttendance] Result:', attendance.length, 'registros');
        res.json(attendance);
    } catch (err) {
        console.error('[getAllAttendance] Error:', err);
        res.status(500).json({ message: err.message });
    }
};

// Obtener asistencia por fecha
exports.getAttendanceByDate = async (req, res) => {
    try {
        console.log('[getAttendanceByDate] Params:', req.params);
        const date = new Date(req.params.date);
        const attendance = await Attendance.findOne({ date })
            .populate('participants.participantId', 'name role');
        if (!attendance) {
            console.log('[getAttendanceByDate] No se encontró asistencia para la fecha:', date);
            return res.status(404).json({ message: 'No se encontró asistencia para esta fecha' });
        }
        console.log('[getAttendanceByDate] Result:', attendance);
        res.json(attendance);
    } catch (err) {
        console.error('[getAttendanceByDate] Error:', err);
        res.status(500).json({ message: err.message });
    }
};

// Crear nueva asistencia
exports.createAttendance = async (req, res) => {
    try {
        console.log('[createAttendance] Body recibido:', req.body);
        const { date, participants } = req.body;
        // Verificar si ya existe asistencia para esta fecha
        const existingAttendance = await Attendance.findOne({ date });
        if (existingAttendance) {
            console.log('[createAttendance] Ya existe asistencia para la fecha:', date);
            return res.status(400).json({ message: 'Ya existe asistencia registrada para esta fecha' });
        }
        // Validar día de la semana usando fecha UTC
        let dayOfWeek;
        let utcDate;
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            utcDate = new Date(date + 'T00:00:00Z'); // Fuerza medianoche UTC
            dayOfWeek = utcDate.getUTCDay(); // Lunes-viernes en UTC
        } else {
            utcDate = new Date(date);
            dayOfWeek = utcDate.getUTCDay();
        }
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            console.log('[createAttendance] Fecha no válida (fin de semana):', date);
            return res.status(400).json({ message: 'La asistencia solo puede registrarse de lunes a viernes' });
        }
        const attendance = new Attendance({ date: utcDate, participants });
        const newAttendance = await attendance.save();
        console.log('[createAttendance] Asistencia guardada:', newAttendance);
        res.status(201).json(newAttendance);
    } catch (err) {
        console.error('[createAttendance] Error:', err);
        res.status(400).json({ message: err.message });
    }
};

// Actualizar asistencia
exports.updateAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!attendance) return res.status(404).json({ message: 'Asistencia no encontrada' });
        res.status(200).json(attendance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar asistencia
exports.deleteAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndDelete(req.params.id);
        if (!attendance) return res.status(404).json({ message: 'Asistencia no encontrada' });
        res.status(200).json({ message: 'Asistencia eliminada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
