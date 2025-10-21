// server/src/api/routes/complaintRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const authMiddleware = require('../../middleware/authMiddleware');

// @route   POST /api/complaints
// @desc    Submit a new complaint
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    const { subject, description, evidence_url } = req.body;
    const complainantUserId = req.user.id; // Get the user ID from their token

    // Validate required fields
    if (!subject || !description) {
        return res.status(400).json({ msg: 'Subject and description are required.' });
    }

    try {
        const newComplaint = await pool.query(
            `INSERT INTO complaints (complainant_user_id, subject, description, evidence_url)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [complainantUserId, subject, description, evidence_url]
        );

        res.status(201).json({ 
            msg: 'Your complaint has been submitted successfully. We will review it shortly.',
            complaint: newComplaint.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;