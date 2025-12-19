const pool = require('../../config/db');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

// 1. Get messages for a specific chat room
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

// 2. Get list of all active projects (conversations) for the user
exports.getUserProjects = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    // Added DISTINCT ON (j.job_id) to prevent duplicates
    const projects = await pool.query(
        `SELECT DISTINCT ON (j.job_id) 
                j.job_id, j.title, j.status, j.created_at,
                c.full_name AS client_name, c.user_id AS client_id,
                p.full_name AS provider_name, p.user_id AS provider_id
         FROM jobs j
         JOIN proposals prop ON j.job_id = prop.job_id AND prop.status = 'accepted'
         JOIN profiles c ON j.client_id = c.user_id
         JOIN profiles p ON prop.provider_id = p.user_id
         WHERE j.client_id = $1 OR prop.provider_id = $1
         ORDER BY j.job_id, j.created_at DESC`, 
        [userId]
    );

    res.json(projects.rows);
});