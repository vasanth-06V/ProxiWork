// server/src/api/routes/profileRoutes.js
const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middleware/authMiddleware');
const profileController = require('../controllers/profileController');

// @route   POST /api/profiles
// @desc    Create or update a user profile and return a new token
// @access  Private
router.post('/', authMiddleware, profileController.createOrUpdateProfile);

// @route   GET /api/profiles/me
// @desc    Get the profile for the logged-in user
// @access  Private
router.get('/me', authMiddleware, profileController.getMyProfile);

module.exports = router;
