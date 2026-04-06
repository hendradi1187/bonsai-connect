const express = require('express');
const router = express.Router();
const scoringController = require('../controllers/scoringController');

router.post('/submit', scoringController.submitScore);

module.exports = router;
