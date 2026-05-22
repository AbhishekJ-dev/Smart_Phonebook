import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';

/**
 * Validator middleware checking express-validator results
 */
export const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Request input validation failed on ${req.method} ${req.url}`);
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct your inputs.',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

export default validateFields;
