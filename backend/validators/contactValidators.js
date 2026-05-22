import { body } from 'express-validator';

export const contactValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Contact name is required')
    .isLength({ max: 150 })
    .withMessage('Contact name cannot exceed 150 characters'),
    
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 5, max: 30 })
    .withMessage('Phone number must be between 5 and 30 characters long'),
    
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('company')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage('Company name cannot exceed 150 characters'),
    
  body('address')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),
    
  body('tags')
    .optional()
    .custom((value) => {
      // Accept arrays directly OR JSON-stringified arrays sent from FormData multipart
      if (Array.isArray(value)) return true;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) return true;
        } catch {
          // fall through to error below
        }
      }
      throw new Error('Tags must be provided as an array of strings');
    }),
    
  body('favorite')
    .optional()
    .custom((value) => {
      // Accept actual booleans AND string 'true'/'false' values sent via FormData
      if (value === true || value === false) return true;
      if (value === 'true' || value === 'false') return true;
      throw new Error('Favorite status must be a boolean value');
    })
];
