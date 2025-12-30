// backend/controllers/leaderboardController.js
const User = require('../models/User');
const PointsTransaction = require('../models/PointsTransaction');

// @desc    Get leaderboard
// @route   GET /api/leaderboard?period=week
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    const { period = 'all-time', limit = 20 } = req.query;
    const limitNum = parseInt(limit) || 20;

    let startDate = null;

    // Calculate start date based on period
    if (period === 'week') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    }
    // 'all-time' doesn't need a start date

    let leaderboard;

    if (period === 'all-time') {
      // Get top users by total points
      leaderboard = await User.find({ role: 'user' })
        .select('username points badges totalReports profilePhoto')
        .sort({ points: -1 })
        .limit(limitNum)
        .lean();
    } else {
      // For week/month, calculate points earned in that period
      const usersWithPeriodPoints = await PointsTransaction.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$userId',
            periodPoints: { $sum: '$points' },
          },
        },
      ]);

      // Get user details and merge with period points
      const userIds = usersWithPeriodPoints.map((u) => u._id);
      const users = await User.find({ _id: { $in: userIds }, role: 'user' })
        .select('username points badges totalReports profilePhoto')
        .lean();

      // Merge period points with user data
      const usersMap = new Map();
      users.forEach((user) => {
        usersMap.set(user._id.toString(), {
          ...user,
          periodPoints: 0,
        });
      });

      usersWithPeriodPoints.forEach((item) => {
        const userId = item._id.toString();
        if (usersMap.has(userId)) {
          usersMap.get(userId).periodPoints = item.periodPoints;
        }
      });

      // Sort by period points and limit
      leaderboard = Array.from(usersMap.values())
        .sort((a, b) => b.periodPoints - a.periodPoints)
        .slice(0, limitNum);
    }

    // Add rank to each user
    const leaderboardWithRank = leaderboard.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      username: user.username,
      points: period === 'all-time' ? user.points : user.periodPoints || 0,
      totalPoints: user.points || 0,
      badges: user.badges || [],
      totalReports: user.totalReports || 0,
      profilePhoto: user.profilePhoto,
    }));

    res.status(200).json({
      success: true,
      period,
      count: leaderboardWithRank.length,
      data: leaderboardWithRank,
    });
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

