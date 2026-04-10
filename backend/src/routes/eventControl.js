const express = require('express');
const router = express.Router();
const eventControlController = require('../controllers/eventControlController');
const { authenticate, authorizeRole } = require('../middleware/auth');

router.get('/status', authenticate, authorizeRole('superadmin', 'admin'), eventControlController.getStatus);
router.post('/update', authenticate, authorizeRole('superadmin', 'admin'), eventControlController.updateStatus);
router.get('/live-status', eventControlController.getLiveStatus);

module.exports = router;
