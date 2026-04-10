const express = require('express');
const router = express.Router();
const scoringController = require('../controllers/scoringController');
const { authenticate, authorizeRole } = require('../middleware/auth');

router.post('/submit', authenticate, authorizeRole('superadmin', 'admin', 'juri'), scoringController.submitScore);

module.exports = router;
