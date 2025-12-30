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
  createCustomContact,
  getCustomContacts,
  updateCustomContact,
  deleteCustomContact,
} = require('../controllers/emergencyContactController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAllContacts);
router.get('/types', getContactTypes);
router.get('/type/:type', getContactsByType);

// Custom contacts routes (User) - Must come before /:id route
router.get('/custom/list', protect, getCustomContacts);
router.post('/custom', protect, createCustomContact);
router.put('/custom/:id', protect, updateCustomContact);
router.delete('/custom/:id', protect, deleteCustomContact);

// Public routes (must come after specific routes)
router.get('/:id', getContact);

// Protected routes (Admin only)
router.post('/', protect, createContact);
router.put('/:id', protect, updateContact);
router.delete('/:id', protect, deleteContact);
router.patch('/:id/deactivate', protect, deactivateContact);

module.exports = router;
