const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');

router.get('/', queueController.getQueue);
router.post('/reorder', queueController.reorder);

module.exports = router;
