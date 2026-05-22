import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../validators/authValidators.js';
import { validateFields } from '../middleware/validatorMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', registerValidator, validateFields, register);

// @route   POST /api/auth/login
// @desc    Login user & acquire token
// @access  Public
router.post('/login', loginValidator, validateFields, login);

// @route   GET /api/auth/me
// @desc    Retrieve active session
// @access  Private
router.get('/me', protect, getMe);

export default router;
