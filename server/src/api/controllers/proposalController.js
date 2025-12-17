// server/src/api/controllers/proposalController.js
const pool = require('../../config/db');
const { createNotification } = require('../services/notificationService');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

exports.acceptProposal = catchAsync(async (req, res, next) => {
    const { id: proposalId } = req.params;
    const loggedInUserId = req.user.id;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const proposalRes = await client.query('SELECT job_id FROM proposals WHERE proposal_id = $1', [proposalId]);
        if (proposalRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return next(new AppError('Proposal not found', 404));
        }
        const { job_id: jobId } = proposalRes.rows[0];

        const jobRes = await client.query('SELECT client_id FROM jobs WHERE job_id = $1', [jobId]);
        if (jobRes.rows.length === 0 || jobRes.rows[0].client_id !== loggedInUserId) {
            await client.query('ROLLBACK');
            return next(new AppError('Forbidden: You are not the owner of this job', 403));
        }

        await client.query("UPDATE jobs SET status = 'in_progress' WHERE job_id = $1", [jobId]);
        await client.query("UPDATE proposals SET status = 'accepted' WHERE proposal_id = $1", [proposalId]);
        await client.query("UPDATE proposals SET status = 'rejected' WHERE job_id = $1 AND proposal_id != $2", [jobId, proposalId]);

        const acceptedProposal = await client.query('SELECT provider_id FROM proposals WHERE proposal_id = $1', [proposalId]);
        const providerId = acceptedProposal.rows[0].provider_id;

        await client.query('COMMIT');
        
        createNotification(
            providerId, 
            'proposal_accepted', 
            'Your proposal has been accepted! You can now start the job.',
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

exports.rejectProposal = catchAsync(async (req, res, next) => {
    const { id: proposalId } = req.params;
    const loggedInUserId = req.user.id;

    const proposalRes = await pool.query('SELECT job_id FROM proposals WHERE proposal_id = $1', [proposalId]);
    if (proposalRes.rows.length === 0) {
        return next(new AppError('Proposal not found', 404));
    }
    const { job_id: jobId } = proposalRes.rows[0];

    const jobRes = await pool.query('SELECT client_id, status FROM jobs WHERE job_id = $1', [jobId]);
    if (jobRes.rows.length === 0 || jobRes.rows[0].client_id !== loggedInUserId) {
        return next(new AppError('Forbidden: You are not the owner of this job', 403));
    }

    if (jobRes.rows[0].status !== 'open') {
            return next(new AppError('Cannot reject proposals for jobs that are not open.', 400));
    }

    const updatedProposal = await pool.query(
        "UPDATE proposals SET status = 'rejected' WHERE proposal_id = $1 RETURNING *", 
        [proposalId]
    );

    res.json({ msg: 'Proposal rejected.', proposal: updatedProposal.rows[0] });
});

exports.getMyProposals = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'provider') {
        return next(new AppError('Forbidden: Access denied', 403));
    }

    const proposals = await pool.query(
        `SELECT p.proposal_id, p.status, p.bid_amount, p.created_at, 
                j.job_id, j.title AS job_title, j.status AS job_status
            FROM proposals p
            JOIN jobs j ON p.job_id = j.job_id
            WHERE p.provider_id = $1
            ORDER BY p.created_at DESC`,
        [req.user.id]
    );
    res.json(proposals.rows);
});