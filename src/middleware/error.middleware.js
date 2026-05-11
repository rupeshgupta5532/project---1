const logger = require('../config/logger');
const config = require('../config');

function notFound(req, res) {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  logger.error(`${req.method} ${req.originalUrl} — ${err.message}${err.stack ? `\n${err.stack}` : ''}`);

  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON body' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id format' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate field value' });
  }

  console.log("global error handler executed");

  const status = err.statusCode || err.status || 500;
  const exposeMessage = status < 500;
  const message = exposeMessage ? err.message : 'Internal server error';
  res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
