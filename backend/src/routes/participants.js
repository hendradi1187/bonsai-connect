const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');
const { authenticate, authorizeRole } = require('../middleware/auth');

router.get('/lookup', participantController.lookup);
router.get('/', authenticate, authorizeRole('superadmin', 'admin'), participantController.getAll);
router.post('/', authenticate, authorizeRole('superadmin', 'admin'), participantController.create);
router.post('/check-in', authenticate, authorizeRole('superadmin', 'admin'), participantController.checkIn);
router.put('/:id/judging-number', authenticate, authorizeRole('superadmin'), participantController.overrideJudgingNumber);

module.exports = router;
