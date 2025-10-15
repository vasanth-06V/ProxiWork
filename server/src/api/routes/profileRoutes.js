// server/src/api/routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const authMiddleware = require('../../middleware/authMiddleware');
const jwt = require('jsonwebtoken'); // 1. Import jsonwebtoken

// @route   POST /api/profiles
// @desc    Create or update a user profile and return a new token
router.post('/', authMiddleware, async (req, res) => {
    const { fullName, tagline, bio, skills } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role; // Get role from existing token

    try {
        // --- The UPSERT query is the same as before ---
        const upsertQuery = `
            INSERT INTO profiles (user_id, full_name, tagline, bio, skills, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                full_name = EXCLUDED.full_name,
                tagline = EXCLUDED.tagline,
                bio = EXCLUDED.bio,
                skills = EXCLUDED.skills,
                updated_at = NOW()
            RETURNING *;
        `;
        const values = [userId, fullName, tagline, bio, skills];
        const result = await pool.query(upsertQuery, values);
        const newProfile = result.rows[0];

        // --- NEW LOGIC: GENERATE A NEW, UPDATED TOKEN ---
        const payload = {
            user: {
                id: userId,
                role: userRole,
                hasProfile: true // The new, correct status
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                // Return both the new profile data AND the new token
                res.json({ newProfile, token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;