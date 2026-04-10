// server/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// For login: 10 attempts per 15 minutes
exports.loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: {
        msg: 'Too many login attempts from this IP. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// For register: 5 attempts per 15 minutes
exports.registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        msg: 'Too many accounts created from this IP. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
