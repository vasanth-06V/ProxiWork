// server/src/api/controllers/jobController.js
const pool = require('../../config/db');
const { createNotification } = require('../services/notificationService');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

// ... (createJob and getMyJobs remain the same) ...

exports.createJob = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'client') {
        return next(new AppError('Forbidden: Only clients can post jobs', 403));
    }

    const { title, description, budget, deadline, job_questions } = req.body;
    const clientId = req.user.id;

    // Validate job_questions if provided: max 5, each question max 150 chars
    if (job_questions) {
        if (!Array.isArray(job_questions) || job_questions.length > 5) {
            return next(new AppError('You can add a maximum of 5 proposal questions.', 400));
        }
        for (const q of job_questions) {
            if (typeof q !== 'string' || q.trim().length === 0) {
                return next(new AppError('Each question must be a non-empty string.', 400));
            }
            if (q.length > 150) {
                return next(new AppError('Each question must be at most 150 characters.', 400));
            }
        }
    }

    const questionsValue = (job_questions && job_questions.length > 0)
        ? JSON.stringify(job_questions)
        : null;

    const newJob = await pool.query(
        'INSERT INTO jobs (client_id, title, description, budget, deadline, job_questions) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [clientId, title, description, budget, deadline || null, questionsValue]
    );

    res.status(201).json(newJob.rows[0]);
});

exports.getMyJobs = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'client') {
        return next(new AppError('Forbidden: Access denied', 403));
    }

    const myJobs = await pool.query(
        `SELECT j.*, 
         CASE WHEN r.rating_id IS NOT NULL THEN true ELSE false END as is_rated
         FROM jobs j
         LEFT JOIN ratings r ON j.job_id = r.job_id
         WHERE j.client_id = $1 
         ORDER BY j.created_at DESC`,
        [req.user.id]
    );
    res.json(myJobs.rows);
});

// --- UPDATED: Get All Jobs (Public Board) ---
exports.getAllJobs = catchAsync(async (req, res, next) => {
    // We use COALESCE to prioritize: Profile Name -> User Email -> 'Anonymous'
    const allJobs = await pool.query(
        `SELECT j.job_id, j.title, j.description, j.budget, j.status, j.created_at, j.deadline, 
            COALESCE(p.full_name, u.email) AS client_name
            FROM jobs j
            LEFT JOIN profiles p ON j.client_id = p.user_id
            JOIN users u ON j.client_id = u.user_id
            WHERE j.status = 'open' 
            ORDER BY j.created_at DESC`
    );
    res.json(allJobs.rows);
});

// --- UPDATED: Get Job By ID (Detail Page) ---
exports.getJobById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const job = await pool.query(
        `SELECT j.*,
            COALESCE(p.full_name, u.email) AS client_name
         FROM jobs j
         LEFT JOIN profiles p ON j.client_id = p.user_id
         JOIN users u ON j.client_id = u.user_id
         WHERE j.job_id = $1`,
        [id]
    );

    if (job.rows.length === 0) {
        return next(new AppError('Job not found', 404));
    }

    res.json(job.rows[0]);
});

// ... (The rest of the functions: getProposalsForJob, submitProposal, submitWork, completeJob, etc. remain the same) ...

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
        `SELECT p.proposal_id, p.cover_letter, p.bid_amount, p.status, p.created_at,
                p.is_viewed, p.viewed_at, p.proposal_answers,
                p.provider_id,
                pr.full_name, pr.tagline, pr.rating, pr.total_ratings, pr.profile_image_url
            FROM proposals p
            JOIN profiles pr ON p.provider_id = pr.user_id
            WHERE p.job_id = $1
            ORDER BY
                CASE p.status
                    WHEN 'shortlisted' THEN 1
                    WHEN 'pending'     THEN 2
                    WHEN 'accepted'    THEN 3
                    WHEN 'rejected'    THEN 4
                    WHEN 'withdrawn'   THEN 5
                END,
                p.created_at ASC`,
        [jobId]
    );

    res.json(proposals.rows);
});

