// server/src/api/routes/projectRoutes.js
const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middleware/authMiddleware');
const projectController = require('../controllers/projectController');

// Get all active projects (conversations) for the user
router.get('/', authMiddleware, projectController.getUserProjects);

// @route   GET /api/projects/:projectId/messages
// @desc    Get all messages for a specific project chat
// @access  Private
router.get(
  '/:projectId/messages',
  authMiddleware,
  projectController.getProjectMessages
);

module.exports = router;

