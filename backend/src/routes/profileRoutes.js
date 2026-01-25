const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.get('/all', authMiddleware, checkRole(['student']), profileController.getAllProfiles);
router.post('/', authMiddleware, checkRole(['student']), profileController.getProfilesByCodes);
router.get('/recruiter-data', authMiddleware, checkRole(['recruiter']), profileController.getRecruiterData);
router.post('/create-profile', authMiddleware, checkRole(['recruiter']), profileController.createProfile);
router.delete('/delete-profile', authMiddleware, checkRole(['recruiter']), profileController.deleteProfile);

module.exports = router;
