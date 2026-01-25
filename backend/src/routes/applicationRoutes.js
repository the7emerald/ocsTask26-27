const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, checkRole(['student']), applicationController.getUserApplications);
router.post('/', authMiddleware, checkRole(['student']), applicationController.applyForJob);
router.put('/student-status', authMiddleware, checkRole(['student']), applicationController.updateApplicationStatus);
router.put('/recruiter-status', authMiddleware, checkRole(['recruiter']), applicationController.updateRecruiterStatus);

module.exports = router;
