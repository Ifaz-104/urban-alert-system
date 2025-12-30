// backend/routes/pointsRoutes.js
const express = require('express');
const router = express.Router();
const { awardPoints, getUserPoints } = require('../controllers/pointsController');
const { protect } = require('../middleware/auth');

// Public route
router.get('/user/:id', getUserPoints);

// Protected route (for internal use)
router.post('/award', protect, awardPoints);

module.exports = router;

