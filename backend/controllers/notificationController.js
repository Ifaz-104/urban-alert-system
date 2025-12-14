// backend/controllers/notificationController.js
const Notification = require('../models/Notification');
const User = require('../models/User');

// Get all unread notifications for the current user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ userId })
      .populate('createdByUserId', 'username profilePhoto')
      .populate('reportId', 'title category severity location')
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 notifications

    const unreadCount = await Notification.countDocuments({
      userId,
      read: false,
    });

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message,
    });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadCount = await Notification.countDocuments({
      userId,
      read: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message,
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        read: true,
        readAt: new Date(),
      },
      { new: true }
    );

    if (!notification || notification.userId.toString() !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message,
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { userId, read: false },
      {
        read: true,
        readAt: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message,
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(notificationId);

    if (!notification || notification.userId.toString() !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message,
    });
  }
};

// Create notification (used internally)
exports.createNotification = async (
  userId,
  reportId,
  createdByUserId,
  type,
  title,
  message,
  category,
  severity,
  location
) => {
  try {
    const notification = await Notification.create({
      userId,
      reportId,
      createdByUserId,
      type,
      title,
      message,
      category,
      severity,
      location,
    });

    const populatedNotification = await notification
      .populate('createdByUserId', 'username profilePhoto')
      .populate('reportId', 'title category severity location');

    return populatedNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Broadcast new hazard alert to all users (except creator)
exports.broadcastHazardAlert = async (io, report, creator) => {
  try {
    // Get all users except the creator
    const users = await User.find({ _id: { $ne: report.userId } });

    // Create notifications for all users
    const notificationPromises = users.map((user) => {
      return Notification.create({
        userId: user._id,
        reportId: report._id,
        createdByUserId: report.userId,
        type: 'new_alert',
        title: `🚨 New ${report.category.toUpperCase()} Alert!`,
        message: `${creator.username} reported a ${report.severity} severity ${report.category} at ${report.locationName || report.address}`,
        category: report.category,
        severity: report.severity,
        location: report.locationName || report.address,
      });
    });

    const notifications = await Promise.all(notificationPromises);

    // Emit socket event to all connected clients
    if (io) {
      notifications.forEach((notification) => {
        // Emit to specific user room
        io.to(`user_${notification.userId}`).emit('new_alert', {
          id: notification._id,
          title: notification.title,
          message: notification.message,
          category: notification.category,
          severity: notification.severity,
          location: notification.location,
          createdBy: creator.username,
          createdAt: notification.createdAt,
          reportId: report._id,
        });
      });

      // Also emit to everyone (for map updates)
      io.emit('alert_broadcast', {
        reportId: report._id,
        title: report.title,
        category: report.category,
        severity: report.severity,
        location: report.location,
        locationName: report.locationName,
        createdBy: creator.username,
      });
    }

    console.log(`Alert broadcast to ${notifications.length} users`);
    return notifications;
  } catch (error) {
    console.error('Error broadcasting hazard alert:', error);
    return [];
  }
};
