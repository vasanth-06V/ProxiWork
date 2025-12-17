// server/src/api/controllers/complaintController.js
const pool = require('../../config/db');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

exports.createComplaint = catchAsync(async (req, res, next) => {
    const { subject, description, evidence_url } = req.body;
    const complainantUserId = req.user.id;

    if (!subject || !description) {
        return next(new AppError('Subject and description are required.', 400));
    }

    const newComplaint = await pool.query(
        `INSERT INTO complaints (complainant_user_id, subject, description, evidence_url)
            VALUES ($1, $2, $3, $4) RETURNING *`,
        [complainantUserId, subject, description, evidence_url]
    );

    res.status(201).json({ 
        msg: 'Your complaint has been submitted successfully. We will review it shortly.',
        complaint: newComplaint.rows[0]
    });
});