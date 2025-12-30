// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    phone: String,
    address: String,
    // Location for radius-based alerts (optional)
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
    latitude: {
      type: Number,
      sparse: true
    },
    longitude: {
      type: Number,
      sparse: true
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    points: {
      type: Number,
      default: 0,
    },
    profilePhoto: String,
    // Notification preferences
    notificationSettings: {
      // Category preferences (enable/disable notifications for each category)
      accident: {
        type: Boolean,
        default: true,
      },
      fire: {
        type: Boolean,
        default: true,
      },
      flood: {
        type: Boolean,
        default: true,
      },
      crime: {
        type: Boolean,
        default: true,
      },
      pollution: {
        type: Boolean,
        default: true,
      },
      earthquake: {
        type: Boolean,
        default: true,
      },
      cyclone: {
        type: Boolean,
        default: true,
      },
      other: {
        type: Boolean,
        default: true,
      },
      // Notification method preference
      method: {
        type: String,
        enum: ['push', 'email', 'sms', 'all'],
        default: 'push',
      },
      // Enable/disable all notifications
      enabled: {
        type: Boolean,
        default: true,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Geospatial index for location-based queries
userSchema.index({ location: '2dsphere' });
userSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('User', userSchema);