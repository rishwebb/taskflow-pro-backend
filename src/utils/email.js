const nodemailer = require('nodemailer');

const env = require('../config/env');

const hasSmtpConfig = () => Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);

const createTransport = () => {
  if (!hasSmtpConfig()) return null;

  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass
    }
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transport = createTransport();

  if (!transport) {
    console.log(`Email skipped because SMTP is not configured. To: ${to}. Subject: ${subject}. ${text}`);
    return { skipped: true };
  }

  return transport.sendMail({
    from: env.smtp.from,
    to,
    subject,
    text,
    html
  });
};

const sendVerificationEmail = async (user, token) => {
  const webUrl = `${env.frontendUrl.replace(/\/$/, '')}/verify-email?token=${token}`;
  const androidUrl = `${env.androidAppUrl.replace(/\/$/, '')}/verify-email?token=${token}`;

  return sendEmail({
    to: user.email,
    subject: 'Verify your TaskFlow Pro email',
    text: `Verify your TaskFlow Pro account: ${webUrl}\nAndroid deep link: ${androidUrl}`,
    html: `
      <p>Hi ${user.name},</p>
      <p>Verify your TaskFlow Pro account using this link:</p>
      <p><a href="${webUrl}">Verify email</a></p>
      <p>If you are on Android, open: ${androidUrl}</p>
      <p>This link expires in 24 hours.</p>
    `
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const webUrl = `${env.frontendUrl.replace(/\/$/, '')}/reset-password?token=${token}`;
  const androidUrl = `${env.androidAppUrl.replace(/\/$/, '')}/reset-password?token=${token}`;

  return sendEmail({
    to: user.email,
    subject: 'Reset your TaskFlow Pro password',
    text: `Reset your password: ${webUrl}\nAndroid deep link: ${androidUrl}`,
    html: `
      <p>Hi ${user.name},</p>
      <p>Reset your TaskFlow Pro password using this link:</p>
      <p><a href="${webUrl}">Reset password</a></p>
      <p>If you are on Android, open: ${androidUrl}</p>
      <p>This link expires in 1 hour.</p>
    `
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
