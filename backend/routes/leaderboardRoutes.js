// backend/routes/leaderboardRoutes.js
const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/leaderboardController');

// Public routes
router.get('/', getLeaderboard);

module.exports = router;

