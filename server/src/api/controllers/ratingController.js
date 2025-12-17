// server/src/api/controllers/ratingController.js
const pool = require('../../config/db');
const { createNotification } = require('../services/notificationService');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

exports.submitRating = catchAsync(async (req, res, next) => {
    const { jobId } = req.params;
    const clientId = req.user.id; 
    const { score, comment } = req.body;

    if (!score || typeof score !== 'number' || score < 1 || score > 5) {
        return next(new AppError('Rating score must be a number between 1 and 5.', 400));
    }
    const validatedScore = Math.round(score);

    const client = await pool.connect(); 
    try {
        await client.query('BEGIN'); 

        const jobRes = await client.query(
            `SELECT client_id, status FROM jobs WHERE job_id = $1`, [jobId]
        );
        if (jobRes.rows.length === 0 || jobRes.rows[0].client_id !== clientId) {
             await client.query('ROLLBACK');
             return next(new AppError('Forbidden: You cannot rate this job.', 403));
        }
        if (jobRes.rows[0].status !== 'completed') {
             await client.query('ROLLBACK');
             return next(new AppError('Job must be marked as completed before it can be rated.', 400));
        }

        const proposalRes = await client.query(
            `SELECT provider_id FROM proposals WHERE job_id = $1 AND status = 'accepted'`, [jobId]
        );
        if (proposalRes.rows.length === 0) {
             await client.query('ROLLBACK');
             return next(new AppError('Could not find accepted provider for this job.', 404));
        }
        const providerId = proposalRes.rows[0].provider_id;
        
        const newRating = await client.query(
            `INSERT INTO ratings (job_id, client_id, provider_id, score, comment) 
             VALUES ($1, $2, $3, $4, $5) 
             ON CONFLICT (job_id) DO NOTHING 
             RETURNING *`,
            [jobId, clientId, providerId, validatedScore, comment || null] 
        );

        if (newRating.rows.length === 0) {
             await client.query('ROLLBACK');
            return next(new AppError('This job has already been rated.', 400));
        }

        await client.query(
            `UPDATE profiles 
             SET total_ratings = total_ratings + 1,
                 rating = ((rating * total_ratings) + $1) / (total_ratings + 1)
             WHERE user_id = $2`,
            [validatedScore, providerId]
        );

        await client.query('COMMIT');

        createNotification(
            providerId,
            'new_rating',
            `You received a new ${score}-star rating!`,
            '/profile'
        );

        res.status(201).json({ msg: 'Rating submitted successfully.', rating: newRating.rows[0] });

    } catch (err) {
        await client.query('ROLLBACK');
        if (err.code === '23505') {
            return next(new AppError('This job has already been rated.', 400));
        }
        throw err;
    } finally {
        client.release(); 
    }
});