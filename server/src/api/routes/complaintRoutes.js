// server/src/api/routes/complaintRoutes.js
const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middleware/authMiddleware');
const complaintController = require('../controllers/complaintController');
const validate = require('../../middleware/validateMiddleware');
const { createComplaintSchema } = require('../../validators/complaintValidator');

// @route   POST /api/complaints
// @desc    Submit a new complaint
// @access  Private
router.post('/', authMiddleware, validate(createComplaintSchema), complaintController.createComplaint);

// @route   GET /api/complaints/my-complaints
// @desc    Get all complaints submitted by the logged-in user
// @access  Private
router.get('/my-complaints', authMiddleware, complaintController.getMyComplaints);

module.exports = router;
