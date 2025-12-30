// backend/controllers/reportController.js

// backend/controllers/reportController.js
// ONLY THE createReport FUNCTION - rest stays the same

const IncidentReport = require('../models/IncidentReport');
const User = require('../models/User');
const { broadcastHazardAlert } = require('./notificationController');
const { awardPointsHelper, POINTS } = require('./pointsController');
const ActivityLog = require('../models/ActivityLog');

// @desc    Create incident report
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      severity,
      address,
      city,
      latitude,
      longitude,
      mediaUrls = [],
    } = req.body;

    // ✅ VALIDATION - only title, description, category required
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and category',
      });
    }

    // Build location object for GeoJSON if coordinates provided
    let locationObject = null;
    if (latitude && longitude) {
      locationObject = {
        type: 'Point',
        coordinates: [longitude, latitude] // GeoJSON format: [lng, lat]
      };
    }

    // Create report with new fields
    const report = await IncidentReport.create({
      title,
      description,
      category,
      severity,
      address: address || '',
      city: city || '',
      latitude: latitude || null,
      longitude: longitude || null,
      location: locationObject, // GeoJSON location
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
      userId: req.userId,
      status: 'pending',
      isVerified: false,
    });

    // Update user's total reports count
    const user = await User.findById(req.userId);
    user.totalReports = (user.totalReports || 0) + 1;
    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: req.userId,
      action: 'create_report',
      details: `Created report: ${title}`,
      relatedReportId: report._id,
    });

    // Note: Points will be awarded when report is verified by admin
    // Points are not awarded immediately on report creation

    // Populate user info before returning
    await report.populate('userId', 'username email');

    // 🚨 Broadcast hazard alert to all users via Socket.io and create notifications
    const io = req.io;
    if (io) {
      await broadcastHazardAlert(io, report, user);
    }

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: report,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Rest of your controller functions stay the same...
// (getAllReports, getSingleReport, updateReport, addComment, etc.)


