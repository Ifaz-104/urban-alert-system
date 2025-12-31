// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllReports,
  verifyReport,
  rejectReport,
  sendMassAlert,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect);
router.use(adminOnly);

// Dashboard statistics
router.get('/stats', getDashboardStats);

// Reports management
router.get('/reports', getAllReports);
router.put('/reports/:id/verify', verifyReport);
router.put('/reports/:id/reject', rejectReport);

// Mass alerts
router.post('/alerts', sendMassAlert);

module.exports = router;

