import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

export const protect = async (req, res, next) => {
  let token;

  // Retrieve token from Authorization headers (Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    logger.warn('Unauthenticated access attempt: No Bearer token provided.');
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token is missing.'
    });
  }

  try {
    // Verify signatures
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    
    // Attach decoded user metadata to the request
    req.user = {
      id: decoded.id,
      email: decoded.email
    };
    
    next();
  } catch (err) {
    logger.error('JWT Token verification failed:', err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token has expired. Please login again.'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Access token is invalid or corrupted.'
    });
  }
};

export default protect;
