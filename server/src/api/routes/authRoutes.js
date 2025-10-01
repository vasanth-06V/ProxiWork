// server/src/api/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../../config/db'); // Import our database connection

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;

    // 1. Validate input
    if (!email || !password || !role) {
        return res.status(400).json({ msg: 'Please provide email, password, and role' });
    }
    if (role !== 'client' && role !== 'provider') {
        return res.status(400).json({ msg: 'Invalid role. Must be "client" or "provider"' });
    }

    try {
        // 2. Check if user already exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ msg: 'An account with this email already exists' });
        }

        // 3. Hash the password for security
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 4. Insert the new user into the database
        const newUser = await pool.query(
            'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id, email, role, created_at',
            [email, passwordHash, role]
        );

        // 5. Respond with success
        res.status(201).json(newUser.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;