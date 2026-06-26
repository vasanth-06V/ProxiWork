const Joi = require('joi');

const createJobSchema = Joi.object({
  title: Joi.string().min(5).max(100).required().messages({
    'string.min': 'Title must be at least 5 characters',
    'any.required': 'Title is required'
  }),
  description: Joi.string().min(20).required().messages({
    'string.min': 'Description must be at least 20 characters',
    'any.required': 'Description is required'
  }),
  budget: Joi.number().positive().required().messages({
    'number.positive': 'Budget must be a positive number',
    'any.required': 'Budget is required'
  }),
  deadline: Joi.date().greater('now').optional().messages({
    'date.greater': 'Deadline must be in the future'
  }),
  job_questions: Joi.array()
    .items(Joi.string().max(150))
    .max(5)
    .optional()
    .messages({
      'array.max': 'You can add a maximum of 5 proposal questions'
    })
});

const updateJobSchema = Joi.object({
  title: Joi.string().min(5).max(100),
  description: Joi.string().min(20),
  budget: Joi.number().positive(),
  deadline: Joi.date().optional(),
  job_questions: Joi.array()
    .items(Joi.string().max(150))
    .max(5)
    .optional()
}).min(1); // Ensure at least one field is being updated

module.exports = { createJobSchema, updateJobSchema };