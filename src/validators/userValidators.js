const { body } = require('express-validator');

const updateProfileRules = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2 to 80 characters'),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 30 }).withMessage('Phone is too long')
];

const updatePreferencesRules = [
  body('theme').optional().isIn(['system', 'light', 'dark']).withMessage('Theme must be system, light, or dark'),
  body('language').optional().trim().isLength({ min: 2, max: 12 }).withMessage('Language must be 2 to 12 characters'),
  body('timezone').optional().trim().isLength({ min: 1, max: 80 }).withMessage('Timezone must be 1 to 80 characters'),
  body('weekStartsOn').optional().isIn(['sunday', 'monday']).withMessage('weekStartsOn must be sunday or monday')
];

const updateNotificationPreferencesRules = [
  body('pushEnabled').optional().isBoolean().withMessage('pushEnabled must be a boolean').toBoolean(),
  body('taskReminders').optional().isBoolean().withMessage('taskReminders must be a boolean').toBoolean(),
  body('taskCompletedAlerts')
    .optional()
    .isBoolean()
    .withMessage('taskCompletedAlerts must be a boolean')
    .toBoolean(),
  body('highPriorityAlerts').optional().isBoolean().withMessage('highPriorityAlerts must be a boolean').toBoolean(),
  body('dailySummary').optional().isBoolean().withMessage('dailySummary must be a boolean').toBoolean(),
  body('emailUpdates').optional().isBoolean().withMessage('emailUpdates must be a boolean').toBoolean()
];

module.exports = {
  updateProfileRules,
  updatePreferencesRules,
  updateNotificationPreferencesRules
};
