// server/src/api/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

exports.register = catchAsync(async (req, res, next) => {
    const { email, password, role } = req.body;

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

// @route   PUT /api/auth/change-password
// @desc    Change logged-in user's password
// @access  Private
exports.changePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
        return next(new AppError('Please provide current and new password', 400));
    }

    if (newPassword.length < 6) {
        return next(new AppError('New password must be at least 6 characters', 400));
    }

    // Get current user's password hash
    const userResult = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
    if (userResult.rows.length === 0) {
        return next(new AppError('User not found', 404));
    }
    const user = userResult.rows[0];

    // Verify the current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
        return next(new AppError('Current password is incorrect', 400));
    }

    // Hash the new password and update
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    await pool.query('UPDATE users SET password_hash = $1 WHERE user_id = $2', [newHash, userId]);

    res.status(200).json({ message: 'Password changed successfully' });
});

// @route   DELETE /api/auth/delete-account
// @desc    Permanently delete logged-in user's account
// @access  Private
exports.deleteAccount = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Prevent deletion if client has active jobs
    if (userRole === 'client') {
        const activeJobs = await pool.query(
            "SELECT 1 FROM jobs WHERE client_id = $1 AND status IN ('in_progress', 'submitted')",
            [userId]
        );
        if (activeJobs.rows.length > 0) {
            return next(new AppError('You have active jobs in progress. Please complete or cancel them before deleting your account.', 400));
        }
    }

    // Prevent deletion if provider has accepted work still running
    if (userRole === 'provider') {
        const activeWork = await pool.query(
            "SELECT 1 FROM proposals p JOIN jobs j ON p.job_id = j.job_id WHERE p.provider_id = $1 AND p.status = 'accepted' AND j.status IN ('in_progress', 'submitted')",
            [userId]
        );
        if (activeWork.rows.length > 0) {
            return next(new AppError('You have active work in progress. Please complete it before deleting your account.', 400));
        }
    }

    // Delete the user (DB CASCADE handles related records)
    await pool.query('DELETE FROM users WHERE user_id = $1', [userId]);

    res.status(200).json({ message: 'Account deleted successfully' });
});