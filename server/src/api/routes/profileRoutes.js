// server/src/api/routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const authMiddleware = require('../../middleware/authMiddleware'); // Import our gatekeeper

// @route   POST /api/profiles
// @desc    Create or update a user profile
// @access  Private (notice the authMiddleware here)
router.post('/', authMiddleware, async (req, res) => {
    // Destructure the profile fields from the request body
    const { fullName, tagline, bio, skills } = req.body;

    // The user's ID is available from the token via our middleware
    const userId = req.user.id;

    try {
        // We use a special SQL query called an "UPSERT".
        // It will INSERT a new profile if one doesn't exist for the user_id.
        // If one DOES exist, it will UPDATE it instead.
        const upsertQuery = `
            INSERT INTO profiles (user_id, full_name, tagline, bio, skills, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            ON CONFLICT (user_id)
            DO UPDATE SET
                full_name = EXCLUDED.full_name,
                tagline = EXCLUDED.tagline,
                bio = EXCLUDED.bio,
                skills = EXCLUDED.skills,
                updated_at = NOW()
            RETURNING *;
        `;

        const values = [userId, fullName, tagline, bio, skills];
        const result = await pool.query(upsertQuery, values);

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;