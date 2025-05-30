const express = require('express');
const router = express.Router();
const agreementController = require('../controllers/agreementController');
const auth = require('../middleware/auth');

// Obtener todos los acuerdos
router.get('/', agreementController.getAllAgreements);

// Obtener acuerdo por ID
router.get('/:id', agreementController.getAgreementById);

// Crear nuevo acuerdo
router.post('/', auth, agreementController.createAgreement);

// Actualizar acuerdo
router.put('/:id', auth, agreementController.updateAgreement);

// Eliminar acuerdo
router.delete('/:id', auth, agreementController.deleteAgreement);

// Crear varios acuerdos a la vez
router.post('/bulk', auth, agreementController.createAgreementsBulk);

// Comentarios en acuerdos
router.post('/:id/comments', auth, agreementController.addCommentToAgreement);
router.put('/:id/comments/:commentIdx', auth, agreementController.editCommentInAgreement);
router.delete('/:id/comments/:commentIdx', auth, agreementController.deleteCommentFromAgreement);

module.exports = router; 