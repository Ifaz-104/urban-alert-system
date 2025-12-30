// backend/routes/userPreferencesRoutes.js
const express = require('express');
const router = express.Router();
const { getPreferences, updatePreferences } = require('../controllers/userPreferencesController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.get('/', protect, getPreferences);
router.put('/', protect, updatePreferences);

module.exports = router;

