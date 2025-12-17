// server/src/middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
    // Log the error stack for debugging (only in dev/test, ideally)
    console.error("🔥 Error:", err.stack);

    // Default status code to 500 if not specified
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Server Error';

    res.status(statusCode).json({
        msg: message,
        // Include stack trace only if not in production for safety
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;