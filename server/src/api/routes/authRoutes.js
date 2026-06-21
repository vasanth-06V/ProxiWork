// server/src/api/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../../middleware/validateMiddleware');
const { registerSchema, loginSchema } = require('../../validators/authValidator');
const { loginLimiter, registerLimiter } = require('../../middleware/rateLimiter');
const authMiddleware = require('../../middleware/authMiddleware');

// @route   POST /api/auth/register
router.post('/register', registerLimiter, validate(registerSchema), authController.register);

// @route   POST /api/auth/login
router.post('/login', loginLimiter, validate(loginSchema), authController.login);

// @route   PUT /api/auth/change-password
router.put('/change-password', authMiddleware, authController.changePassword);

// @route   DELETE /api/auth/delete-account
router.delete('/delete-account', authMiddleware, authController.deleteAccount);

module.exports = router;