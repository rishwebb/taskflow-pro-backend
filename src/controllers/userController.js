const asyncHandler = require('../utils/asyncHandler');

const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone'];

  allowed.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      req.user[field] = req.body[field];
    }
  });

  await req.user.save();

  res.json({
    success: true,
    message: 'Profile updated',
    data: { user: req.user.toClient() }
  });
});

const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user.toClient() }
  });
});

const getPreferences = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { preferences: req.user.preferences }
  });
});

const updatePreferences = asyncHandler(async (req, res) => {
  req.user.preferences = {
    ...req.user.preferences.toObject(),
    ...req.body
  };

  await req.user.save();

  res.json({
    success: true,
    message: 'Preferences updated',
    data: { preferences: req.user.preferences }
  });
});

const getNotificationPreferences = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { notificationPreferences: req.user.notificationPreferences }
  });
});

const updateNotificationPreferences = asyncHandler(async (req, res) => {
  req.user.notificationPreferences = {
    ...req.user.notificationPreferences.toObject(),
    ...req.body
  };

  await req.user.save();

  res.json({
    success: true,
    message: 'Notification preferences updated',
    data: { notificationPreferences: req.user.notificationPreferences }
  });
});

module.exports = {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  getNotificationPreferences,
  updateNotificationPreferences
};
