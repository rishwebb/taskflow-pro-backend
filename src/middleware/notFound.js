const { createError } = require('../utils/httpError');

const notFound = (req, _res, next) => {
  next(createError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = notFound;
