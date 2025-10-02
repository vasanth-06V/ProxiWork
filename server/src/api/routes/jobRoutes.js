// server/src/api/routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const authMiddleware = require('../../middleware/authMiddleware');

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private (Clients only)
router.post('/', authMiddleware, async (req, res) => {
    // First, check the user's role. This is our Authorization step.
    if (req.user.role !== 'client') {
        return res.status(403).json({ msg: 'Forbidden: Only clients can post jobs' });
    }

    const { title, description, budget } = req.body;
    const clientId = req.user.id;

    // Validate input
    if (!title || !description) {
        return res.status(400).json({ msg: 'Please provide a title and description' });
    }

    try {
        const newJob = await pool.query(
            'INSERT INTO jobs (client_id, title, description, budget) VALUES ($1, $2, $3, $4) RETURNING *',
            [clientId, title, description, budget]
        );

        res.status(201).json(newJob.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;