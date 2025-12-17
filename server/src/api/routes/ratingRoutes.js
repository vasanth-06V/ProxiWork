// server/src/api/routes/ratingRoutes.js
const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middleware/authMiddleware');
const ratingController = require('../controllers/ratingController');

// @route   POST /api/ratings/job/:jobId
// @desc    Client submits a rating for a completed job
// @access  Private (Job owner only)
router.post(
  '/job/:jobId',
  authMiddleware,
  ratingController.submitRating
);

module.exports = router;
