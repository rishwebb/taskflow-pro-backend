const mongoose = require('mongoose');
const { body, param, query } = require('express-validator');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const createNotificationRules = [
  body('title').trim().isLength({ min: 1, max: 160 }).withMessage('Title is required and must be under 160 characters'),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message is required and must be under 1000 characters'),
  body('type')
    .optional()
    .isIn(['task_created', 'task_completed', 'task_updated', 'task_deleted', 'system'])
    .withMessage('Invalid notification type'),
  body('taskId').optional({ nullable: true }).custom(isValidObjectId).withMessage('Invalid task id'),
  body('metadata').optional().isObject().withMessage('metadata must be an object')
];

const notificationIdRules = [
  param('id').custom(isValidObjectId).withMessage('Invalid notification id')
];

const listNotificationRules = [
  query('read').optional().isBoolean().withMessage('read must be a boolean').toBoolean(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1 to 100').toInt(),
  query('page').optional().isInt({ min: 1, max: 10000 }).withMessage('page must be positive').toInt()
];

module.exports = {
  createNotificationRules,
  notificationIdRules,
  listNotificationRules
};
