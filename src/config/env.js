const dotenv = require('dotenv');

dotenv.config();

const required = ['MONGODB_URI', 'JWT_SECRET'];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0 && process.env.NODE_ENV !== 'test') {
  console.warn(`Missing required environment variables: ${missing.join(', ')}`);
}

const parseList = (value, fallback = []) => {
  if (!value) return fallback;
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  androidAppUrl: process.env.ANDROID_APP_URL || 'taskflowpro://auth',
  corsOrigin: [
    ...parseList(process.env.CORS_ORIGIN, ['http://localhost:5173']),
    'https://admin-taskflow-pro.netlify.app',
    'https://taskflow-ltd.netlify.app'
  ],
  emailVerificationRequired: process.env.EMAIL_VERIFICATION_REQUIRED === 'true',
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || 'TaskFlow Pro <no-reply@taskflowpro.com>'
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 100),
    authMax: Number(process.env.AUTH_RATE_LIMIT_MAX || 10)
  }
};

module.exports = env;
