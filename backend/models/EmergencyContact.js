// backend/models/EmergencyContact.js
const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema(
  {
    // Contact name
    name: {
      type: String,
      required: [true, 'Please provide a contact name'],
      trim: true,
    },

    // Service type
    type: {
      type: String,
      enum: ['police', 'fire', 'medical', 'disaster', 'custom'],
      required: true,
    },

    // Phone number(s)
    phone: {
      type: [String],
      required: [true, 'Please provide at least one phone number'],
    },

    // Alternative contact number
    alternatePhone: String,

    // Email
    email: String,

    // Website/URL
    website: String,

    // Description
    description: String,

    // Icon/emoji for display
    icon: {
      type: String,
      default: '📞',
    },

    // Priority (0 = highest)
    priority: {
      type: Number,
      default: 999,
    },

    // Active/Inactive
    isActive: {
      type: Boolean,
      default: true,
    },

    // City/Region (optional - for location-based filtering)
    city: String,
    region: String,
    country: {
      type: String,
      default: 'Global',
    },

    // User ID for custom contacts (family, friends)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null means it's a system-wide contact
    },

    // Contact hours (optional)
    available24x7: {
      type: Boolean,
      default: true,
    },

    operatingHours: {
      open: String, // "09:00"
      close: String, // "17:00"
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
emergencyContactSchema.index({ type: 1, isActive: 1, priority: 1 });
emergencyContactSchema.index({ city: 1, country: 1 });
emergencyContactSchema.index({ userId: 1, type: 1 }); // For user-specific custom contacts

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
