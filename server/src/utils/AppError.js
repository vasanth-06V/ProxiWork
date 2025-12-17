// server/src/utils/AppError.js

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Marks error as known/expected vs system crash

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;