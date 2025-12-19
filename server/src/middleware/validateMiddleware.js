// server/src/middleware/validateMiddleware.js
const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  // AbortEarly: false ensures we get ALL errors, not just the first one
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    // Extract error messages
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return next(new AppError(errorMessage, 400));
  }

  next();
};

module.exports = validate;