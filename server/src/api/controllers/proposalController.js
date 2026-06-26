// server/src/api/controllers/proposalController.js
const pool = require('../../config/db');
const { createNotification } = require('../services/notificationService');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

// ---------------------------------------------------------------
// @desc    Accept a proposal — transitions job to in_progress
//          Accepts from both 'pending' and 'shortlisted' states
// @access  Private (Job owner / Client only)
// ---------------------------------------------------------------
exports.acceptProposal = catchAsync(async (req, res, next) => {
    const { id: proposalId } = req.params;
    const loggedInUserId = req.user.id;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Fetch proposal and validate it exists
        const proposalRes = await client.query(
            'SELECT job_id, provider_id, status FROM proposals WHERE proposal_id = $1',
            [proposalId]
        );
        if (proposalRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return next(new AppError('Proposal not found', 404));
        }

        const { job_id: jobId, provider_id: providerId, status: proposalStatus } = proposalRes.rows[0];

        // Validate client owns this job
        const jobRes = await client.query('SELECT client_id, title FROM jobs WHERE job_id = $1', [jobId]);
        if (jobRes.rows.length === 0 || jobRes.rows[0].client_id !== loggedInUserId) {
            await client.query('ROLLBACK');
            return next(new AppError('Forbidden: You are not the owner of this job', 403));
        }

        // Only accept from 'pending' or 'shortlisted'
        if (!['pending', 'shortlisted'].includes(proposalStatus)) {
            await client.query('ROLLBACK');
            return next(new AppError(`Cannot accept a proposal with status: ${proposalStatus}`, 409));
        }

        const jobTitle = jobRes.rows[0].title;

        // Accept this proposal
        await client.query(
            "UPDATE proposals SET status = 'accepted' WHERE proposal_id = $1",
            [proposalId]
        );

        // Reject all other proposals for this job in the same transaction
        await client.query(
            "UPDATE proposals SET status = 'rejected' WHERE job_id = $1 AND proposal_id != $2 AND status NOT IN ('withdrawn', 'rejected')",
            [jobId, proposalId]
        );

        // Move job to in_progress
        await client.query(
            "UPDATE jobs SET status = 'in_progress' WHERE job_id = $1",
            [jobId]
        );

        await client.query('COMMIT');

        // Send real-time notification to provider
        const io = req.app.get('io');
        createNotification(
            io,
            providerId,
            'proposal_accepted',
            `Your proposal for "${jobTitle}" has been accepted! You can now start the project.`,
            '/my-proposals'
        );

        res.json({ msg: 'Proposal accepted successfully. The job is now in progress.' });

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
});

// ---------------------------------------------------------------
// @desc    Reject a proposal — works from 'pending' or 'shortlisted'
// @access  Private (Job owner / Client only)
// ---------------------------------------------------------------
exports.rejectProposal = catchAsync(async (req, res, next) => {
    const { id: proposalId } = req.params;
    const loggedInUserId = req.user.id;

    // Get proposal + job info
    const proposalRes = await pool.query(
        'SELECT p.job_id, p.provider_id, p.status FROM proposals p WHERE p.proposal_id = $1',
        [proposalId]
    );
    if (proposalRes.rows.length === 0) {
        return next(new AppError('Proposal not found', 404));
    }

    const { job_id: jobId, provider_id: providerId, status: proposalStatus } = proposalRes.rows[0];

    const jobRes = await pool.query('SELECT client_id, status, title FROM jobs WHERE job_id = $1', [jobId]);
    if (jobRes.rows.length === 0 || jobRes.rows[0].client_id !== loggedInUserId) {
        return next(new AppError('Forbidden: You are not the owner of this job', 403));
    }

    if (jobRes.rows[0].status !== 'open') {
        return next(new AppError('Cannot reject proposals for jobs that are not open.', 400));
    }

    // Can only reject from pending or shortlisted
    if (!['pending', 'shortlisted'].includes(proposalStatus)) {
        return next(new AppError(`Cannot reject a proposal with status: ${proposalStatus}`, 409));
    }

    const updatedProposal = await pool.query(
        "UPDATE proposals SET status = 'rejected' WHERE proposal_id = $1 RETURNING *",
        [proposalId]
    );

    // Notify the provider
    const io = req.app.get('io');
    createNotification(
        io,
        providerId,
        'proposal_rejected',
        `Your proposal for "${jobRes.rows[0].title}" was not selected.`,
        '/my-proposals'
    );

    res.json({ msg: 'Proposal rejected.', proposal: updatedProposal.rows[0] });
});

