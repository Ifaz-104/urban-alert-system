// backend/controllers/emergencyContactController.js
const EmergencyContact = require('../models/EmergencyContact');

// @desc    Get all emergency contacts
// @route   GET /api/emergency-contacts
// @access  Public
exports.getAllContacts = async (req, res) => {
  try {
    const { type, city, country } = req.query;
    const userId = req.userId; // May be undefined if not authenticated

    // Build filter - get system contacts and user's custom contacts
    let filter = { isActive: true };

    if (type) {
      filter.type = type;
    }

    if (city) {
      filter.city = city;
    }

    if (country) {
      filter.country = country;
    }

    // If user is authenticated, include their custom contacts
    if (userId) {
      filter.$or = [
        { userId: null }, // System contacts
        { userId: userId }, // User's custom contacts
      ];
    } else {
      // Only system contacts for unauthenticated users
      filter.userId = null;
    }

    const contacts = await EmergencyContact.find(filter)
      .sort({ priority: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching emergency contacts',
      error: error.message,
    });
  }
};

// @desc    Get emergency contacts by type
// @route   GET /api/emergency-contacts/type/:type
// @access  Public
exports.getContactsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { country, city } = req.query;

    let filter = {
      type,
      isActive: true,
    };

    if (country) {
      filter.country = country;
    }

    if (city) {
      filter.city = city;
    }

    const contacts = await EmergencyContact.find(filter)
      .sort({ priority: 1, createdAt: -1 });

    if (contacts.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No emergency contacts found for type: ${type}`,
      });
    }

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching emergency contacts',
      error: error.message,
    });
  }
};

// @desc    Get all available contact types
// @route   GET /api/emergency-contacts/types
// @access  Public
exports.getContactTypes = async (req, res) => {
  try {
    const types = ['police', 'fire', 'medical', 'disaster', 'custom'];

    const contactsByType = {};

    for (const type of types) {
      const count = await EmergencyContact.countDocuments({
        type,
        isActive: true,
      });
      contactsByType[type] = count;
    }

    res.status(200).json({
      success: true,
      data: contactsByType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contact types',
      error: error.message,
    });
  }
};

// @desc    Get single emergency contact
// @route   GET /api/emergency-contacts/:id
// @access  Public
exports.getContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await EmergencyContact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found',
      });
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching emergency contact',
      error: error.message,
    });
  }
};

// @desc    Create emergency contact (Admin only)
// @route   POST /api/emergency-contacts
// @access  Private/Admin
exports.createContact = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create contacts',
      });
    }

    const contact = await EmergencyContact.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Emergency contact created successfully',
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating emergency contact',
      error: error.message,
    });
  }
};

// @desc    Update emergency contact (Admin only)
// @route   PUT /api/emergency-contacts/:id
// @access  Private/Admin
exports.updateContact = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update contacts',
      });
    }

    const { id } = req.params;
    const contact = await EmergencyContact.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Emergency contact updated successfully',
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating emergency contact',
      error: error.message,
    });
  }
};

// @desc    Delete emergency contact (Admin only)
// @route   DELETE /api/emergency-contacts/:id
// @access  Private/Admin
exports.deleteContact = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete contacts',
      });
    }

    const { id } = req.params;
    const contact = await EmergencyContact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Emergency contact deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting emergency contact',
      error: error.message,
    });
  }
};

// @desc    Deactivate emergency contact (Admin only)
// @route   PATCH /api/emergency-contacts/:id/deactivate
// @access  Private/Admin
exports.deactivateContact = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to deactivate contacts',
      });
    }

    const { id } = req.params;
    const contact = await EmergencyContact.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Emergency contact deactivated successfully',
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating emergency contact',
      error: error.message,
    });
  }
};

// @desc    Create custom emergency contact (User)
// @route   POST /api/emergency-contacts/custom
// @access  Private
exports.createCustomContact = async (req, res) => {
  try {
    const { name, phone, icon, type } = req.body;

    // Validation
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and phone number',
      });
    }

    // Create custom contact for the user
    const contact = await EmergencyContact.create({
      name,
      phone: Array.isArray(phone) ? phone : [phone],
      icon: icon || '📞',
      type: type || 'custom',
      userId: req.userId, // Associate with user
      priority: 999, // Lower priority than system contacts
      isActive: true,
      available24x7: true,
    });

    res.status(201).json({
      success: true,
      message: 'Custom emergency contact created successfully',
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating custom emergency contact',
      error: error.message,
    });
  }
};

// @desc    Get user's custom emergency contacts
// @route   GET /api/emergency-contacts/custom
// @access  Private
exports.getCustomContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({
      userId: req.userId,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching custom emergency contacts',
      error: error.message,
    });
  }
};

// @desc    Update custom emergency contact (User)
// @route   PUT /api/emergency-contacts/custom/:id
// @access  Private
exports.updateCustomContact = async (req, res) => {
  try {
    const { id } = req.params;

    // Find contact and verify ownership
    const contact = await EmergencyContact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found',
      });
    }

    // Check if user owns this contact
    if (contact.userId && contact.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this contact',
      });
    }

    // Update contact
    const updatedContact = await EmergencyContact.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Custom emergency contact updated successfully',
      data: updatedContact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating custom emergency contact',
      error: error.message,
    });
  }
};

// @desc    Delete custom emergency contact (User)
// @route   DELETE /api/emergency-contacts/custom/:id
// @access  Private
exports.deleteCustomContact = async (req, res) => {
  try {
    const { id } = req.params;

    // Find contact and verify ownership
    const contact = await EmergencyContact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found',
      });
    }

    // Check if user owns this contact
    if (contact.userId && contact.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this contact',
      });
    }

    await EmergencyContact.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Custom emergency contact deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting custom emergency contact',
      error: error.message,
    });
  }
};
