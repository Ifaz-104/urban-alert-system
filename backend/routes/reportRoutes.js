// backend/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const {
  createReport,
  getAllReports,
  getSingleReport,
  updateReport,
  addComment,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAllReports);
router.get('/:id', getSingleReport);

// Protected routes
router.post('/', protect, createReport);
router.put('/:id', protect, updateReport);
router.post('/:id/comments', protect, addComment);

module.exports = router;