// backend/controllers/pointsController.js
const User = require('../models/User');
const PointsTransaction = require('../models/PointsTransaction');
const IncidentReport = require('../models/IncidentReport');

// Badge definitions
const BADGES = {
  BRONZE_REPORTER: { name: 'Bronze Reporter', points: 50 },
  SILVER_REPORTER: { name: 'Silver Reporter', points: 200 },
  GOLD_REPORTER: { name: 'Gold Reporter', points: 500 },
  GUARDIAN: { name: 'Guardian', verifiedReports: 10 },
  HERO: { name: 'Hero', points: 1000 },
};

// Points values for different actions
const POINTS = {
  SUBMIT_REPORT: 10, // Awarded when report is verified
  REPORT_VERIFIED: 20, // Bonus when report gets verified
  VOTE: 2,
  COMMENT: 5,
};

/**
 * Award points to a user and check for badge eligibility
 * @param {String} userId - User ID
 * @param {Number} points - Points to award
 * @param {String} action - Action type (submit_report, report_verified, vote, comment)
 * @param {String} description - Description of the action
 * @param {String} relatedReportId - Related report ID (optional)
 * @returns {Object} - Updated user with new badges if any
 */
async function awardPoints(userId, points, action, description = '', relatedReportId = null) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Award points
    user.points = (user.points || 0) + points;

    // Create transaction log
    await PointsTransaction.create({
      userId,
      action,
      points,
      description,
      relatedReportId,
    });

    // Check and award badges
    const newBadges = await checkAndAwardBadges(user);

    // Save user
    await user.save();

    return {
      user,
      pointsAwarded: points,
      newBadges,
    };
  } catch (error) {
    console.error('Error awarding points:', error);
    throw error;
  }
}

/**
 * Check if user qualifies for any badges and award them
 * @param {Object} user - User document
 * @returns {Array} - Array of newly awarded badge names
 */
async function checkAndAwardBadges(user) {
  const newBadges = [];
  const currentBadges = user.badges || [];

  // Check points-based badges
  if (user.points >= BADGES.BRONZE_REPORTER.points && !currentBadges.includes(BADGES.BRONZE_REPORTER.name)) {
    user.badges.push(BADGES.BRONZE_REPORTER.name);
    newBadges.push(BADGES.BRONZE_REPORTER.name);
  }

  if (user.points >= BADGES.SILVER_REPORTER.points && !currentBadges.includes(BADGES.SILVER_REPORTER.name)) {
    user.badges.push(BADGES.SILVER_REPORTER.name);
    newBadges.push(BADGES.SILVER_REPORTER.name);
  }

  if (user.points >= BADGES.GOLD_REPORTER.points && !currentBadges.includes(BADGES.GOLD_REPORTER.name)) {
    user.badges.push(BADGES.GOLD_REPORTER.name);
    newBadges.push(BADGES.GOLD_REPORTER.name);
  }

  if (user.points >= BADGES.HERO.points && !currentBadges.includes(BADGES.HERO.name)) {
    user.badges.push(BADGES.HERO.name);
    newBadges.push(BADGES.HERO.name);
  }

  // Check Guardian badge (10 verified reports)
  const verifiedReportsCount = await IncidentReport.countDocuments({
    userId: user._id,
    status: 'verified',
  });

  if (verifiedReportsCount >= BADGES.GUARDIAN.verifiedReports && !currentBadges.includes(BADGES.GUARDIAN.name)) {
    user.badges.push(BADGES.GUARDIAN.name);
    newBadges.push(BADGES.GUARDIAN.name);
  }

  return newBadges;
}

// @desc    Award points (internal API)
// @route   POST /api/points/award
// @access  Private
exports.awardPoints = async (req, res) => {
  try {
    const { userId, points, action, description, relatedReportId } = req.body;

    if (!userId || !points || !action) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId, points, and action',
      });
    }

    const result = await awardPoints(userId, points, action, description, relatedReportId);

    res.status(200).json({
      success: true,
      message: 'Points awarded successfully',
      data: {
        pointsAwarded: result.pointsAwarded,
        newBadges: result.newBadges,
        totalPoints: result.user.points,
        badges: result.user.badges,
      },
    });
  } catch (error) {
    console.error('Error in awardPoints:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user points and badges
// @route   GET /api/user/:id/points
// @access  Public
exports.getUserPoints = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('username points badges totalReports');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get verified reports count
    const verifiedReportsCount = await IncidentReport.countDocuments({
      userId: id,
      status: 'verified',
    });

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        username: user.username,
        points: user.points || 0,
        badges: user.badges || [],
        totalReports: user.totalReports || 0,
        verifiedReports: verifiedReportsCount,
      },
    });
  } catch (error) {
    console.error('Error in getUserPoints:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Export helper functions for use in other controllers
exports.awardPointsHelper = awardPoints;
exports.POINTS = POINTS;
exports.BADGES = BADGES;

