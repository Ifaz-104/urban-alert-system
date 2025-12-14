// backend/controllers/emergencyContactController.js
const EmergencyContact = require('../models/EmergencyContact');

// @desc    Get all emergency contacts
// @route   GET /api/emergency-contacts
// @access  Public
exports.getAllContacts = async (req, res) => {
  try {
    const { type, city, country } = req.query;

    // Build filter
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
