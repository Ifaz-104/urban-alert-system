// backend/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const {
  createReport,
  getAllReports,
  getSingleReport,
  updateReport,
  deleteReport,
  addComment,
  upvoteReport,
  downvoteReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAllReports);
router.get('/:id', getSingleReport);

// Protected routes
router.post('/', protect, createReport);
router.put('/:id', protect, updateReport);
router.delete('/:id', protect, deleteReport);
router.post('/:id/comments', protect, addComment);
router.post('/:id/upvote', protect, upvoteReport);
router.post('/:id/downvote', protect, downvoteReport);

module.exports = router;