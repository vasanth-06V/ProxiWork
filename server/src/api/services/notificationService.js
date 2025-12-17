// server/src/api/services/notificationService.js
const pool = require('../../config/db');

const createNotification = async (userId, type, message, link) => {
    try {
        await pool.query(
            `INSERT INTO notifications (user_id, type, message, link) 
             VALUES ($1, $2, $3, $4)`,
            [userId, type, message, link]
        );
        console.log(`Notification created for user ${userId}: ${type}`);
    } catch (err) {
        console.error("Failed to create notification:", err);
        // We don't throw error here to avoid breaking the main transaction
    }
};

module.exports = { createNotification };