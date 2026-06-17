const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const booleanPreferenceSchema = new mongoose.Schema(
  {
    theme: {
      type: String,
      enum: ['system', 'light', 'dark'],
      default: 'system'
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    weekStartsOn: {
      type: String,
      enum: ['sunday', 'monday'],
      default: 'monday'
    }
  },
  { _id: false }
);

const notificationPreferenceSchema = new mongoose.Schema(
  {
    pushEnabled: {
      type: Boolean,
      default: true
    },
    taskReminders: {
      type: Boolean,
      default: true
    },
    taskCompletedAlerts: {
      type: Boolean,
      default: true
    },
    highPriorityAlerts: {
      type: Boolean,
      default: true
    },
    dailySummary: {
      type: Boolean,
      default: false
    },
    emailUpdates: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      select: false
    },
    emailVerificationExpires: {
      type: Date,
      select: false
    },
    passwordResetToken: {
      type: String,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      select: false
    },
    preferences: {
      type: booleanPreferenceSchema,
      default: () => ({})
    },
    notificationPreferences: {
      type: notificationPreferenceSchema,
      default: () => ({})
    },
    lastLoginAt: Date
  },
  {
    timestamps: true,
    versionKey: false
  }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    uid: this._id.toString(),
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    emailVerified: this.emailVerified,
    preferences: this.preferences,
    notificationPreferences: this.notificationPreferences,
    createdAt: this.createdAt.getTime(),
    updatedAt: this.updatedAt.getTime(),
    lastLoginAt: this.lastLoginAt ? this.lastLoginAt.getTime() : null
  };
};

module.exports = mongoose.model('User', userSchema);
