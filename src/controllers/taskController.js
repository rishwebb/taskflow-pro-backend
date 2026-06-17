const Notification = require('../models/Notification');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const { createError } = require('../utils/httpError');

const toDate = (value) => {
  if (typeof value === 'number') return new Date(value);
  return new Date(value);
};

const notify = async ({ userId, taskId, title, message, type, metadata = {} }) => {
  const notification = await Notification.create({
    userId,
    taskId,
    title,
    message,
    type,
    metadata
  });

  return notification.toClient();
};

const getOwnedTask = async (userId, taskId) => {
  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) {
    throw createError(404, 'Task not found');
  }
  return task;
};

const getTask = asyncHandler(async (req, res) => {
  const task = await getOwnedTask(req.user._id, req.params.id);

  res.json({
    success: true,
    data: { task: task.toClient() }
  });
});

const listTasks = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 50;
  const skip = (page - 1) * limit;
  const filter = { userId: req.user._id };

  if (typeof req.query.completed === 'boolean') filter.completed = req.query.completed;
  if (req.query.priority) filter.priority = req.query.priority;

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Task.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: {
      tasks: tasks.map((task) => task.toClient()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({
    title: req.body.title,
    description: req.body.description || '',
    dueDate: toDate(req.body.dueDate),
    priority: (req.body.priority || 'medium').toLowerCase(),
    userId: req.user._id
  });

  await notify({
    userId: req.user._id,
    taskId: task._id,
    title: task.priority === 'high' ? 'High Priority Task Added' : 'Task Added',
    message: `You created "${task.title}"`,
    type: 'task_created',
    metadata: { priority: task.priority }
  });

  res.status(201).json({
    success: true,
    message: 'Task created',
    data: { task: task.toClient() }
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await getOwnedTask(req.user._id, req.params.id);
  const wasCompleted = task.completed;
  const fields = ['title', 'description', 'priority'];

  fields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      task[field] = field === 'priority' ? req.body[field].toLowerCase() : req.body[field];
    }
  });

  if (Object.prototype.hasOwnProperty.call(req.body, 'dueDate')) {
    task.dueDate = toDate(req.body.dueDate);
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'completed')) {
    task.completed = req.body.completed;
    task.completedAt = req.body.completed ? task.completedAt || new Date() : null;
  }

  await task.save();

  await notify({
    userId: req.user._id,
    taskId: task._id,
    title: !wasCompleted && task.completed ? 'Task Completed' : 'Task Updated',
    message: !wasCompleted && task.completed ? `You finished "${task.title}"` : `You updated "${task.title}"`,
    type: !wasCompleted && task.completed ? 'task_completed' : 'task_updated'
  });

  res.json({
    success: true,
    message: 'Task updated',
    data: { task: task.toClient() }
  });
});

const completeTask = asyncHandler(async (req, res) => {
  const task = await getOwnedTask(req.user._id, req.params.id);

  task.completed = true;
  task.completedAt = task.completedAt || new Date();
  await task.save();

  await notify({
    userId: req.user._id,
    taskId: task._id,
    title: 'Task Completed',
    message: `You finished "${task.title}"`,
    type: 'task_completed'
  });

  res.json({
    success: true,
    message: 'Task completed',
    data: { task: task.toClient() }
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await getOwnedTask(req.user._id, req.params.id);
  await task.deleteOne();

  await notify({
    userId: req.user._id,
    taskId: task._id,
    title: 'Task Deleted',
    message: `You deleted "${task.title}"`,
    type: 'task_deleted',
    metadata: { taskTitle: task.title }
  });

  res.json({
    success: true,
    message: 'Task deleted'
  });
});

const getTaskStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const [summary] = await Task.aggregate([
    { $match: { userId } },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: { $sum: { $cond: ['$completed', 1, 0] } },
              active: { $sum: { $cond: ['$completed', 0, 1] } },
              overdue: {
                $sum: {
                  $cond: [{ $and: [{ $lt: ['$dueDate', now] }, { $eq: ['$completed', false] }] }, 1, 0]
                }
              },
              dueToday: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $gte: ['$dueDate', startOfToday] },
                        { $lt: ['$dueDate', endOfToday] },
                        { $eq: ['$completed', false] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              }
            }
          }
        ],
        byPriority: [
          {
            $group: {
              _id: '$priority',
              count: { $sum: 1 }
            }
          }
        ]
      }
    }
  ]);

  const totals = summary.totals[0] || {
    total: 0,
    completed: 0,
    active: 0,
    overdue: 0,
    dueToday: 0
  };

  const byPriority = { low: 0, medium: 0, high: 0 };
  summary.byPriority.forEach((item) => {
    byPriority[item._id] = item.count;
  });

  res.json({
    success: true,
    data: {
      stats: {
        total: totals.total,
        completed: totals.completed,
        active: totals.active,
        overdue: totals.overdue,
        dueToday: totals.dueToday,
        completionRate: totals.total > 0 ? Math.round((totals.completed / totals.total) * 100) : 0,
        byPriority
      }
    }
  });
});

module.exports = {
  getTask,
  listTasks,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
  getTaskStats
};
