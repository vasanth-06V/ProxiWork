// server/src/api/routes/proposalRoutes.js
const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middleware/authMiddleware');
const proposalController = require('../controllers/proposalController');

// @route   POST /api/proposals/:id/accept
// @desc    Accept a proposal for a job
// @access  Private (Job owner only)
router.post('/:id/accept', authMiddleware, proposalController.acceptProposal);

// @route   POST /api/proposals/:id/reject
// @desc    Reject a specific proposal
// @access  Private (Job owner only)
router.post('/:id/reject', authMiddleware, proposalController.rejectProposal);

// @route   GET /api/proposals/my-proposals
// @desc    Get all proposals submitted by the logged-in provider
// @access  Private (Providers only)
router.get('/my-proposals', authMiddleware, proposalController.getMyProposals);

module.exports = router;
