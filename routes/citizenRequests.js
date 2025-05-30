const express = require('express');
const router = express.Router();
const controller = require('../controllers/citizenRequestController');

router.get('/', controller.getAll);
router.post('/', controller.create);
router.patch('/:id/status', controller.updateStatus);
router.post('/:id/comment', controller.addComment);
router.delete('/:id', controller.delete);
router.patch('/:id', controller.update);
router.get('/nearby', controller.getByLocation);
router.patch('/:id/comment/:commentId', controller.editComment);
router.delete('/:id/comment/:commentId', controller.deleteComment);

module.exports = router; 