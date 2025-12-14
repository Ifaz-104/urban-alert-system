// backend/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // User receiving the notification
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // The report that triggered the notification
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IncidentReport',
      required: true,
    },

    // User who created the report
    createdByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Notification type
    type: {
      type: String,
      enum: ['new_alert', 'comment', 'upvote', 'downvote', 'reply'],
      default: 'new_alert',
    },

    // Notification title/message
    title: {
      type: String,
      required: true,
    },

    // Detailed message
    message: {
      type: String,
      required: true,
    },

    // Alert category
    category: {
      type: String,
      enum: ['accident', 'fire', 'flood', 'crime', 'pollution', 'earthquake', 'cyclone', 'other'],
    },

    // Alert severity
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
    },

    // Location of the alert
    location: {
      type: String,
    },

    // Read status
    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    // When the user read it
    readAt: {
      type: Date,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
      // Auto-delete old notifications after 30 days
      expires: 2592000,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
