import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../validators/authValidators.js';
import { validateFields } from '../middleware/validatorMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadAvatar } from '../middleware/uploadMiddleware.js';

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

// @route   PUT /api/auth/profile
// @desc    Update profile details & image
// @access  Private
router.put('/profile', protect, uploadAvatar.single('avatar'), updateProfile);

export default router;
