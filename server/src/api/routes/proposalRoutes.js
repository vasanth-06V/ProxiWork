// server/src/api/routes/proposalRoutes.js
const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middleware/authMiddleware');
const proposalController = require('../controllers/proposalController');

// @route   GET /api/proposals/my-proposals
// @desc    Get all proposals submitted by the logged-in provider
// @access  Private (Providers only)
// NOTE: This must come BEFORE /:id routes to avoid 'my-proposals' being treated as an :id param
router.get('/my-proposals', authMiddleware, proposalController.getMyProposals);

// @route   POST /api/proposals/:id/accept
// @desc    Accept a proposal (pending or shortlisted)
// @access  Private (Job owner / Client only)
router.post('/:id/accept', authMiddleware, proposalController.acceptProposal);

// @route   POST /api/proposals/:id/reject
// @desc    Reject a specific proposal (pending or shortlisted)
// @access  Private (Job owner / Client only)
router.post('/:id/reject', authMiddleware, proposalController.rejectProposal);

// @route   POST /api/proposals/:id/shortlist
// @desc    Shortlist a proposal (pending → shortlisted)
// @access  Private (Job owner / Client only)
router.post('/:id/shortlist', authMiddleware, proposalController.shortlistProposal);

// @route   POST /api/proposals/:id/withdraw
// @desc    Provider withdraws their own proposal (pending or shortlisted only)
// @access  Private (Proposal owner / Provider only)
router.post('/:id/withdraw', authMiddleware, proposalController.withdrawProposal);

// @route   PUT /api/proposals/:id/view
// @desc    Mark a proposal as viewed by the client (first view only)
// @access  Private (Job owner / Client only)
router.put('/:id/view', authMiddleware, proposalController.viewProposal);

module.exports = router;
