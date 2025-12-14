// backend/routes/emergencyContactRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllContacts,
  getContactsByType,
  getContactTypes,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  deactivateContact,
} = require('../controllers/emergencyContactController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAllContacts);
router.get('/types', getContactTypes);
router.get('/type/:type', getContactsByType);
router.get('/:id', getContact);

// Protected routes (Admin only)
router.post('/', protect, createContact);
router.put('/:id', protect, updateContact);
router.delete('/:id', protect, deleteContact);
router.patch('/:id/deactivate', protect, deactivateContact);

module.exports = router;
