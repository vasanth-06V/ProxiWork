// server/src/api/controllers/jobController.js
const pool = require('../../config/db');
const { createNotification } = require('../services/notificationService');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

exports.createJob = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'client') {
        return next(new AppError('Forbidden: Only clients can post jobs', 403));
    }

    const { title, description, budget, deadline } = req.body;
    const clientId = req.user.id;

    if (!title || !description) {
        return next(new AppError('Please provide a title and description', 400));
    }

    const newJob = await pool.query(
        'INSERT INTO jobs (client_id, title, description, budget, deadline) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [clientId, title, description, budget, deadline || null]
    );

    res.status(201).json(newJob.rows[0]);
});

exports.getMyJobs = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'client') {
        return next(new AppError('Forbidden: Access denied', 403));
    }

    const myJobs = await pool.query(
        "SELECT * FROM jobs WHERE client_id = $1 ORDER BY created_at DESC",
        [req.user.id]
    );
    res.json(myJobs.rows);
});

exports.getAllJobs = catchAsync(async (req, res, next) => {
    const allJobs = await pool.query(
        `SELECT j.job_id, j.title, j.description, j.budget, j.status, j.created_at, j.deadline, 
            p.full_name AS client_name
            FROM jobs j
            LEFT JOIN profiles p ON j.client_id = p.user_id
            WHERE j.status = 'open' 
            ORDER BY j.created_at DESC`
    );
    res.json(allJobs.rows);
});

exports.getJobById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const job = await pool.query(
        "SELECT * FROM jobs WHERE job_id = $1",
        [id]
    );

    if (job.rows.length === 0) {
        return next(new AppError('Job not found', 404));
    }

    res.json(job.rows[0]);
});

exports.getProposalsForJob = catchAsync(async (req, res, next) => {
    const { id: jobId } = req.params;
    const clientId = req.user.id;

    const job = await pool.query(
        "SELECT client_id FROM jobs WHERE job_id = $1",
        [jobId]
    );

    if (job.rows.length === 0) {
        return next(new AppError('Job not found', 404));
    }

    if (job.rows[0].client_id !== clientId) {
        return next(new AppError('Forbidden: You are not the owner of this job and cannot view its proposals', 403));
    }

    const proposals = await pool.query(
        `SELECT p.proposal_id, p.cover_letter, p.bid_amount, p.status, p.created_at, pr.full_name, pr.tagline 
            FROM proposals p
            JOIN profiles pr ON p.provider_id = pr.user_id
            WHERE p.job_id = $1
            ORDER BY p.created_at ASC`,
        [jobId]
    );

    res.json(proposals.rows);
});

exports.submitProposal = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'provider') {
        return next(new AppError('Forbidden: Only providers can submit proposals', 403));
    }

    const { cover_letter, bid_amount } = req.body;
    const { id: jobId } = req.params;
    const providerId = req.user.id;

    if (!cover_letter) {
        return next(new AppError('A cover letter is required to submit a proposal', 400));
    }

    try {
        const newProposal = await pool.query(
            `INSERT INTO proposals (job_id, provider_id, cover_letter, bid_amount) 
                VALUES ($1, $2, $3, $4) RETURNING *`,
            [jobId, providerId, cover_letter, bid_amount]
        );

        res.status(201).json(newProposal.rows[0]);

    } catch (err) {
        if (err.code === '23505') {
            return next(new AppError('You have already submitted a proposal for this job', 400));
        }
        throw err;
    }
});

exports.submitWork = catchAsync(async (req, res, next) => {
    const { id: jobId } = req.params;
    const providerId = req.user.id;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const proposalCheck = await client.query(
            `SELECT 1 FROM proposals 
                WHERE job_id = $1 AND provider_id = $2 AND status = 'accepted'`,
            [jobId, providerId]
        );
        if (proposalCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return next(new AppError('Forbidden: You are not the assigned provider for this job.', 403));
        }

        const updatedJob = await client.query(
            "UPDATE jobs SET status = 'submitted' WHERE job_id = $1 AND status = 'in_progress' RETURNING *",
            [jobId]
        );
            if (updatedJob.rows.length === 0) {
            await client.query('ROLLBACK');
            return next(new AppError('Job is not currently in progress or not found.', 400));
        }

        const jobInfo = await client.query('SELECT client_id, title FROM jobs WHERE job_id = $1', [jobId]);
        const jobTitle = jobInfo.rows[0].title;
        const clientId = jobInfo.rows[0].client_id;

        await client.query('COMMIT');

        createNotification(
            clientId,
            'work_submitted',
            `Work submitted for "${jobTitle}". Please review and complete.`,
            '/dashboard'
        );

        res.json({ msg: 'Work submitted successfully.', job: updatedJob.rows[0] });

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
});

exports.completeJob = catchAsync(async (req, res, next) => {
    const { id: jobId } = req.params;
    const clientId = req.user.id;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const updatedJob = await client.query(
            `UPDATE jobs SET status = 'completed' 
                WHERE job_id = $1 AND client_id = $2 AND status = 'submitted' 
                RETURNING *`,
            [jobId, clientId]
        );

        if (updatedJob.rows.length === 0) {
            await client.query('ROLLBACK');
            return next(new AppError('Cannot complete job or you are not the owner. Ensure work was submitted.', 403));
        }
        
        console.log(`SIMULATING PAYMENT RELEASE for job ${jobId}`);

        const provRes = await client.query(
            `SELECT provider_id FROM proposals WHERE job_id = $1 AND status = 'accepted'`, 
            [jobId]
        );
        const providerId = provRes.rows[0].provider_id;

        await client.query('COMMIT');

        createNotification(
            providerId,
            'job_completed',
            `Payment released! The job is marked as complete.`,
            '/my-proposals'
        );

        res.json({ msg: 'Job marked as complete. Payment released (simulation).', job: updatedJob.rows[0] });

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
});

exports.updateJob = catchAsync(async (req, res, next) => {
    const { title, description, budget } = req.body;
    const { id: jobId } = req.params;
    const clientId = req.user.id;

    const updatedJob = await pool.query(
        `UPDATE jobs SET title = $1, description = $2, budget = $3 
            WHERE job_id = $4 AND client_id = $5 AND status = 'open' 
            RETURNING *`,
        [title, description, budget, jobId, clientId]
    );

    if (updatedJob.rows.length === 0) {
        return next(new AppError('Job cannot be edited or you are not the owner.', 403));
    }
    res.json(updatedJob.rows[0]);
});

exports.deleteJob = catchAsync(async (req, res, next) => {
    const { id: jobId } = req.params;
    const clientId = req.user.id;

    const deleteResult = await pool.query(
        "DELETE FROM jobs WHERE job_id = $1 AND client_id = $2 AND status = 'open'",
        [jobId, clientId]
    );

    if (deleteResult.rowCount === 0) {
        return next(new AppError('Job cannot be deleted or you are not the owner.', 403));
    }
    res.json({ msg: 'Job successfully deleted' });
});