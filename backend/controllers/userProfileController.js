// backend/controllers/userProfileController.js
const mongoose = require('mongoose');
const User = require('../models/User');
const IncidentReport = require('../models/IncidentReport');
const PointsTransaction = require('../models/PointsTransaction');
const ActivityLog = require('../models/ActivityLog');

// Helper to check if requester can access this user's data
const canAccessUser = (req, userId) => {
  if (!req.user) return false;
  if (req.user.role === 'admin') return true;
  return req.userId.toString() === userId.toString();
};

// @desc    Get user profile with statistics
// @route   GET /api/user/:id/profile
// @access  Private (self or admin)
exports.getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!canAccessUser(req, id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this profile',
      });
    }

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(id);

    // Total reports submitted
    const totalReports = await IncidentReport.countDocuments({ userId: userObjectId });

    // Reports by category
    const categoryAgg = await IncidentReport.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const reportsByCategory = {};
    categoryAgg.forEach((item) => {
      reportsByCategory[item._id] = item.count;
    });

    // Reports by month (last 12 months)
    const now = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(now.getMonth() - 11);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAgg = await IncidentReport.aggregate([
      {
        $match: {
          userId: userObjectId,
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]);

    const reportsByMonth = monthlyAgg.map((item) => {
      const { year, month } = item._id;
      return {
        year,
        month,
        count: item.count,
      };
    });

    // Recent activity (last 10 actions)
    const recentActivity = await ActivityLog.find({ userId: userObjectId })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          bio: user.bio || '',
          profilePhoto: user.profilePhoto || '',
          joinDate: user.joinDate || user.createdAt,
          points: user.points || 0,
          badges: user.badges || [],
          totalReports: totalReports,
          role: user.role,
        },
        stats: {
          totalReports,
          totalPoints: user.points || 0,
          badges: user.badges || [],
          reportsByCategory,
          reportsByMonth,
        },
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user's submitted reports
// @route   GET /api/user/:id/reports
// @access  Private (self or admin)
exports.getUserReports = async (req, res) => {
  try {
    const { id } = req.params;

    if (!canAccessUser(req, id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these reports',
      });
    }

    const reports = await IncidentReport.find({ userId: id })
      .sort({ createdAt: -1 })
      .select('title category severity status city createdAt')
      .lean();

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error('Error in getUserReports:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile (name, bio, photo)
// @route   PUT /api/user/:id/profile
// @access  Private (self or admin)
exports.updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!canAccessUser(req, id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile',
      });
    }

    const allowedFields = ['username', 'bio', 'profilePhoto'];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (typeof req.body[field] !== 'undefined') {
        updateData[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Log activity
    await ActivityLog.create({
      userId: user._id,
      action: 'profile_update',
      details: 'Updated profile information',
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio || '',
        profilePhoto: user.profilePhoto || '',
        joinDate: user.joinDate || user.createdAt,
        points: user.points || 0,
        badges: user.badges || [],
        totalReports: user.totalReports || 0,
      },
    });
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user activity timeline
// @route   GET /api/user/:id/activity
// @access  Private (self or admin)
exports.getUserActivity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!canAccessUser(req, id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this activity',
      });
    }

    const activities = await ActivityLog.find({ userId: id })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    console.error('Error in getUserActivity:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


