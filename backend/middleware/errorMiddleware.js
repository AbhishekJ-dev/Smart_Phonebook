import logger from '../utils/logger.js';

// Global Express Error Boundary Middleware
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  logger.error(`Exception triggered during ${req.method} ${req.url}:`, err);
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected error occurred on the server.',
    // Hide call stack details in production to prevent leakage
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    errors: err.errors || null
  });
};

export default errorHandler;
