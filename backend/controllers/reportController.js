// backend/controllers/reportController.js

// backend/controllers/reportController.js
// ONLY THE createReport FUNCTION - rest stays the same

const IncidentReport = require('../models/IncidentReport');
const User = require('../models/User');

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
      longitude
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
      userId: req.userId,
      status: 'pending',
      isVerified: false,
    });

    // Award points to user
    const user = await User.findById(req.userId);
    user.points += 10; // 10 points for creating a report
    await user.save();

    // Populate user info before returning
    await report.populate('userId', 'username email');

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: report,
      pointsAwarded: 10,
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

    // Award points for commenting
    const user = await User.findById(req.userId);
    if (user) {
      user.points = (user.points || 0) + 2;
      await user.save();
    }

    await report.populate('comments.userId', 'username email firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: report,
      pointsAwarded: 2,
    });

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
