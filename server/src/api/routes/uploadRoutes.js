// server/src/api/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

const authMiddleware = require('../../middleware/authMiddleware');
const uploadController = require('../controllers/uploadController');

// Store file in memory temporarily
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route   POST /api/upload
// @desc    Upload file to Supabase Storage
// @access  Private
router.post(
  '/',
  authMiddleware,
  upload.single('file'),
  uploadController.uploadFile
);

module.exports = router;
