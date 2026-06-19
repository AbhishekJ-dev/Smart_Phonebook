import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import logger from '../utils/logger.js';
import TrieService from '../services/trieService.js';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

/**
 * Register a new user
 */
export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      logger.warn(`Registration rejected: Email ${email} already in use.`);
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hashedPassword]
    );

    const user = newUser.rows[0];

    // Initialize an empty Trie for the new user
    TrieService.hydrateUserTrie(user.id, []);

    logger.success(`User registered successfully: ${user.email} (ID: ${user.id})`);
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Log in an existing user
 */
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find user
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      logger.warn(`Login rejected: User not found for ${email}.`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.'
      });
    }

    const user = userResult.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login rejected: Incorrect password for ${email}.`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.'
      });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    // Hydrate User's Trie Cache upon login to ensure immediate smart prefix suggestions
    const contactsResult = await pool.query(
      'SELECT id, name, phone, email, company, address, tags, favorite, profile_picture FROM contacts WHERE user_id = $1',
      [user.id]
    );
    TrieService.hydrateUserTrie(user.id, contactsResult.rows);

    logger.success(`User logged in successfully: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_picture: user.profile_picture,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get details of current authenticated user session
 */
export const getMe = async (req, res, next) => {
  try {
    const userResult = await pool.query(
      'SELECT id, name, email, profile_picture, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User session not found.'
      });
    }

    const user = userResult.rows[0];

    // Make sure user Trie is loaded if not already in memory
    const userTrie = TrieService.getUserTrie(user.id);
    if (userTrie.root.contacts.size === 0) {
      const contactsResult = await pool.query(
        'SELECT id, name, phone, email, company, address, tags, favorite, profile_picture FROM contacts WHERE user_id = $1',
        [user.id]
      );
      TrieService.hydrateUserTrie(user.id, contactsResult.rows);
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_picture: user.profile_picture,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    next(err);
  }
};
