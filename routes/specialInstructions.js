const express = require('express');
const router = express.Router();
const controller = require('../controllers/specialInstructionController');

router.get('/', controller.getAll);
router.post('/', controller.create);
router.patch('/:id/status', controller.updateStatus);
router.post('/:id/comment', controller.addComment);
router.put('/:id/comment/:commentIdx', controller.editComment);
router.delete('/:id/comment/:commentIdx', controller.deleteComment);
router.delete('/:id', controller.delete);

module.exports = router; 