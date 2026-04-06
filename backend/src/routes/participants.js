const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');

router.get('/', participantController.getAll);
router.post('/', participantController.create);
router.get('/lookup', participantController.lookup);
router.post('/check-in', participantController.checkIn);

module.exports = router;
