const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const { authenticate, authorizeRole } = require('../middleware/auth');

router.get('/', authenticate, authorizeRole('superadmin', 'admin', 'juri'), queueController.getQueue);
router.post('/reorder', authenticate, authorizeRole('superadmin', 'admin'), queueController.reorder);

module.exports = router;
