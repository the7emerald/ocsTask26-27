const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.get('/students', authMiddleware, checkRole(['admin']), adminController.getAllStudents);
router.get('/recruiters', authMiddleware, checkRole(['admin']), adminController.getAllRecruiters);
router.get('/student/:userId', authMiddleware, checkRole(['admin']), adminController.getStudentData);
router.get('/recruiter/:userId', authMiddleware, checkRole(['admin']), adminController.getRecruiterData);

module.exports = router;