exports.submitProposal = catchAsync(async (req, res, next) => {
    // TODO V1.2: enforce verification guard — check req.user.isVerified === true
    if (req.user.role !== 'provider') {
        return next(new AppError('Forbidden: Only providers can submit proposals', 403));
    }

    if (!req.user.hasProfile) {
        return next(new AppError('Please complete your profile before submitting a proposal.', 403));
    }

    const { cover_letter, bid_amount, proposal_answers } = req.body;
    const { id: jobId } = req.params;
    const providerId = req.user.id;

    // Validate proposal_answers if provided — must be array of strings, max 500 chars each
    if (proposal_answers) {
        if (!Array.isArray(proposal_answers)) {
            return next(new AppError('proposal_answers must be an array.', 400));
        }
        for (const a of proposal_answers) {
            if (typeof a !== 'string' || a.length > 500) {
                return next(new AppError('Each answer must be a string of at most 500 characters.', 400));
            }
        }
    }

    // Check job exists and is open
    const jobRes = await pool.query(
        'SELECT client_id, status, title, proposal_count FROM jobs WHERE job_id = $1',
        [jobId]
    );
    if (jobRes.rows.length === 0) {
        return next(new AppError('Job not found', 404));
    }
    const job = jobRes.rows[0];
    if (job.status !== 'open') {
        return next(new AppError('This job is no longer accepting proposals.', 400));
    }
    // Prevent provider from applying to their own job (edge case safety)
    if (job.client_id === providerId) {
        return next(new AppError('You cannot apply to your own job.', 403));
    }

    const dbClient = await pool.connect();
    try {
        await dbClient.query('BEGIN');

        const answersValue = (proposal_answers && proposal_answers.length > 0)
            ? JSON.stringify(proposal_answers)
            : null;

        const newProposal = await dbClient.query(
            `INSERT INTO proposals (job_id, provider_id, cover_letter, bid_amount, proposal_answers)
                VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [jobId, providerId, cover_letter, bid_amount, answersValue]
        );

        // Increment proposal_count — first proposal locks the job
        await dbClient.query(
            'UPDATE jobs SET proposal_count = proposal_count + 1 WHERE job_id = $1',
            [jobId]
        );

        await dbClient.query('COMMIT');

        // Notify the client that a new proposal was received
        const io = req.app.get('io');
        createNotification(
            io,
            job.client_id,
            'proposal_submitted',
            `A new proposal was submitted for "${job.title}".`,
            `/jobs/${jobId}/proposals`
        );

        res.status(201).json(newProposal.rows[0]);

    } catch (err) {
        await dbClient.query('ROLLBACK');
        if (err.code === '23505') {
            return next(new AppError('You have already submitted a proposal for this job.', 409));
        }
        throw err;
    } finally {
        dbClient.release();
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

        const io = req.app.get('io');
        createNotification(
            io,
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

        if (!provRes.rows.length) {
            await client.query('ROLLBACK');
            return next(new AppError('Could not find assigned provider for this job.', 404));
        }

        const providerId = provRes.rows[0].provider_id;

        await client.query('COMMIT');

        const io = req.app.get('io');
        createNotification(
            io,
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
    const { title, description, budget, deadline, job_questions } = req.body;
    const { id: jobId } = req.params;
    const clientId = req.user.id;

    // Check ownership and open status first
    const jobCheck = await pool.query(
        'SELECT client_id, status, proposal_count FROM jobs WHERE job_id = $1',
        [jobId]
    );
    if (jobCheck.rows.length === 0) {
        return next(new AppError('Job not found', 404));
    }
    if (jobCheck.rows[0].client_id !== clientId) {
        return next(new AppError('Forbidden: You are not the owner of this job.', 403));
    }
    if (jobCheck.rows[0].status !== 'open') {
        return next(new AppError('Job cannot be edited once it is no longer open.', 403));
    }
    // Job lock: once first proposal submitted, fields are immutable
    if (jobCheck.rows[0].proposal_count >= 1) {
        return next(new AppError(
            'This job can no longer be edited because proposals have already been submitted.',
            409
        ));
    }

    const updatedJob = await pool.query(
        `UPDATE jobs SET title = $1, description = $2, budget = $3, deadline = $4, job_questions = $5
            WHERE job_id = $6 AND client_id = $7
            RETURNING *`,
        [title, description, budget, deadline || null, job_questions ? JSON.stringify(job_questions) : null, jobId, clientId]
    );

    if (updatedJob.rows.length === 0) {
        return next(new AppError('Job cannot be edited.', 403));
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