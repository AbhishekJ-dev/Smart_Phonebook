import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import logger from '../utils/logger.js';

/**
 * Update user profile (name, email, password)
 */
export const updateProfile = async (req, res, next) => {
  const userId = req.user.id;
  const { name, email, newPassword, currentPassword } = req.body;

  try {
    // Fetch current user
    const userResult = await pool.query(
      'SELECT id, name, email, password FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = userResult.rows[0];

    // If changing password, verify current password first
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password.'
        });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect.'
        });
      }
    }

    // If changing email, check for uniqueness
    if (email && email !== user.email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'This email address is already in use by another account.'
        });
      }
    }

    // Hash new password if provided
    let hashedPassword = user.password;
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(newPassword, salt);
    }

    // Perform update
    const updatedResult = await pool.query(
      `UPDATE users
       SET name = $1, email = $2, password = $3
       WHERE id = $4
       RETURNING id, name, email, created_at`,
      [
        name || user.name,
        email || user.email,
        hashedPassword,
        userId
      ]
    );

    const updatedUser = updatedResult.rows[0];
    logger.success(`Profile updated for user: ${updatedUser.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        createdAt: updatedUser.created_at
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get user statistics (contact counts, favorites, tags, companies)
 */
export const getUserStats = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const statsResult = await pool.query(
      `SELECT
        COUNT(*) AS total_contacts,
        COUNT(*) FILTER (WHERE favorite = true) AS total_favorites,
        (SELECT COUNT(DISTINCT unnest(tags)) FROM contacts WHERE user_id = $1) AS total_tags,
        (SELECT COUNT(DISTINCT company) FROM contacts WHERE user_id = $1 AND company IS NOT NULL AND company != '') AS total_companies,
        (SELECT COUNT(*) FROM recent_searches WHERE user_id = $1) AS total_searches
       FROM contacts
       WHERE user_id = $1`,
      [userId]
    );

    const stats = statsResult.rows[0];
    res.status(200).json({
      success: true,
      stats: {
        totalContacts: parseInt(stats.total_contacts) || 0,
        totalFavorites: parseInt(stats.total_favorites) || 0,
        totalTags: parseInt(stats.total_tags) || 0,
        totalCompanies: parseInt(stats.total_companies) || 0,
        totalSearches: parseInt(stats.total_searches) || 0
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Clear all user search history logs
 */
export const clearSearchHistory = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'DELETE FROM recent_searches WHERE user_id = $1',
      [userId]
    );

    logger.info(`Search history cleared for user ID: ${userId}. Rows deleted: ${result.rowCount}`);

    res.status(200).json({
      success: true,
      message: `Search history cleared successfully. ${result.rowCount} log entries removed.`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete entire user account and all data (GDPR purge)
 */
export const deleteAccount = async (req, res, next) => {
  const userId = req.user.id;

  try {
    // Delete cascade handles contacts + recent_searches
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    logger.warn(`Account permanently deleted for user ID: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Account and all associated data permanently deleted.'
    });
  } catch (err) {
    next(err);
  }
};
