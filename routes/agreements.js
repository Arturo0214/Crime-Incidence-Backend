const express = require('express');
const router = express.Router();
const agreementController = require('../controllers/agreementController');

// Obtener todos los acuerdos
router.get('/', agreementController.getAllAgreements);

// Obtener acuerdo por ID
router.get('/:id', agreementController.getAgreementById);

// Crear nuevo acuerdo
router.post('/', agreementController.createAgreement);

// Actualizar acuerdo
router.put('/:id', agreementController.updateAgreement);

// Eliminar acuerdo
router.delete('/:id', agreementController.deleteAgreement);

// Crear varios acuerdos a la vez
router.post('/bulk', agreementController.createAgreementsBulk);

// Comentarios en acuerdos
router.post('/:id/comments', agreementController.addCommentToAgreement);
router.put('/:id/comments/:commentIdx', agreementController.editCommentInAgreement);
router.delete('/:id/comments/:commentIdx', agreementController.deleteCommentFromAgreement);

module.exports = router; 