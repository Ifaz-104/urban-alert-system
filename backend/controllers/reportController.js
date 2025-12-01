// backend/controllers/reportController.js
const IncidentReport = require('../models/IncidentReport');
const User = require('../models/User');

// @desc    Create incident report
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res) => {
  try {
    const { title, description, category, severity, location, latitude, longitude } = req.body;

    // Validation
    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Create report
    const report = await IncidentReport.create({
      title,
      description,
      category,
      severity,
      location,
      latitude,
      longitude,
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

// @desc    Get all incident reports
// @route   GET /api/reports
// @access  Public
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
      .populate('userId', 'username email points')
      .populate('comments.userId', 'username email')
      .sort(sortBy)
      .lean();

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single incident report
// @route   GET /api/reports/:id
// @access  Public
exports.getSingleReport = async (req, res) => {
  try {
    const report = await IncidentReport.findById(req.params.id)
      .populate('userId', 'username email points')
      .populate('comments.userId', 'username email')
      .populate('verifiedBy', 'username email');

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
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update incident report (User can update own reports)
// @route   PUT /api/reports/:id
// @access  Private
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

    report = await IncidentReport.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('userId', 'username email');

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
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

// @desc    Add comment to report
// @route   POST /api/reports/:id/comments
// @access  Private
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

    report.comments.push({
      userId: req.userId,
      content,
    });

    await report.save();

    // Award points for commenting
    const user = await User.findById(req.userId);
    user.points += 2;
    await user.save();

    await report.populate('comments.userId', 'username email');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: report,
      pointsAwarded: 2,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};