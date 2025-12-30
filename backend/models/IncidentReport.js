// backend/models/IncidentReport.js

const mongoose = require('mongoose');

const incidentReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for the report'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    category: {
      type: String,
      enum: ['accident', 'fire', 'flood', 'crime', 'pollution', 'earthquake', 'cyclone', 'other'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },

    // 📍 Location Fields
    locationName: {
      type: String,
      default: '',
    },

    address: {
      type: String,
      default: '',
    },

    city: {
      type: String,
      default: '',
    },

    // Geospatial location (GeoJSON Point)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        sparse: true
      }
    },

    // Raw coordinates for easy access
    latitude: {
      type: Number,
      sparse: true
    },

    longitude: {
      type: Number,
      sparse: true
    },

    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Status Fields
    status: {
      type: String,
      enum: ['pending', 'verified', 'resolved', 'rejected'],
      default: 'pending',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },

    // Media
    mediaUrls: [String],

    // Comments
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Engagement
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    upvotedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    downvotedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// 🔍 CREATE INDEXES
// Geospatial index for location-based queries
incidentReportSchema.index({ location: '2dsphere' });

// Regular indexes for filtering
incidentReportSchema.index({ latitude: 1, longitude: 1 });
incidentReportSchema.index({ userId: 1 });
incidentReportSchema.index({ createdAt: -1 });
incidentReportSchema.index({ status: 1 });
incidentReportSchema.index({ status: 1, createdAt: -1 }); // Compound index for admin queries

module.exports = mongoose.model('IncidentReport', incidentReportSchema);
