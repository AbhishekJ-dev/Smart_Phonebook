import { Router } from 'express';
import { updateProfile, getUserStats, clearSearchHistory, deleteAccount } from '../controllers/profileController.js';
import { profileUpdateValidator } from '../validators/authValidators.js';
import { validateFields } from '../middleware/validatorMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// All profile routes are protected
router.use(protect);

// @route   PUT /api/profile
// @desc    Update user name, email or password
router.put('/', profileUpdateValidator, validateFields, updateProfile);

// @route   GET /api/profile/stats
// @desc    Get aggregated stats for the current user
router.get('/stats', getUserStats);

// @route   DELETE /api/profile/history
// @desc    Clear all recent search history
router.delete('/history', clearSearchHistory);

// @route   DELETE /api/profile/account
// @desc    Permanently delete account and all data
router.delete('/account', deleteAccount);

export default router;
