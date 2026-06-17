const mongoose = require('mongoose');
const { body, param, query } = require('express-validator');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const dueDateRule = body('dueDate')
  .custom((value) => {
    if (typeof value === 'number') return Number.isFinite(value);
    if (typeof value === 'string') return !Number.isNaN(Date.parse(value));
    return false;
  })
  .withMessage('dueDate must be a millisecond timestamp or ISO date string');

const createTaskRules = [
  body('title').trim().isLength({ min: 1, max: 160 }).withMessage('Title is required and must be under 160 characters'),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }).withMessage('Description is too long'),
  body('priority').optional().toLowerCase().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  dueDateRule
];

const updateTaskRules = [
  param('id').custom(isValidObjectId).withMessage('Invalid task id'),
  body('title').optional().trim().isLength({ min: 1, max: 160 }).withMessage('Title must be under 160 characters'),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }).withMessage('Description is too long'),
  body('priority').optional().toLowerCase().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('completed').optional().isBoolean().withMessage('completed must be a boolean').toBoolean(),
  body('dueDate')
    .optional()
    .custom((value) => {
      if (typeof value === 'number') return Number.isFinite(value);
      if (typeof value === 'string') return !Number.isNaN(Date.parse(value));
      return false;
    })
    .withMessage('dueDate must be a millisecond timestamp or ISO date string')
];

const taskIdRules = [
  param('id').custom(isValidObjectId).withMessage('Invalid task id')
];

const listTaskRules = [
  query('completed').optional().isBoolean().withMessage('completed must be a boolean').toBoolean(),
  query('priority').optional().toLowerCase().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1 to 100').toInt(),
  query('page').optional().isInt({ min: 1, max: 10000 }).withMessage('page must be positive').toInt()
];

module.exports = {
  createTaskRules,
  updateTaskRules,
  taskIdRules,
  listTaskRules
};
