// server/src/api/routes/complaintRoutes.js
const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middleware/authMiddleware');
const complaintController = require('../controllers/complaintController');

// @route   POST /api/complaints
// @desc    Submit a new complaint
// @access  Private
router.post('/', authMiddleware, complaintController.createComplaint);

module.exports = router;
