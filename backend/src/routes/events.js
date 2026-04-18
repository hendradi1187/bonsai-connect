const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate, authorizeRole } = require('../middleware/auth');

router.get('/public', eventController.getPublicEvents);
router.get('/public/:id', eventController.getPublicEventById);
router.get('/', authenticate, authorizeRole('superadmin', 'admin'), eventController.getAdminEvents);
router.post('/', authenticate, authorizeRole('superadmin', 'admin'), eventController.createEvent);
router.put('/:id', authenticate, authorizeRole('superadmin', 'admin'), eventController.updateEvent);
router.put('/:id/lock', authenticate, authorizeRole('superadmin'), eventController.toggleLock);
router.put('/:id/archive', authenticate, authorizeRole('superadmin', 'admin'), eventController.archiveEvent);
router.delete('/:id', authenticate, authorizeRole('superadmin', 'admin'), eventController.deleteEvent);

module.exports = router;
