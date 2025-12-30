// backend/controllers/adminController.js
const IncidentReport = require('../models/IncidentReport');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { broadcastHazardAlert } = require('./notificationController');
const { awardPointsHelper, POINTS } = require('./pointsController');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total reports today
    const totalReportsToday = await IncidentReport.countDocuments({
      createdAt: { $gte: today },
    });

    // Pending verifications
    const pendingVerifications = await IncidentReport.countDocuments({
      status: 'pending',
    });

    // Verified hazards
    const verifiedHazards = await IncidentReport.countDocuments({
      status: 'verified',
    });

    // Active users (users who have created reports in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Total users
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Reports by status
    const reportsByStatus = {
      pending: await IncidentReport.countDocuments({ status: 'pending' }),
      verified: await IncidentReport.countDocuments({ status: 'verified' }),
      rejected: await IncidentReport.countDocuments({ status: 'rejected' }),
      resolved: await IncidentReport.countDocuments({ status: 'resolved' }),
    };

    // Reports by category
    const reportsByCategory = {};
    const categories = ['accident', 'fire', 'flood', 'crime', 'pollution', 'earthquake', 'cyclone', 'other'];
    for (const category of categories) {
      reportsByCategory[category] = await IncidentReport.countDocuments({ category });
    }

    res.status(200).json({
      success: true,
      data: {
        totalReportsToday,
        pendingVerifications,
        verifiedHazards,
        activeUsers,
        totalUsers,
        reportsByStatus,
        reportsByCategory,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message,
    });
  }
};

// @desc    Get all reports (admin view)
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getAllReports = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }
    if (category) {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await IncidentReport.find(query)
      .populate('userId', 'username email profilePhoto')
      .populate('verifiedBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await IncidentReport.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reports.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message,
    });
  }
};

// @desc    Verify a report
// @route   PUT /api/admin/reports/:id/verify
// @access  Private/Admin
exports.verifyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.userId;

    const report = await IncidentReport.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    if (report.status === 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Report is already verified',
      });
    }

    report.status = 'verified';
    report.isVerified = true;
    report.verifiedBy = adminId;
    report.verifiedAt = new Date();

    await report.save();

    // Log activity for admin verifying report
    await ActivityLog.create({
      userId: adminId,
      action: 'verify_report',
      details: `Verified report: ${report.title}`,
      relatedReportId: report._id,
    });

    // Award points to the report creator
    // +10 points for submitting report (when verified)
    // +20 bonus points for verification
    let pointsResult = null;
    try {
      // Award submit_report points (10)
      const submitResult = await awardPointsHelper(
        report.userId,
        POINTS.SUBMIT_REPORT,
        'submit_report',
        `Report verified: ${report.title}`,
        report._id
      );

      // Award verification bonus points (20)
      pointsResult = await awardPointsHelper(
        report.userId,
        POINTS.REPORT_VERIFIED,
        'report_verified',
        `Bonus for verified report: ${report.title}`,
        report._id
      );

      // Combine new badges from both awards
      const allNewBadges = [...(submitResult.newBadges || []), ...(pointsResult.newBadges || [])];
      pointsResult.newBadges = [...new Set(allNewBadges)]; // Remove duplicates
    } catch (error) {
      console.error('Error awarding points for verified report:', error);
      // Continue even if points awarding fails
    }

    // Populate before returning
    await report.populate('userId', 'username email');
    await report.populate('verifiedBy', 'username');

    res.status(200).json({
      success: true,
      message: 'Report verified successfully',
      data: report,
      pointsAwarded: pointsResult ? POINTS.SUBMIT_REPORT + POINTS.REPORT_VERIFIED : null,
      newBadges: pointsResult ? pointsResult.newBadges : [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying report',
      error: error.message,
    });
  }
};

// @desc    Reject a report
// @route   PUT /api/admin/reports/:id/reject
// @access  Private/Admin
exports.rejectReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.userId;

    const report = await IncidentReport.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    if (report.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Report is already rejected',
      });
    }

    report.status = 'rejected';
    report.isVerified = false;
    report.verifiedBy = adminId;
    report.verifiedAt = new Date();

    // Store rejection reason in description or add a new field
    if (reason) {
      report.rejectionReason = reason;
    }

    await report.save();

    // Populate before returning
    await report.populate('userId', 'username email');
    await report.populate('verifiedBy', 'username');

    res.status(200).json({
      success: true,
      message: 'Report rejected successfully',
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting report',
      error: error.message,
    });
  }
};

// @desc    Send mass alert to users in radius
// @route   POST /api/admin/alerts
// @access  Private/Admin
exports.sendMassAlert = async (req, res) => {
  try {
    const { reportId, radius = 10000, message } = req.body; // radius in meters, default 10km
    const io = req.io;

    if (!reportId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reportId',
      });
    }

    const report = await IncidentReport.findById(reportId)
      .populate('userId', 'username');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    if (!report.latitude || !report.longitude || !report.location) {
      return res.status(400).json({
        success: false,
        message: 'Report does not have location data',
      });
    }

    // Find users within radius who have location data
    const usersInRadius = await User.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: report.location.coordinates, // [longitude, latitude]
          },
          $maxDistance: parseInt(radius),
        },
      },
      role: 'user', // Only regular users, not admins
    });

    // Filter users based on their notification preferences
    const usersToNotify = usersInRadius.filter((user) => {
      const prefs = user.notificationSettings || {};
      
      // Check if notifications are enabled
      if (prefs.enabled === false) {
        return false;
      }

      // Check if user wants notifications for this category
      const categoryEnabled = prefs[report.category] !== false; // Default to true if not set
      
      return categoryEnabled;
    });

    // Create notifications for users in radius
    const alertMessage = message || `🚨 Admin Alert: ${report.category.toUpperCase()} hazard verified at ${report.locationName || report.address}`;

    const notificationPromises = usersToNotify.map((user) => {
      return Notification.create({
        userId: user._id,
        reportId: report._id,
        createdByUserId: req.userId, // Admin who sent the alert
        type: 'new_alert',
        title: `🚨 Verified ${report.category.toUpperCase()} Alert`,
        message: alertMessage,
        category: report.category,
        severity: report.severity,
        location: report.locationName || report.address,
      });
    });

    const notifications = await Promise.all(notificationPromises);

    // Emit socket events to users
    if (io) {
      notifications.forEach((notification) => {
        io.to(`user_${notification.userId}`).emit('new_alert', {
          id: notification._id,
          title: notification.title,
          message: notification.message,
          category: notification.category,
          severity: notification.severity,
          location: notification.location,
          createdBy: 'Admin',
          createdAt: notification.createdAt,
          reportId: report._id,
        });
      });
    }

    res.status(200).json({
      success: true,
      message: `Alert sent to ${notifications.length} users within ${radius / 1000}km radius`,
      data: {
        reportId: report._id,
        usersNotified: notifications.length,
        totalUsersInRadius: usersInRadius.length,
        radius: radius / 1000, // Convert to km
      },
    });
  } catch (error) {
    console.error('Error sending mass alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending mass alert',
      error: error.message,
    });
  }
};

