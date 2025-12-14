// backend/controllers/uploadController.js
const fs = require('fs');
const path = require('path');

// @desc    Upload files (images/videos)
// @route   POST /api/upload
// @access  Private
exports.uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    // Get file URLs (relative paths that can be served)
    const fileUrls = req.files.map((file) => {
      return `/uploads/${file.filename}`;
    });

    res.status(200).json({
      success: true,
      message: `${req.files.length} file(s) uploaded successfully`,
      data: {
        files: fileUrls,
        count: req.files.length,
      },
    });
  } catch (error) {
    console.error('Error in uploadFiles:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:filename
// @access  Private
exports.deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;

    // Validate filename to prevent directory traversal attacks
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename',
      });
    }

    const filePath = path.join(__dirname, '../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteFile:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
