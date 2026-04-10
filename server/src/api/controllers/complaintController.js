// server/src/api/controllers/complaintController.js
const pool = require('../../config/db');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

// @desc    Submit a new complaint
exports.createComplaint = catchAsync(async (req, res, next) => {
    const { subject, description, evidence_url } = req.body;
    const complainantUserId = req.user.id;

    if (!subject || !description) {
        return next(new AppError('Subject and description are required.', 400));
    }

    const newComplaint = await pool.query(
        `INSERT INTO complaints (complainant_user_id, subject, description, evidence_url)
            VALUES ($1, $2, $3, $4) RETURNING *`,
        [complainantUserId, subject, description, evidence_url || null]
    );

    res.status(201).json({ 
        msg: 'Your complaint has been submitted successfully. We will review it shortly.',
        complaint: newComplaint.rows[0]
    });
});

// @desc    Get all complaints submitted by the logged-in user
exports.getMyComplaints = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const complaints = await pool.query(
        `SELECT complaint_id, subject, description, evidence_url, status, created_at
         FROM complaints
         WHERE complainant_user_id = $1
         ORDER BY created_at DESC`,
        [userId]
    );

    res.json(complaints.rows);
});
