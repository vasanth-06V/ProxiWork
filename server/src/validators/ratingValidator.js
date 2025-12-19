const Joi = require('joi');

const ratingSchema = Joi.object({
  score: Joi.number().integer().min(1).max(5).required().messages({
    'number.min': 'Rating must be at least 1 star',
    'number.max': 'Rating cannot exceed 5 stars',
    'any.required': 'Score is required'
  }),
  comment: Joi.string().optional().allow('').max(500)
});

module.exports = { ratingSchema };