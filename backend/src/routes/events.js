const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.get('/', eventController.getAdminEvents);
router.get('/public', eventController.getPublicEvents);
router.get('/public/:id', eventController.getPublicEventById);
router.post('/', eventController.createEvent);
router.put('/:id', eventController.updateEvent);

module.exports = router;
