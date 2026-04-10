// server/src/validators/complaintValidator.js
const Joi = require('joi');

const complaintSchema = Joi.object({
    subject: Joi.string().min(5).max(100).required().messages({
        'string.min': 'Subject must be at least 5 characters',
        'any.required': 'Subject is required'
    }),
    description: Joi.string().min(30).required().messages({
        'string.min': 'Description must be at least 30 characters',
        'any.required': 'Description is required'
    }),
    evidence_url: Joi.string().uri().optional().allow('').messages({
        'string.uri': 'Evidence URL must be a valid URL'
    })
});

module.exports = { complaintSchema };
