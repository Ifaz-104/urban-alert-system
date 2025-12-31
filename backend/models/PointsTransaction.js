// backend/models/PointsTransaction.js
const mongoose = require('mongoose');

const pointsTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['submit_report', 'report_verified', 'vote', 'comment', 'bonus'],
    },
    points: {
      type: Number,
      required: true,
    },
    description: {
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

// Index for efficient queries
pointsTransactionSchema.index({ userId: 1, timestamp: -1 });
pointsTransactionSchema.index({ timestamp: -1 });

module.exports = mongoose.model('PointsTransaction', pointsTransactionSchema);