// ---------------------------------------------------------------
// @desc    Shortlist a proposal — moves from 'pending' to 'shortlisted'
// @access  Private (Job owner / Client only)
// ---------------------------------------------------------------
exports.shortlistProposal = catchAsync(async (req, res, next) => {
    const { id: proposalId } = req.params;
    const loggedInUserId = req.user.id;

    const proposalRes = await pool.query(
        'SELECT p.job_id, p.provider_id, p.status FROM proposals p WHERE p.proposal_id = $1',
        [proposalId]
    );
    if (proposalRes.rows.length === 0) {
        return next(new AppError('Proposal not found', 404));
    }

    const { job_id: jobId, provider_id: providerId, status: proposalStatus } = proposalRes.rows[0];

    const jobRes = await pool.query('SELECT client_id, title FROM jobs WHERE job_id = $1', [jobId]);
    if (jobRes.rows.length === 0 || jobRes.rows[0].client_id !== loggedInUserId) {
        return next(new AppError('Forbidden: You are not the owner of this job', 403));
    }

    if (proposalStatus !== 'pending') {
        return next(new AppError(`Can only shortlist a pending proposal. Current status: ${proposalStatus}`, 409));
    }

    const updated = await pool.query(
        "UPDATE proposals SET status = 'shortlisted' WHERE proposal_id = $1 RETURNING *",
        [proposalId]
    );

    // Notify the provider
    const io = req.app.get('io');
    createNotification(
        io,
        providerId,
        'proposal_shortlisted',
        `Great news! Your proposal for "${jobRes.rows[0].title}" has been shortlisted.`,
        '/my-proposals'
    );

    res.json({ msg: 'Proposal shortlisted.', proposal: updated.rows[0] });
});

// ---------------------------------------------------------------
// @desc    Withdraw a proposal — provider can withdraw if pending or shortlisted
// @access  Private (Proposal owner / Provider only)
// ---------------------------------------------------------------
exports.withdrawProposal = catchAsync(async (req, res, next) => {
    const { id: proposalId } = req.params;
    const loggedInUserId = req.user.id;

    const proposalRes = await pool.query(
        'SELECT p.provider_id, p.status, p.job_id FROM proposals p WHERE p.proposal_id = $1',
        [proposalId]
    );
    if (proposalRes.rows.length === 0) {
        return next(new AppError('Proposal not found', 404));
    }

    const { provider_id: providerId, status: proposalStatus, job_id: jobId } = proposalRes.rows[0];

    // Only proposal owner can withdraw
    if (providerId !== loggedInUserId) {
        return next(new AppError('Forbidden: You can only withdraw your own proposal', 403));
    }

    // Only allowed from pending or shortlisted
    if (!['pending', 'shortlisted'].includes(proposalStatus)) {
        return next(new AppError(`Cannot withdraw a proposal with status: ${proposalStatus}`, 409));
    }

    await pool.query(
        "UPDATE proposals SET status = 'withdrawn' WHERE proposal_id = $1",
        [proposalId]
    );

    // Decrement proposal_count on the job since this proposal is no longer active
    await pool.query(
        'UPDATE jobs SET proposal_count = GREATEST(proposal_count - 1, 0) WHERE job_id = $1',
        [jobId]
    );

    res.json({ msg: 'Proposal withdrawn successfully.' });
});

// ---------------------------------------------------------------
// @desc    Mark a proposal as viewed by the client
//          Only updates on first view (is_viewed = false)
// @access  Private (Job owner / Client only)
// ---------------------------------------------------------------
exports.viewProposal = catchAsync(async (req, res, next) => {
    const { id: proposalId } = req.params;
    const loggedInUserId = req.user.id;

    const proposalRes = await pool.query(
        'SELECT p.job_id, p.provider_id, p.is_viewed FROM proposals p WHERE p.proposal_id = $1',
        [proposalId]
    );
    if (proposalRes.rows.length === 0) {
        return next(new AppError('Proposal not found', 404));
    }

    const { job_id: jobId, provider_id: providerId, is_viewed } = proposalRes.rows[0];

    // Verify the caller owns the job (only client should be marking as viewed)
    const jobRes = await pool.query('SELECT client_id, title FROM jobs WHERE job_id = $1', [jobId]);
    if (jobRes.rows.length === 0 || jobRes.rows[0].client_id !== loggedInUserId) {
        return next(new AppError('Forbidden: You are not the owner of this job', 403));
    }

    // Only update on first view
    if (!is_viewed) {
        await pool.query(
            'UPDATE proposals SET is_viewed = TRUE, viewed_at = NOW() WHERE proposal_id = $1',
            [proposalId]
        );

        // Notify provider their proposal was viewed
        const io = req.app.get('io');
        createNotification(
            io,
            providerId,
            'proposal_viewed',
            `Your proposal for "${jobRes.rows[0].title}" was viewed by the client.`,
            '/my-proposals'
        );
    }

    res.json({ msg: 'Proposal marked as viewed.' });
});

// ---------------------------------------------------------------
// @desc    Get all proposals submitted by the logged-in provider
// @access  Private (Provider only)
// ---------------------------------------------------------------
exports.getMyProposals = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'provider') {
        return next(new AppError('Forbidden: Access denied', 403));
    }

    const proposals = await pool.query(
        `SELECT p.proposal_id, p.status, p.bid_amount, p.created_at,
                p.is_viewed, p.viewed_at,
                j.job_id, j.title AS job_title, j.status AS job_status
            FROM proposals p
            JOIN jobs j ON p.job_id = j.job_id
            WHERE p.provider_id = $1
            ORDER BY p.created_at DESC`,
        [req.user.id]
    );
    res.json(proposals.rows);
});