// server/src/api/services/notificationService.js
const pool = require('../../config/db');

// io is passed in so we can push real-time events to the user
const createNotification = async (io, userId, type, message, link) => {
    try {
        await pool.query(
            `INSERT INTO notifications (user_id, type, message, link) 
             VALUES ($1, $2, $3, $4)`,
            [userId, type, message, link]
        );

        // Push real-time event to the user's personal socket room
        if (io) {
            io.to(`user_${userId}`).emit('new_notification', {
                type,
                message,
                link,
                is_read: false,
                created_at: new Date().toISOString()
            });
        }

        console.log(`Notification created for user ${userId}: ${type}`);
    } catch (err) {
        console.error('Failed to create notification:', err);
        // We don't throw so main transaction isn't broken
    }
};

module.exports = { createNotification };
