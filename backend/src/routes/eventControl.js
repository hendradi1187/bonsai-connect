const express = require('express');
const router = express.Router();
const eventControlController = require('../controllers/eventControlController');

router.get('/status', eventControlController.getStatus);
router.post('/update', eventControlController.updateStatus);
router.get('/live-status', eventControlController.getLiveStatus);

module.exports = router;
