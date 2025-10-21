// server/src/api/routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const authMiddleware = require('../../middleware/authMiddleware');
const jwt = require('jsonwebtoken'); // 1. Import jsonwebtoken

// @route   POST /api/profiles
// @desc    Create or update a user profile and return a new token
router.post('/', authMiddleware, async (req, res) => {
    const { fullName, tagline, bio, skills, profile_image_url, date_of_birth } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        const upsertQuery = `
            INSERT INTO profiles (user_id, full_name, tagline, bio, skills, profile_image_url, date_of_birth, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                full_name = EXCLUDED.full_name,
                tagline = EXCLUDED.tagline,
                bio = EXCLUDED.bio,
                skills = EXCLUDED.skills,
                profile_image_url = EXCLUDED.profile_image_url,
                date_of_birth = EXCLUDED.date_of_birth,
                updated_at = NOW()
            RETURNING *;
        `;
        const values = [userId, fullName, tagline, bio, skills, profile_image_url, date_of_birth];
        const result = await pool.query(upsertQuery, values);
        const newProfile = result.rows[0];

        const payload = {
            user: { id: userId, role: userRole, hasProfile: true }
        };
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ newProfile, token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/profiles/me
// @desc    Get the profile for the logged-in user
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
    try {
        // We use a JOIN to get data from both the profiles and users tables
        const profile = await pool.query(
            `SELECT u.email, p.full_name, p.tagline, p.bio, p.skills, p.profile_image_url, p.date_of_birth, p.rating
             FROM profiles p
             JOIN users u ON p.user_id = u.user_id
             WHERE p.user_id = $1`,
            [req.user.id]
        );

        if (profile.rows.length === 0) {
            return res.status(404).json({ msg: 'Profile not found for this user' });
        }

        res.json(profile.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;