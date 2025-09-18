import logger from '#config/logger.js';

const errorHandler = (err, _req, res, _next) => {
  logger.error(err);
  const statusCode = err.statusCode || 500;
  res
    .status(statusCode)
    .json({ message: err.message || 'Internal Server Error' });
};

export default errorHandler;
