// server/src/api/routes/proposalRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const authMiddleware = require('../../middleware/authMiddleware');

// @route   POST /api/proposals/:id/accept
// @desc    Accept a proposal for a job
// @access  Private (Job owner only)
router.post('/:id/accept', authMiddleware, async (req, res) => {
    const { id: proposalId } = req.params; // This is the ID of the proposal to accept
    const loggedInUserId = req.user.id;   // The logged-in user

    // We get a single connection from the pool to run the transaction
    const client = await pool.connect();

    try {
        // Start the transaction
        await client.query('BEGIN');

        // 1. Get the proposal and its job_id to find the job owner
        const proposalRes = await client.query('SELECT job_id FROM proposals WHERE proposal_id = $1', [proposalId]);
        if (proposalRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ msg: 'Proposal not found' });
        }
        const { job_id: jobId } = proposalRes.rows[0];

        // 2. Authorize: Verify the logged-in user owns the job
        const jobRes = await client.query('SELECT client_id FROM jobs WHERE job_id = $1', [jobId]);
        if (jobRes.rows[0].client_id !== loggedInUserId) {
            await client.query('ROLLBACK');
            return res.status(403).json({ msg: 'Forbidden: You are not the owner of this job' });
        }

        // 3. Update the job's status to 'in_progress'
        await client.query("UPDATE jobs SET status = 'in_progress' WHERE job_id = $1", [jobId]);

        // 4. Update the accepted proposal's status to 'accepted'
        await client.query("UPDATE proposals SET status = 'accepted' WHERE proposal_id = $1", [proposalId]);

        // 5. Update all other proposals for this job to 'rejected'
        await client.query("UPDATE proposals SET status = 'rejected' WHERE job_id = $1 AND proposal_id != $2", [jobId, proposalId]);

        // If all queries were successful, commit the transaction
        await client.query('COMMIT');

        res.json({ msg: 'Proposal accepted successfully. The job is now in progress.' });

    } catch (err) {
        // If any query fails, roll back the entire transaction
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server Error');
    } finally {
        // IMPORTANT: Release the client back to the pool
        client.release();
    }
});

// @route   GET /api/proposals/my-proposals
// @desc    Get all proposals submitted by the logged-in provider
// @access  Private (Providers only)
router.get('/my-proposals', authMiddleware, async (req, res) => {
    // 1. Authorize: Make sure the user is a provider
    if (req.user.role !== 'provider') {
        return res.status(403).json({ msg: 'Forbidden: Access denied' });
    }

    try {
        // 2. Fetch all proposals for this provider and JOIN with the jobs table
        //    to also get the job title.
        const proposals = await pool.query(
            `SELECT p.proposal_id, p.status, p.bid_amount, p.created_at, j.job_id, j.title AS job_title
             FROM proposals p
             JOIN jobs j ON p.job_id = j.job_id
             WHERE p.provider_id = $1
             ORDER BY p.created_at DESC`,
            [req.user.id]
        );

        res.json(proposals.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;