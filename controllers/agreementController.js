const Agreement = require('../models/Agreement');

// Helper para ajustar fecha a local 12:00
function adjustDateToLocalNoon(dateStr) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day, 12, 0, 0);
    }
    return dateStr;
}

// Obtener todos los acuerdos
exports.getAllAgreements = async (req, res) => {
    try {
        const agreements = await Agreement.find()
            .sort({ date: -1 })
            .select('title description date status responsible dueDate priority comments');
        res.status(200).json(agreements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener un acuerdo por ID
exports.getAgreementById = async (req, res) => {
    try {
        const agreement = await Agreement.findById(req.params.id);
        if (!agreement) return res.status(404).json({ message: 'Acuerdo no encontrado' });
        res.status(200).json(agreement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear un nuevo acuerdo
exports.createAgreement = async (req, res) => {
    try {
        if (req.body.date) {
            req.body.date = adjustDateToLocalNoon(req.body.date);
        }
        if (req.body.dueDate) {
            req.body.dueDate = adjustDateToLocalNoon(req.body.dueDate);
        }
        const agreement = new Agreement(req.body);
        await agreement.save();
        res.status(201).json(agreement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Actualizar un acuerdo existente
exports.updateAgreement = async (req, res) => {
    try {
        if (req.body.date) {
            req.body.date = adjustDateToLocalNoon(req.body.date);
        }
        if (req.body.dueDate) {
            req.body.dueDate = adjustDateToLocalNoon(req.body.dueDate);
        }
        const agreement = await Agreement.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!agreement) return res.status(404).json({ message: 'Acuerdo no encontrado' });
        res.status(200).json(agreement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar un acuerdo
exports.deleteAgreement = async (req, res) => {
    try {
        const agreement = await Agreement.findByIdAndDelete(req.params.id);
        if (!agreement) return res.status(404).json({ message: 'Acuerdo no encontrado' });
        res.status(200).json({ message: 'Acuerdo eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear varios acuerdos a la vez
exports.createAgreementsBulk = async (req, res) => {
    try {
        const agreements = req.body.map(agreement => {
            if (agreement.date) {
                agreement.date = adjustDateToLocalNoon(agreement.date);
            }
            if (agreement.dueDate) {
                agreement.dueDate = adjustDateToLocalNoon(agreement.dueDate);
            }
            return agreement;
        });

        const createdAgreements = await Agreement.insertMany(agreements);
        res.status(201).json(createdAgreements);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Agregar un comentario a un acuerdo
exports.addCommentToAgreement = async (req, res) => {
    try {
        const agreement = await Agreement.findById(req.params.id);
        if (!agreement) return res.status(404).json({ message: 'Acuerdo no encontrado' });
        agreement.comments = agreement.comments || [];
        agreement.comments.push(req.body);
        await agreement.save();
        res.status(200).json(agreement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Editar un comentario de un acuerdo
exports.editCommentInAgreement = async (req, res) => {
    try {
        const agreement = await Agreement.findById(req.params.id);
        if (!agreement) return res.status(404).json({ message: 'Acuerdo no encontrado' });
        const idx = parseInt(req.params.commentIdx, 10);
        if (!agreement.comments || !agreement.comments[idx]) return res.status(404).json({ message: 'Comentario no encontrado' });
        agreement.comments[idx] = { ...agreement.comments[idx], ...req.body };
        await agreement.save();
        res.status(200).json(agreement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar un comentario de un acuerdo
exports.deleteCommentFromAgreement = async (req, res) => {
    try {
        const agreement = await Agreement.findById(req.params.id);
        if (!agreement) return res.status(404).json({ message: 'Acuerdo no encontrado' });
        const idx = parseInt(req.params.commentIdx, 10);
        if (!agreement.comments || !agreement.comments[idx]) return res.status(404).json({ message: 'Comentario no encontrado' });
        agreement.comments.splice(idx, 1);
        await agreement.save();
        res.status(200).json(agreement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}; 