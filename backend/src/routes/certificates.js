const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/auth');
const certificateController = require('../controllers/certificateController');

router.use(authenticate, authorizeRole('superadmin', 'admin'));

router.get('/', certificateController.list);

module.exports = router;
