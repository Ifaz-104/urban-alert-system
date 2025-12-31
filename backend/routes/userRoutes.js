// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  getUserReports,
  updateUserProfile,
  getUserActivity,
} = require('../controllers/userProfileController');
const { protect } = require('../middleware/auth');

// All routes require authentication (self or admin check inside controller)
router.get('/:id/profile', protect, getUserProfile);
router.get('/:id/reports', protect, getUserReports);
router.put('/:id/profile', protect, updateUserProfile);
router.get('/:id/activity', protect, getUserActivity);

module.exports = router;


