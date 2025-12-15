// backend/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadFiles, deleteFile } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

// Upload files - allow up to 5 files at once
router.post('/', protect, upload.array('files', 5), uploadFiles);

// Delete file
router.delete('/:filename', protect, deleteFile);

module.exports = router;
