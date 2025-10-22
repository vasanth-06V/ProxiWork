// server/src/api/routes/ratingRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const authMiddleware = require('../../middleware/authMiddleware');

// @route   POST /api/ratings/job/:jobId
// @desc    Client submits a rating for a completed job
// @access  Private (Job owner only)
router.post('/job/:jobId', authMiddleware, async (req, res) => {
    const { jobId } = req.params;
    const clientId = req.user.id; // Logged-in client
    const { score, comment } = req.body;

    // --- Input Validation ---
    if (!score || typeof score !== 'number' || score < 1 || score > 5) {
        return res.status(400).json({ msg: 'Rating score must be a number between 1 and 5.' });
    }
    const validatedScore = Math.round(score); // Ensure integer

    const client = await pool.connect(); // Get a client for transaction
    try {
        await client.query('BEGIN'); // Start transaction

        // --- Authorization & Pre-checks ---
        // 1. Verify client owns the job AND the job is 'completed'
        const jobRes = await client.query(
            `SELECT client_id, status FROM jobs WHERE job_id = $1`, [jobId]
        );
        if (jobRes.rows.length === 0 || jobRes.rows[0].client_id !== clientId) {
             await client.query('ROLLBACK');
             return res.status(403).json({ msg: 'Forbidden: You cannot rate this job.' });
        }
        if (jobRes.rows[0].status !== 'completed') {
             await client.query('ROLLBACK');
             return res.status(400).json({ msg: 'Job must be marked as completed before it can be rated.' });
        }

        // 2. Get the provider ID associated with the accepted proposal for this job
        const proposalRes = await client.query(
            `SELECT provider_id FROM proposals WHERE job_id = $1 AND status = 'accepted'`, [jobId]
        );
        if (proposalRes.rows.length === 0) {
             await client.query('ROLLBACK');
             return res.status(404).json({ msg: 'Could not find accepted provider for this job.' });
        }
        const providerId = proposalRes.rows[0].provider_id;
        
        // --- Database Operations ---
        // 3. Insert the new rating into the ratings table
        const newRating = await client.query(
            `INSERT INTO ratings (job_id, client_id, provider_id, score, comment) 
             VALUES ($1, $2, $3, $4, $5) 
             ON CONFLICT (job_id) DO NOTHING -- Prevent duplicate ratings for the same job
             RETURNING *`,
            [jobId, clientId, providerId, validatedScore, comment || null] // Use null if comment is empty
        );

        // Check if the rating was actually inserted (it might fail if already rated)
        if (newRating.rows.length === 0) {
             await client.query('ROLLBACK');
            return res.status(400).json({ msg: 'This job has already been rated.' });
        }

        // 4. Update the provider's average rating and total ratings in the profiles table
        // This query recalculates the average rating atomically.
        await client.query(
            `UPDATE profiles 
             SET total_ratings = total_ratings + 1,
                 rating = ((rating * total_ratings) + $1) / (total_ratings + 1)
             WHERE user_id = $2`,
            [validatedScore, providerId]
        );

        // --- Finalize Transaction ---
        await client.query('COMMIT'); // Commit all changes if everything succeeded
        res.status(201).json({ msg: 'Rating submitted successfully.', rating: newRating.rows[0] });

    } catch (err) {
        await client.query('ROLLBACK'); // Rollback if any error occurred
        console.error("Error submitting rating:", err.message);
        res.status(500).send('Server Error');
    } finally {
        client.release(); // Always release the client connection
    }
});

module.exports = router;