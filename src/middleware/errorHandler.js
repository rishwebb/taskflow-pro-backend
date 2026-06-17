const env = require('../config/env');

const duplicateKeyMessage = (error) => {
  const field = Object.keys(error.keyPattern || {})[0] || 'field';
  return `${field} already exists`;
};

const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let details = error.details;

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message
    }));
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource id';
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = duplicateKeyMessage(error);
  }

  if (message === 'Not allowed by CORS') {
    statusCode = 403;
  }

  const payload = {
    success: false,
    message
  };

  if (details) payload.errors = details;
  if (env.nodeEnv !== 'production') payload.stack = error.stack;

  res.status(statusCode).json(payload);
};

module.exports = errorHandler;
