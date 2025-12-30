// backend/controllers/userPreferencesController.js
const User = require('../models/User');

// @desc    Get user notification preferences
// @route   GET /api/user/preferences
// @access  Private
exports.getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('notificationSettings');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user.notificationSettings || {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching preferences',
      error: error.message,
    });
  }
};

// @desc    Update user notification preferences
// @route   PUT /api/user/preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
  try {
    const { notificationSettings } = req.body;

    // Validate notification method if provided
    if (notificationSettings?.method) {
      const validMethods = ['push', 'email', 'sms', 'all'];
      if (!validMethods.includes(notificationSettings.method)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid notification method. Must be one of: push, email, sms, all',
        });
      }
    }

    // Validate category preferences if provided
    const validCategories = ['accident', 'fire', 'flood', 'crime', 'pollution', 'earthquake', 'cyclone', 'other'];
    if (notificationSettings) {
      for (const key in notificationSettings) {
        if (key !== 'method' && key !== 'enabled' && !validCategories.includes(key)) {
          return res.status(400).json({
            success: false,
            message: `Invalid category: ${key}. Valid categories are: ${validCategories.join(', ')}`,
          });
        }
      }
    }

    // Update user preferences
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          notificationSettings: notificationSettings || {},
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select('notificationSettings');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.notificationSettings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: error.message,
    });
  }
};

