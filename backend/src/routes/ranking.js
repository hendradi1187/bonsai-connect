const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const { authenticate, authorizeRole } = require('../middleware/auth');

router.get('/', authenticate, authorizeRole('superadmin', 'admin', 'juri'), rankingController.getRankings);

module.exports = router;
