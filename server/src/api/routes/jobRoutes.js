// server/src/api/routes/jobRoutes.js
const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middleware/authMiddleware');
const jobController = require('../controllers/jobController');

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private (Clients only)
router.post('/', authMiddleware, jobController.createJob);

// @route   GET /api/jobs/my-jobs
// @desc    Get all jobs posted by the logged-in client
// @access  Private (Clients only)
router.get('/my-jobs', authMiddleware, jobController.getMyJobs);

// @route   GET /api/jobs
// @desc    Get all open job postings
// @access  Public
router.get('/', jobController.getAllJobs);

// @route   GET /api/jobs/:id
// @desc    Get a single job by its ID
// @access  Public
router.get('/:id', jobController.getJobById);

// @route   GET /api/jobs/:id/proposals
// @desc    Get all proposals for a specific job
// @access  Private (Job owner only)
router.get('/:id/proposals', authMiddleware, jobController.getProposalsForJob);

// @route   POST /api/jobs/:id/propose
// @desc    Submit a proposal for a specific job
// @access  Private (Providers only)
router.post('/:id/propose', authMiddleware, jobController.submitProposal);

// @route   POST /api/jobs/:id/submit
// @desc    Provider submits work for review
// @access  Private (Assigned Provider only)
router.post('/:id/submit', authMiddleware, jobController.submitWork);

// @route   POST /api/jobs/:id/complete
// @desc    Client marks job as complete
// @access  Private (Job owner only)
router.post('/:id/complete', authMiddleware, jobController.completeJob);

// @route   PUT /api/jobs/:id
// @desc    Update a job posting
// @access  Private (Job owner only)
router.put('/:id', authMiddleware, jobController.updateJob);

// @route   DELETE /api/jobs/:id
// @desc    Delete a job posting
// @access  Private (Job owner only)
router.delete('/:id', authMiddleware, jobController.deleteJob);

module.exports = router;
