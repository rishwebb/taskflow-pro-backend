const express = require('express');

const userController = require('../controllers/userController');
const { authenticate, requireVerifiedEmail } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  updateNotificationPreferencesRules,
  updatePreferencesRules,
  updateProfileRules
} = require('../validators/userValidators');

const router = express.Router();

router.use(authenticate, requireVerifiedEmail);

router.get('/profile', userController.getProfile);
router.patch('/profile', updateProfileRules, validate, userController.updateProfile);
router.put('/profile', updateProfileRules, validate, userController.updateProfile);

router.get('/preferences', userController.getPreferences);
router.patch('/preferences', updatePreferencesRules, validate, userController.updatePreferences);
router.put('/preferences', updatePreferencesRules, validate, userController.updatePreferences);

router.get('/notification-preferences', userController.getNotificationPreferences);
router.patch(
  '/notification-preferences',
  updateNotificationPreferencesRules,
  validate,
  userController.updateNotificationPreferences
);
router.put(
  '/notification-preferences',
  updateNotificationPreferencesRules,
  validate,
  userController.updateNotificationPreferences
);

module.exports = router;
