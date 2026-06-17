const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    type: {
      type: String,
      enum: ['task_created', 'task_completed', 'task_updated', 'task_deleted', 'system'],
      default: 'system'
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

notificationSchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    taskId: this.taskId ? this.taskId.toString() : null,
    title: this.title,
    message: this.message,
    type: this.type,
    read: this.read,
    readAt: this.readAt ? this.readAt.getTime() : null,
    metadata: this.metadata || {},
    createdAt: this.createdAt.getTime(),
    updatedAt: this.updatedAt.getTime()
  };
};

module.exports = mongoose.model('Notification', notificationSchema);
