// server/src/api/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../../middleware/validateMiddleware'); // Import Middleware
const { registerSchema, loginSchema } = require('../../validators/authValidator'); // Import Schemas

// @route   POST /api/auth/register
// Validate input -> Then run controller
router.post('/register', validate(registerSchema), authController.register);

// @route   POST /api/auth/login
// Validate input -> Then run controller
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;