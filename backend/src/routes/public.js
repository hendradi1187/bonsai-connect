const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');

router.post('/register', participantController.registerPublic);

module.exports = router;
