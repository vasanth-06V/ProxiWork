// server/src/validators/profileValidator.js
const Joi = require('joi');

const profileSchema = Joi.object({
    fullName: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Full name must be at least 2 characters',
        'any.required': 'Full name is required'
    }),
    tagline: Joi.string().max(150).optional().allow(''),
    bio: Joi.string().max(1000).optional().allow(''),
    skills: Joi.array().items(Joi.string()).optional(),
    profile_image_url: Joi.string().uri().optional().allow(''),
    date_of_birth: Joi.date().optional().allow('', null),
    phone_number: Joi.string().max(20).optional().allow(''),
    linkedin_url: Joi.string().uri().optional().allow(''),
    github_url: Joi.string().uri().optional().allow('')
});

module.exports = { profileSchema };
