const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: require('path').join(__dirname, '..', '.env') });

const User = require('../src/models/User');
const Task = require('../src/models/Task');
const Notification = require('../src/models/Notification');

const users = [
  {
    name: 'TaskFlow Test User',
    email: 'test@taskflowpro.com',
    phone: '9999999991',
    password: 'Test@123',
    role: 'user'
  },
  {
    name: 'TaskFlow Admin',
    email: 'admin@taskflowpro.com',
    phone: '9999999992',
    password: 'Admin@123',
    role: 'admin'
  }
];

const main = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  for (const entry of users) {
    const existing = await User.findOne({ email: entry.email });

    if (existing) {
      await Task.deleteMany({ userId: existing._id });
      await Notification.deleteMany({ userId: existing._id });

      existing.name = entry.name;
      existing.phone = entry.phone;
      existing.role = entry.role;
      existing.password = entry.password;
      existing.emailVerified = true;
      existing.emailVerificationToken = undefined;
      existing.emailVerificationExpires = undefined;
      existing.passwordResetToken = undefined;
      existing.passwordResetExpires = undefined;
      existing.lastLoginAt = null;
      await existing.save();
      console.log(`Updated ${entry.role} user: ${entry.email}`);
      continue;
    }

      await User.create({
        ...entry,
        emailVerified: true
      });
    console.log(`Created ${entry.role} user: ${entry.email}`);
  }

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
