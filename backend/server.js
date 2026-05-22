import dotenv from 'dotenv';
import app from './app.js';
import { connectAndMigrate } from './config/db.js';
import pool from './config/db.js';
import TrieService from './services/trieService.js';
import logger from './utils/logger.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '5000');

/**
 * Primes and pre-loads all existing database contacts into the in-memory Trie cache.
 * Ensures zero-latency autocompletions for all users from the second the server starts up!
 */
const primeSearchTrieCaches = async () => {
  try {
    logger.info('Pre-loading and index-priming user contact Trie caches...');
    
    // Fetch all contacts from PostgreSQL
    const contactsRes = await pool.query(
      'SELECT id, user_id, name, phone, email, company, address, tags, favorite FROM contacts'
    );
    
    const allContacts = contactsRes.rows;
    
    // Group contacts by user_id
    const userContactsMap = new Map();
    allContacts.forEach((contact) => {
      const uid = contact.user_id;
      if (!userContactsMap.has(uid)) {
        userContactsMap.set(uid, []);
      }
      userContactsMap.get(uid).push(contact);
    });

    // Hydrate each user's in-memory Trie
    let hydrationCount = 0;
    userContactsMap.forEach((contactsList, uid) => {
      TrieService.hydrateUserTrie(uid, contactsList);
      hydrationCount++;
    });

    logger.success(`Prime completed: Primed ${hydrationCount} user caches with ${allContacts.length} contacts total!`);
  } catch (err) {
    logger.error('Failed to prime search Trie caches on server startup. Trie will hydrate on demand.', err);
  }
};

/**
 * System Bootstrap
 */
const startServer = async () => {
  try {
    // 1. Establish PostgreSQL Connection & Run Schema Migrations
    await connectAndMigrate();

    // 2. Hydrate Search Indexes
    await primeSearchTrieCaches();

    // 3. Launch Port Listener
    app.listen(PORT, '0.0.0.0', () => {
      logger.success(`=======================================================`);
      logger.success(`🚀 Smart Phonebook Server is live on http://localhost:${PORT}`);
      logger.success(`👉 API Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.success(`=======================================================`);
    });
  } catch (err) {
    logger.error('CRITICAL ERROR: Failed to bootstrap the backend server API. Exiting...', err);
    process.exit(1);
  }
};

startServer();
