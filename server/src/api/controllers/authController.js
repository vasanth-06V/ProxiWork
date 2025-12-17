// server/src/api/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

exports.register = catchAsync(async (req, res, next) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return next(new AppError('Please provide email, password, and role', 400));
    }
    if (role !== 'client' && role !== 'provider') {
        return next(new AppError('Invalid role. Must be "client" or "provider"', 400));
    }

    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
        return next(new AppError('An account with this email already exists', 400));
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id, email, role, created_at',
        [email, passwordHash, role]
    );
    
    res.status(201).json(newUser.rows[0]);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
        return next(new AppError('Invalid Credentials', 400));
    }
    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        return next(new AppError('Invalid Credentials', 400));
    }

    const profileResult = await pool.query('SELECT 1 FROM profiles WHERE user_id = $1', [user.user_id]);
    const hasProfile = profileResult.rows.length > 0;

    const payload = {
        user: {
            id: user.user_id,
            role: user.role,
            hasProfile: hasProfile
        }
    };

    jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        (err, token) => {
            if (err) throw err;
            res.json({ token });
        }
    );
});