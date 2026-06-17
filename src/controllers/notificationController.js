const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { createError } = require('../utils/httpError');

const listNotifications = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 50;
  const skip = (page - 1) * limit;
  const filter = { userId: req.user._id };

  if (typeof req.query.read === 'boolean') filter.read = req.query.read;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId: req.user._id, read: false })
  ]);

  res.json({
    success: true,
    data: {
      notifications: notifications.map((notification) => notification.toClient()),
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const createNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.create({
    userId: req.user._id,
    taskId: req.body.taskId || null,
    title: req.body.title,
    message: req.body.message,
    type: req.body.type || 'system',
    metadata: req.body.metadata || {}
  });

  res.status(201).json({
    success: true,
    message: 'Notification stored',
    data: { notification: notification.toClient() }
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!notification) {
    throw createError(404, 'Notification not found');
  }

  notification.read = true;
  notification.readAt = notification.readAt || new Date();
  await notification.save();

  res.json({
    success: true,
    message: 'Notification marked as read',
    data: { notification: notification.toClient() }
  });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { userId: req.user._id, read: false },
    { $set: { read: true, readAt: new Date() } }
  );

  res.json({
    success: true,
    message: 'Notifications marked as read',
    data: { modifiedCount: result.modifiedCount }
  });
});

module.exports = {
  listNotifications,
  createNotification,
  markAsRead,
  markAllAsRead
};
