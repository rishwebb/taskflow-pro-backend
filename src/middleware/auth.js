const jwt = require('jsonwebtoken');

const env = require('../config/env');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { createError } = require('../utils/httpError');

const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw createError(401, 'Authentication token is required');
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (_error) {
    throw createError(401, 'Invalid or expired authentication token');
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw createError(401, 'User no longer exists');
  }

  req.user = user;
  next();
});

const requireVerifiedEmail = (req, _res, next) => {
  if (env.emailVerificationRequired && !req.user.emailVerified) {
    return next(createError(403, 'Email verification is required'));
  }
  return next();
};

module.exports = {
  authenticate,
  requireVerifiedEmail
};
