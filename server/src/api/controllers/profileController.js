// server/src/api/controllers/profileController.js
const pool = require('../../config/db');
const jwt = require('jsonwebtoken');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

exports.getMyProfile = catchAsync(async (req, res, next) => {
    const profile = await pool.query(
        `SELECT u.email, p.*
            FROM profiles p
            JOIN users u ON p.user_id = u.user_id
            WHERE p.user_id = $1`,
        [req.user.id]
    );

    if (profile.rows.length === 0) {
        return next(new AppError('Profile not found', 404));
    }

    res.json(profile.rows[0]);
});

exports.createOrUpdateProfile = catchAsync(async (req, res, next) => {
    const { 
        fullName, tagline, bio, skills, 
        profile_image_url, date_of_birth, phone_number, 
        linkedin_url, github_url 
    } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const sanitizedDob = date_of_birth === '' ? null : date_of_birth;
    const sanitizedPhone = phone_number === '' ? null : phone_number;
    const sanitizedLinkedin = linkedin_url === '' ? null : linkedin_url;
    const sanitizedGithub = github_url === '' ? null : github_url;
    const sanitizedImageUrl = profile_image_url === '' ? null : profile_image_url;
    
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
    const values = [userId, fullName, tagline, bio, skills, sanitizedImageUrl, sanitizedDob, sanitizedPhone, sanitizedLinkedin, sanitizedGithub];
    const result = await pool.query(upsertQuery, values);
    
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
});