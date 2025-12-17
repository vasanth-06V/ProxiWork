// server/src/api/controllers/projectController.js
const pool = require('../../config/db');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

exports.getProjectMessages = catchAsync(async (req, res, next) => {
    const { projectId } = req.params;
    const userId = req.user.id;

    const projectCheck = await pool.query(
        `SELECT j.client_id, p.provider_id FROM jobs j
            JOIN proposals p ON j.job_id = p.job_id
            WHERE j.job_id = $1 AND p.status = 'accepted'`,
        [projectId]
    );

    if (projectCheck.rows.length === 0) {
        return next(new AppError('Project not found or not in progress.', 404));
    }

    const { client_id, provider_id } = projectCheck.rows[0];
    if (userId !== client_id && userId !== provider_id) {
        return next(new AppError('Forbidden: You are not part of this project.', 403));
    }

    const messages = await pool.query(
        `SELECT m.*, pr.full_name AS sender_name 
            FROM messages m
            JOIN profiles pr ON m.sender_id = pr.user_id
            WHERE m.project_id = $1 
            ORDER BY m.created_at ASC`,
        [projectId]
    );

    res.json(messages.rows);
});