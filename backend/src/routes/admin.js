const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorizeRole } = require('../middleware/auth');

router.use(authenticate, authorizeRole('superadmin'));

router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);

router.get('/judge-assignments', adminController.getJudgeAssignments);
router.post('/judge-assignments', adminController.createJudgeAssignment);
router.put('/judge-assignments/:id', adminController.updateJudgeAssignment);

router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
