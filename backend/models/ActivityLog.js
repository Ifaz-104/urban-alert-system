// backend/models/ActivityLog.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'create_report',
        'comment',
        'vote',
        'verify_report',
        'profile_update',
      ],
    },
    details: {
      type: String,
      default: '',
    },
    relatedReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IncidentReport',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);


