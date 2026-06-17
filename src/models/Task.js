const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 2000
    },
    dueDate: {
      type: Date,
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ userId: 1, completed: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });

taskSchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    title: this.title,
    description: this.description,
    dueDate: this.dueDate.getTime(),
    priority: this.priority,
    completed: this.completed,
    completedAt: this.completedAt ? this.completedAt.getTime() : null,
    userId: this.userId.toString(),
    createdAt: this.createdAt.getTime(),
    updatedAt: this.updatedAt.getTime()
  };
};

module.exports = mongoose.model('Task', taskSchema);
