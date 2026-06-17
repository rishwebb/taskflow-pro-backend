const express = require('express');

const notificationController = require('../controllers/notificationController');
const { authenticate, requireVerifiedEmail } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createNotificationRules,
  listNotificationRules,
  notificationIdRules
} = require('../validators/notificationValidators');

const router = express.Router();

router.use(authenticate, requireVerifiedEmail);

router.get('/', listNotificationRules, validate, notificationController.listNotifications);
router.post('/', createNotificationRules, validate, notificationController.createNotification);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationIdRules, validate, notificationController.markAsRead);

module.exports = router;
