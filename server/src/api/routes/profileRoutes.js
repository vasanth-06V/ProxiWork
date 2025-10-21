// server/src/api/routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const authMiddleware = require('../../middleware/authMiddleware');
const jwt = require('jsonwebtoken'); // 1. Import jsonwebtoken

// @route   POST /api/profiles
// @desc    Create or update a user profile and return a new token
// @route   POST /api/profiles
// @desc    Create or update a user profile and return a new token
router.post('/', authMiddleware, async (req, res) => {
    // 1. Destructure all fields from the request body
    const { 
        fullName, tagline, bio, skills, 
        profile_image_url, date_of_birth, phone_number, 
        linkedin_url, github_url 
    } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // --- NEW: Data sanitization logic ---
    // Convert empty strings for optional fields to null, which the database understands.
    const sanitizedDob = date_of_birth === '' ? null : date_of_birth;
    const sanitizedPhone = phone_number === '' ? null : phone_number;
    const sanitizedLinkedin = linkedin_url === '' ? null : linkedin_url;
    const sanitizedGithub = github_url === '' ? null : github_url;
    const sanitizedImageUrl = profile_image_url === '' ? null : profile_image_url;
    
    try {
        const upsertQuery = `
            INSERT INTO profiles (user_id, full_name, tagline, bio, skills, profile_image_url, date_of_birth, phone_number, linkedin_url, github_url, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                full_name = EXCLUDED.full_name,
                tagline = EXCLUDED.tagline,
                bio = EXCLUDED.bio,
                skills = EXCLUDED.skills,
                profile_image_url = EXCLUDED.profile_image_url,
                date_of_birth = EXCLUDED.date_of_birth,
                phone_number = EXCLUDED.phone_number,
                linkedin_url = EXCLUDED.linkedin_url,
                github_url = EXCLUDED.github_url,
                updated_at = NOW()
            RETURNING *;
        `;
        // 2. Use the new sanitized values in the database query
        const values = [userId, fullName, tagline, bio, skills, sanitizedImageUrl, sanitizedDob, sanitizedPhone, sanitizedLinkedin, sanitizedGithub];
        const result = await pool.query(upsertQuery, values);
        
        // ... (The rest of the logic to generate a new token is the same as before)
        const payload = { user: { id: userId, role: userRole, hasProfile: true } };
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ newProfile: result.rows[0], token });
            }
        );

    } catch (err) {
        console.error("Backend Error on Profile Save:", err.message); // More detailed logging
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/profiles/me
// @desc    Get the profile for the logged-in user
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const profile = await pool.query(
            `SELECT u.email, p.*
             FROM profiles p
             JOIN users u ON p.user_id = u.user_id
             WHERE p.user_id = $1`,
            [req.user.id]
        );

        if (profile.rows.length === 0) {
            return res.status(404).json({ msg: 'Profile not found' });
        }

        res.json(profile.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;