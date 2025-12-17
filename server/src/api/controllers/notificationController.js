// server/src/api/controllers/notificationController.js
const pool = require('../../config/db');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

exports.getNotifications = catchAsync(async (req, res, next) => {
    const notifications = await pool.query(
        "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
        [req.user.id]
    );
    res.json(notifications.rows);
});

exports.markAsRead = catchAsync(async (req, res, next) => {
    await pool.query(
        "UPDATE notifications SET is_read = TRUE WHERE notification_id = $1 AND user_id = $2",
        [req.params.id, req.user.id]
    );
    res.json({ msg: 'Marked as read' });
});