// @desc Get all incident reports
// @route GET /api/reports
// @access Public
exports.getAllReports = async (req, res) => {
  try {
    const { category, status, severity, sortBy = '-createdAt' } = req.query;

    // Build filter object
    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    if (severity) {
      filter.severity = severity;
    }

    // Get reports with filters and sorting
    const reports = await IncidentReport.find(filter)
      .populate('userId', 'username email firstName lastName points')
      .populate('comments.userId', 'username email firstName lastName')
      .populate('verifiedBy', 'username email firstName lastName')
      .sort(sortBy)
      .lean();

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });

  } catch (error) {
    console.error('Error in getAllReports:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get single incident report
// @route GET /api/reports/:id
// @access Public
exports.getSingleReport = async (req, res) => {
  try {
    const report = await IncidentReport.findById(req.params.id)
      .populate('userId', 'username email firstName lastName points')
      .populate('comments.userId', 'username email firstName lastName')
      .populate('verifiedBy', 'username email firstName lastName');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });

  } catch (error) {
    console.error('Error in getSingleReport:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Update incident report (User can update own reports)
// @route PUT /api/reports/:id
// @access Private
exports.updateReport = async (req, res) => {
  try {
    let report = await IncidentReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    // Check if user is the report creator
    if (report.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report',
      });
    }

    // Update fields
    const updateData = {};

    if (req.body.title) updateData.title = req.body.title;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.severity) updateData.severity = req.body.severity;
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.address) updateData.address = req.body.address;
    if (req.body.city) updateData.city = req.body.city;

    // ✨ Update coordinates if provided
    if (req.body.latitude && req.body.longitude) {
      const lat = parseFloat(req.body.latitude);
      const lng = parseFloat(req.body.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          updateData.latitude = lat;
          updateData.longitude = lng;
          updateData.location = {
            type: 'Point',
            coordinates: [lng, lat]
          };
        }
      }
    }

    report = await IncidentReport.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('userId', 'username email firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: report,
    });

  } catch (error) {
    console.error('Error in updateReport:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Delete incident report
// @route DELETE /api/reports/:id
// @access Private
exports.deleteReport = async (req, res) => {
  try {
    const report = await IncidentReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    // Check if user is the report creator
    if (report.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report',
      });
    }

    await IncidentReport.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
      data: {},
    });

  } catch (error) {
    console.error('Error in deleteReport:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Add comment to report
// @route POST /api/reports/:id/comments
// @access Private
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide comment content',
      });
    }

    const report = await IncidentReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    // Add comment to array
    report.comments.push({
      userId: req.userId,
      content,
    });

    await report.save();

    // Log activity for comment
    await ActivityLog.create({
      userId: req.userId,
      action: 'comment',
      details: `Commented on report: ${report.title}`,
      relatedReportId: report._id,
    });

    // Award points for commenting (5 points)
    try {
      const result = await awardPointsHelper(
        req.userId,
        POINTS.COMMENT,
        'comment',
        `Added comment to report: ${report.title}`,
        report._id
      );

      await report.populate('comments.userId', 'username email firstName lastName');

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: report,
        pointsAwarded: POINTS.COMMENT,
        newBadges: result.newBadges,
      });
    } catch (error) {
      // If points awarding fails, still return success for comment
      await report.populate('comments.userId', 'username email firstName lastName');
      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: report,
      });
    }

  } catch (error) {
    console.error('Error in addComment:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✨ NEW: Get nearby incidents (geospatial query)
// @route GET /api/reports/nearby?lat=X&lng=Y&radius=R
// @access Public
exports.getNearbyIncidents = async (req, res) => {
  try {
    const { lat, lng, radius = 10000 } = req.query; // radius in meters, default 10km

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude',
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates',
      });
    }

    // Geospatial query using GeoJSON
    const reports = await IncidentReport.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: parseInt(radius)
        }
      }
    })
      .populate('userId', 'username email firstName lastName points')
      .populate('comments.userId', 'username email firstName lastName')
      .limit(20);

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });

  } catch (error) {
    console.error('Error in getNearbyIncidents:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Upvote a report
// @route POST /api/reports/:id/upvote
// @access Private
exports.upvoteReport = async (req, res) => {
  try {
    const report = await IncidentReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    const userId = req.userId;

    // Check if user already upvoted
    const alreadyUpvoted = report.upvotedBy.includes(userId);
    const alreadyDownvoted = report.downvotedBy.includes(userId);

    if (alreadyUpvoted) {
      // Remove upvote
      report.upvotedBy = report.upvotedBy.filter(id => id.toString() !== userId);
      report.upvotes = Math.max(0, report.upvotes - 1);
    } else {
      // If previously downvoted, remove downvote first
      if (alreadyDownvoted) {
        report.downvotedBy = report.downvotedBy.filter(id => id.toString() !== userId);
        report.downvotes = Math.max(0, report.downvotes - 1);
      }

      // Add upvote
      report.upvotedBy.push(userId);
      report.upvotes += 1;

      // Log activity for vote
      await ActivityLog.create({
        userId,
        action: 'vote',
        details: `Upvoted report: ${report.title}`,
        relatedReportId: report._id,
      });

      // Award points for voting (only if adding vote, not removing)
      try {
        await awardPointsHelper(
          userId,
          POINTS.VOTE,
          'vote',
          `Upvoted report: ${report.title}`,
          report._id
        );
      } catch (error) {
        console.error('Error awarding points for vote:', error);
        // Continue even if points awarding fails
      }
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: alreadyUpvoted ? 'Upvote removed' : 'Report upvoted',
      data: {
        upvotes: report.upvotes,
        downvotes: report.downvotes,
        userVote: alreadyUpvoted ? null : 'upvote',
      },
    });

  } catch (error) {
    console.error('Error in upvoteReport:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Downvote a report
// @route POST /api/reports/:id/downvote
// @access Private
exports.downvoteReport = async (req, res) => {
  try {
    const report = await IncidentReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    const userId = req.userId;

    // Check if user already downvoted
    const alreadyDownvoted = report.downvotedBy.includes(userId);
    const alreadyUpvoted = report.upvotedBy.includes(userId);

    if (alreadyDownvoted) {
      // Remove downvote
      report.downvotedBy = report.downvotedBy.filter(id => id.toString() !== userId);
      report.downvotes = Math.max(0, report.downvotes - 1);
    } else {
      // If previously upvoted, remove upvote first
      if (alreadyUpvoted) {
        report.upvotedBy = report.upvotedBy.filter(id => id.toString() !== userId);
        report.upvotes = Math.max(0, report.upvotes - 1);
      }

      // Add downvote
      report.downvotedBy.push(userId);
      report.downvotes += 1;

      // Log activity for vote
      await ActivityLog.create({
        userId,
        action: 'vote',
        details: `Downvoted report: ${report.title}`,
        relatedReportId: report._id,
      });

      // Award points for voting (only if adding vote, not removing)
      try {
        await awardPointsHelper(
          userId,
          POINTS.VOTE,
          'vote',
          `Downvoted report: ${report.title}`,
          report._id
        );
      } catch (error) {
        console.error('Error awarding points for vote:', error);
        // Continue even if points awarding fails
      }
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: alreadyDownvoted ? 'Downvote removed' : 'Report downvoted',
      data: {
        upvotes: report.upvotes,
        downvotes: report.downvotes,
        userVote: alreadyDownvoted ? null : 'downvote',
      },
    });

  } catch (error) {
    console.error('Error in downvoteReport:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
