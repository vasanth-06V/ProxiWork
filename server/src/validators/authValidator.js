// server/src/validators/authValidator.js
const Joi = require('joi');

// Rule for Registration
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  // Only allow specific roles
  role: Joi.string().valid('client', 'provider').required().messages({
    'any.only': 'Role must be either client or provider',
    'any.required': 'Role is required'
  })
});

// Rule for Login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

module.exports = { registerSchema, loginSchema };