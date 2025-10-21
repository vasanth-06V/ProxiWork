// server/src/api/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const authMiddleware = require('../../middleware/authMiddleware');

// @route   GET /api/projects/:projectId/messages
// @desc    Get all messages for a specific project chat
// @access  Private
router.get('/:projectId/messages', authMiddleware, async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user.id;

    try {
        // Security Check: Verify the user is part of this project (either client or accepted provider)
        const projectCheck = await pool.query(
            `SELECT j.client_id, p.provider_id FROM jobs j
             JOIN proposals p ON j.job_id = p.job_id
             WHERE j.job_id = $1 AND p.status = 'accepted'`,
            [projectId]
        );

        if (projectCheck.rows.length === 0) {
            return res.status(404).json({ msg: 'Project not found or not in progress.' });
        }

        const { client_id, provider_id } = projectCheck.rows[0];
        if (userId !== client_id && userId !== provider_id) {
            return res.status(403).json({ msg: 'Forbidden: You are not part of this project.' });
        }

        // Fetch messages if authorized
        const messages = await pool.query(
            `SELECT m.*, pr.full_name AS sender_name 
             FROM messages m
             JOIN profiles pr ON m.sender_id = pr.user_id
             WHERE m.project_id = $1 
             ORDER BY m.created_at ASC`,
            [projectId]
        );

        res.json(messages.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;