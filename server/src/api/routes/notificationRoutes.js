// server/src/api/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// @route   GET /api/notifications
// @desc    Get all notifications for the logged-in user
// @access  Private
router.get('/', authMiddleware, notificationController.getNotifications);

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', authMiddleware, notificationController.markAsRead);

module.exports = router;
