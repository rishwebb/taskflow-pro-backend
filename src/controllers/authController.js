const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../utils/email');
const { createError } = require('../utils/httpError');
const { createOpaqueToken, hashToken, signAccessToken } = require('../utils/tokens');
const env = require('../config/env');

const verificationExpiry = () => new Date(Date.now() + 24 * 60 * 60 * 1000);
const resetExpiry = () => new Date(Date.now() + 60 * 60 * 1000);

const authPayload = (user) => ({
  accessToken: signAccessToken(user),
  token: signAccessToken(user),
  user: user.toClient()
});

const register = asyncHandler(async (req, res) => {
  const { name, email, phone = '', password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError(409, 'Email already registered');
  }

  const { token, hashedToken } = createOpaqueToken();

  const user = await User.create({
    name,
    email,
    phone,
    password,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: verificationExpiry()
  });

  await sendVerificationEmail(user, token);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify your email.',
    data: authPayload(user)
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw createError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw createError(401, 'Invalid email or password');
  }

  if (env.emailVerificationRequired && !user.emailVerified) {
    throw createError(403, 'Email verification is required before login');
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.json({
    success: true,
    message: 'Login successful',
    data: authPayload(user)
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.body.token || req.params.token;
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: new Date() }
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) {
    throw createError(400, 'Invalid or expired verification token');
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully',
    data: { user: user.toClient() }
  });
});

const resendVerification = asyncHandler(async (req, res) => {
  if (req.user.emailVerified) {
    return res.json({
      success: true,
      message: 'Email is already verified',
      data: { user: req.user.toClient() }
    });
  }

  const { token, hashedToken } = createOpaqueToken();
  req.user.emailVerificationToken = hashedToken;
  req.user.emailVerificationExpires = verificationExpiry();
  await req.user.save();

  await sendVerificationEmail(req.user, token);

  return res.json({
    success: true,
    message: 'Verification email sent'
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');

  if (user) {
    const { token, hashedToken } = createOpaqueToken();
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = resetExpiry();
    await user.save({ validateBeforeSave: false });
    await sendPasswordResetEmail(user, token);
  }

  res.json({
    success: true,
    message: 'If an account exists for this email, password reset instructions have been sent.'
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() }
  }).select('+password +passwordResetToken +passwordResetExpires');

  if (!user) {
    throw createError(400, 'Invalid or expired reset token');
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful',
    data: authPayload(user)
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user.toClient() }
  });
});

const logout = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    message: 'Logout successful. Discard the JWT on the client.'
  });
});

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
  logout
};
