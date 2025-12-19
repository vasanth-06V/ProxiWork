const Joi = require('joi');

const submitProposalSchema = Joi.object({
  cover_letter: Joi.string().min(20).required().messages({
    'string.min': 'Cover letter must be at least 20 characters long',
    'any.required': 'Cover letter is required'
  }),
  bid_amount: Joi.number().positive().required().messages({
    'number.positive': 'Bid amount must be a positive number',
    'any.required': 'Bid amount is required'
  })
});

module.exports = { submitProposalSchema };