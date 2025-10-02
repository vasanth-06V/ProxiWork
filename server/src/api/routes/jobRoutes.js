// server/src/api/routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const authMiddleware = require('../../middleware/authMiddleware');

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private (Clients only)
router.post('/', authMiddleware, async (req, res) => {
    // First, check the user's role. This is our Authorization step.
    if (req.user.role !== 'client') {
        return res.status(403).json({ msg: 'Forbidden: Only clients can post jobs' });
    }

    const { title, description, budget } = req.body;
    const clientId = req.user.id;

    // Validate input
    if (!title || !description) {
        return res.status(400).json({ msg: 'Please provide a title and description' });
    }

    try {
        const newJob = await pool.query(
            'INSERT INTO jobs (client_id, title, description, budget) VALUES ($1, $2, $3, $4) RETURNING *',
            [clientId, title, description, budget]
        );

        res.status(201).json(newJob.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



// @route   GET /api/jobs
// @desc    Get all open job postings
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Query the database to get all jobs with the status 'open'
        // and order them by the newest first.
        const allJobs = await pool.query(
            "SELECT * FROM jobs WHERE status = 'open' ORDER BY created_at DESC"
        );

        // Respond with the array of job objects
        res.json(allJobs.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/jobs/:id
// @desc    Get a single job by its ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        // Get the job ID from the URL parameter
        const { id } = req.params;

        const job = await pool.query(
            "SELECT * FROM jobs WHERE job_id = $1",
            [id]
        );

        // If no job is found with that ID, return a 404 error
        if (job.rows.length === 0) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        // If a job is found, return it
        res.json(job.rows[0]);

    } catch (err) {
        console.error(err.message);
        // Check for invalid UUID format or other potential errors
        if (err.kind === 'ObjectId' || err.name === 'CastError') {
             return res.status(404).json({ msg: 'Job not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/jobs/:id/propose
// @desc    Submit a proposal for a specific job
// @access  Private (Providers only)
router.post('/:id/propose', authMiddleware, async (req, res) => {
    // First, we authorize: only 'provider' roles can access this.
    if (req.user.role !== 'provider') {
        return res.status(403).json({ msg: 'Forbidden: Only providers can submit proposals' });
    }

    const { cover_letter, bid_amount } = req.body;
    const { id: jobId } = req.params;   // Get job_id from the URL
    const providerId = req.user.id;     // Get provider_id from the JWT

    // Basic validation
    if (!cover_letter) {
        return res.status(400).json({ msg: 'A cover letter is required to submit a proposal' });
    }

    try {
        const newProposal = await pool.query(
            `INSERT INTO proposals (job_id, provider_id, cover_letter, bid_amount) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [jobId, providerId, cover_letter, bid_amount]
        );

        res.status(201).json(newProposal.rows[0]);

    } catch (err) {
        // This is a special error handler. '23505' is the PostgreSQL error code
        // for a "unique_violation", which our UNIQUE(job_id, provider_id) constraint triggers.
        if (err.code === '23505') {
            return res.status(400).json({ msg: 'You have already submitted a proposal for this job' });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/jobs/:id/proposals
// @desc    Get all proposals for a specific job owned by the client
// @access  Private (Job owner only)
router.get('/:id/proposals', authMiddleware, async (req, res) => {
    const { id: jobId } = req.params;   // Get job_id from the URL
    const clientId = req.user.id;       // Get the logged-in user's ID from the token

    try {
        // 1. Authorize: First, verify the logged-in user is the owner of the job.
        const job = await pool.query(
            "SELECT client_id FROM jobs WHERE job_id = $1",
            [jobId]
        );

        // Check if the job exists
        if (job.rows.length === 0) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        // Check if the logged-in user is the one who created the job
        if (job.rows[0].client_id !== clientId) {
            return res.status(403).json({ msg: 'Forbidden: You are not the owner of this job and cannot view its proposals' });
        }

        // 2. If authorized, fetch all proposals for that job.
        // We use a JOIN to combine data from the 'proposals' and 'profiles' tables.
        const proposals = await pool.query(
            `SELECT p.proposal_id, p.cover_letter, p.bid_amount, p.status, p.created_at, pr.full_name, pr.tagline 
             FROM proposals p
             JOIN profiles pr ON p.provider_id = pr.user_id
             WHERE p.job_id = $1
             ORDER BY p.created_at ASC`, // Show oldest proposals first
            [jobId]
        );

        res.json(proposals.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;