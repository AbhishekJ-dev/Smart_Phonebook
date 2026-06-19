import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';
import TrieService from '../services/trieService.js';
import { parseCSV, validateCSVContacts } from '../utils/csvParser.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Helper to safely delete avatar file (currently Cloudinary handles storage)
 */
const deleteDiskFile = async (pathOrUrl) => {
  // If we wanted to delete from Cloudinary, we'd use cloudinary.uploader.destroy()
  // For now, we skip local unlink as we are using Cloud storage
};

/**
 * Fetch all contacts for user with sorting, filtering, and pagination
 */
export const getContacts = async (req, res, next) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page || '1');
  const limit = parseInt(req.query.limit || '10');
  const offset = (page - 1) * limit;

  const { favorite, tag, company, sortBy } = req.query;

  try {
    let queryText = 'SELECT * FROM contacts WHERE user_id = $1';
    const queryParams = [userId];
    let paramCounter = 2;

    // Apply Filters
    if (favorite === 'true') {
      queryText += ` AND favorite = $${paramCounter}`;
      queryParams.push(true);
      paramCounter++;
    }

    if (tag) {
      queryText += ` AND $${paramCounter} = ANY(tags)`;
      queryParams.push(tag);
      paramCounter++;
    }

    if (company) {
      queryText += ` AND lower(company) = lower($${paramCounter})`;
      queryParams.push(company);
      paramCounter++;
    }

    // Get Total Count for Pagination metadata (run before adding order by to avoid aggregation/sorting conflicts)
    const countQueryText = queryText.replace('SELECT *', 'SELECT COUNT(*)');
    const totalCountResult = await pool.query(countQueryText, queryParams);
    const totalItems = parseInt(totalCountResult.rows[0].count);

    // Apply Sorting
    let orderBy = 'ORDER BY name ASC'; // Default A-Z
    if (sortBy === 'name_desc') orderBy = 'ORDER BY name DESC';
    else if (sortBy === 'newest') orderBy = 'ORDER BY created_at DESC';
    else if (sortBy === 'oldest') orderBy = 'ORDER BY created_at ASC';
    else if (sortBy === 'updated') orderBy = 'ORDER BY updated_at DESC';

    queryText += ` ${orderBy}`;

    // Apply Pagination
    queryText += ` LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    queryParams.push(limit, offset);

    const contactsResult = await pool.query(queryText, queryParams);

    res.status(200).json({
      success: true,
      contacts: contactsResult.rows,
      meta: {
        totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        limit
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create new contact
 */
export const createContact = async (req, res, next) => {
  const userId = req.user.id;
  const { name, phone, email, company, address, tags, favorite } = req.body;
  
  // Profile picture URL path (Cloudinary URL)
  const profilePicture = req.file ? req.file.path : null;
  const tagsArray = Array.isArray(tags) ? tags : typeof tags === 'string' ? JSON.parse(tags) : [];
  const isFavorite = favorite === 'true' || favorite === true;

  try {
    // Check if phone number is already registered under this specific user
    const duplicateCheck = await pool.query(
      'SELECT id FROM contacts WHERE user_id = $1 AND phone = $2',
      [userId, phone]
    );

    if (duplicateCheck.rows.length > 0) {
      // Cleanup uploaded picture if entry is rejected
      if (profilePicture) await deleteDiskFile(profilePicture);

      return res.status(409).json({
        success: false,
        message: 'A contact with this phone number already exists in your phonebook.'
      });
    }

    const newContactResult = await pool.query(
      `INSERT INTO contacts (user_id, name, phone, email, company, address, tags, favorite, profile_picture) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [userId, name, phone, email || null, company || null, address || null, tagsArray, isFavorite, profilePicture]
    );

    const contact = newContactResult.rows[0];

    // Index newly created contact in in-memory Trie
    TrieService.indexContact(userId, contact);

    logger.success(`Contact created and indexed successfully: ${contact.name} for User ID ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Contact created successfully.',
      contact
    });
  } catch (err) {
    // Cleanup uploaded picture in case of DB exceptions
    if (profilePicture) await deleteDiskFile(profilePicture);
    next(err);
  }
};

/**
 * Update contact
 */
export const updateContact = async (req, res, next) => {
  const userId = req.user.id;
  const contactId = req.params.id;
  const { name, phone, email, company, address, tags, favorite } = req.body;

  try {
    // Retrieve existing contact details
    const contactCheck = await pool.query(
      'SELECT * FROM contacts WHERE id = $1 AND user_id = $2',
      [contactId, userId]
    );

    if (contactCheck.rows.length === 0) {
      if (req.file) await deleteDiskFile(`uploads/${req.file.filename}`);
      return res.status(404).json({
        success: false,
        message: 'Contact not found.'
      });
    }

    const currentContact = contactCheck.rows[0];
    
    // Check phone number duplicate (ensure it's not taken by another contact)
    if (phone && phone !== currentContact.phone) {
      const duplicateCheck = await pool.query(
        'SELECT id FROM contacts WHERE user_id = $1 AND phone = $2 AND id != $3',
        [userId, phone, contactId]
      );
      if (duplicateCheck.rows.length > 0) {
        if (req.file) await deleteDiskFile(`uploads/${req.file.filename}`);
        return res.status(409).json({
          success: false,
          message: 'Another contact with this phone number already exists.'
        });
      }
    }

    // Determine picture update or reuse
    let profilePicture = currentContact.profile_picture;
    if (req.file) {
      profilePicture = req.file.path;
    }

    const tagsArray = Array.isArray(tags) 
      ? tags 
      : typeof tags === 'string' 
        ? JSON.parse(tags) 
        : currentContact.tags;
        
    const isFavorite = favorite !== undefined 
      ? (favorite === 'true' || favorite === true) 
      : currentContact.favorite;

    // Perform Update
    const updatedResult = await pool.query(
      `UPDATE contacts 
       SET name = $1, phone = $2, email = $3, company = $4, address = $5, tags = $6, favorite = $7, profile_picture = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND user_id = $10 
       RETURNING *`,
      [
        name || currentContact.name,
        phone || currentContact.phone,
        email !== undefined ? (email || null) : currentContact.email,
        company !== undefined ? (company || null) : currentContact.company,
        address !== undefined ? (address || null) : currentContact.address,
        tagsArray,
        isFavorite,
        profilePicture,
        contactId,
        userId
      ]
    );

    const updatedContact = updatedResult.rows[0];

    // Synchronize in-memory search index
    TrieService.deindexContact(userId, contactId); // Evict old values
    TrieService.indexContact(userId, updatedContact); // Re-insert new values

    logger.success(`Contact ${updatedContact.name} updated and index refreshed.`);

    res.status(200).json({
      success: true,
      message: 'Contact updated successfully.',
      contact: updatedContact
    });
  } catch (err) {
    if (req.file) await deleteDiskFile(`uploads/${req.file.filename}`);
    next(err);
  }
};

/**
 * Delete contact
 */
export const deleteContact = async (req, res, next) => {
  const userId = req.user.id;
  const contactId = req.params.id;

  try {
    // Select contact to clear local images
    const contactCheck = await pool.query(
      'SELECT id, name, profile_picture FROM contacts WHERE id = $1 AND user_id = $2',
      [contactId, userId]
    );

    if (contactCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found.'
      });
    }

    const contact = contactCheck.rows[0];

    // Perform physical deletion
    await pool.query('DELETE FROM contacts WHERE id = $1 AND user_id = $2', [contactId, userId]);

    // De-index from the memory cache Trie
    TrieService.deindexContact(userId, contactId);

    // Garbage collect disk avatars
    if (contact.profile_picture) {
      await deleteDiskFile(contact.profile_picture);
    }

    logger.success(`Contact ${contact.name} deleted successfully.`);

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Smart Search Engine endpoint. Hybrid: Memory Trie for instant suggestions, fallback to DB Trigrams
 */
export const searchContacts = async (req, res, next) => {
  const userId = req.user.id;
  const query = (req.query.q || '').trim();
  const isAutocomplete = req.query.autocomplete === 'true';

  try {
    // 1. Log query to searches history (only for full searches, not autocomplete keys)
    if (query && !isAutocomplete) {
      // Maintain maximum recent query logs or record directly
      await pool.query(
        'INSERT INTO recent_searches (user_id, query) VALUES ($1, $2)',
        [userId, query]
      );
    }

    if (!query) {
      // Return empty results or default suggestions
      return res.status(200).json({
        success: true,
        source: 'trie',
        results: []
      });
    }

    // 2. Fetch matches from in-memory Trie Service
    const trieResults = TrieService.getUserTrie(userId).search(query);

    // If autocomplete suggestion is requested, in-memory Trie results are returned immediately (high performance)
    if (isAutocomplete || trieResults.length > 0) {
      return res.status(200).json({
        success: true,
        source: 'trie',
        results: trieResults.slice(0, 15) // Caps autocomplete suggestions
      });
    }

    // 3. Fallback to SQL full fuzzy / Trigram searches if memory Trie misses or broad search is desired
    logger.info(`Trie miss for search query "${query}". Executing PostgreSQL Trigram matching...`);
    
    // GIN Trigram similarity search on name, company, email, phone or Tag array contains query
    // Similarity order scores name higher, fallback to broad search vector matches
    const trigramQuery = `
      SELECT *, 
        similarity(lower(name), lower($2)) AS name_score,
        similarity(phone, $2) AS phone_score
      FROM contacts 
      WHERE user_id = $1 
        AND (
          lower(name) % lower($2) 
          OR phone % $2 
          OR lower(coalesce(email, '')) % lower($2)
          OR lower(coalesce(company, '')) % lower($2)
          OR $2 = ANY(tags)
          OR search_vector @@ to_tsquery('english', $3)
        )
      ORDER BY name_score DESC, phone_score DESC
      LIMIT 30;
    `;

    // Formats query token for English vector parsing e.g. "Abhishek" -> "Abhishek:*" (prefix parsing)
    const vectorToken = query.split(/\s+/).map(t => `${t.replace(/[^\w]/g, '')}:*`).join(' & ');
    const dbResult = await pool.query(trigramQuery, [userId, query, vectorToken || query]);

    res.status(200).json({
      success: true,
      source: 'database_trigram',
      results: dbResult.rows
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch top unique searches log
 */
export const getSearchHistory = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const historyResult = await pool.query(
      `SELECT DISTINCT query, MAX(created_at) as last_searched
       FROM recent_searches
       WHERE user_id = $1
       GROUP BY query
       ORDER BY last_searched DESC
       LIMIT 10`,
      [userId]
    );

    res.status(200).json({
      success: true,
      history: historyResult.rows.map((row) => row.query)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Import contacts from CSV file
 */
export const importContacts = async (req, res, next) => {
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a CSV file to import.'
    });
  }

  const client = await pool.connect();
  try {
    const csvContent = req.file.buffer.toString('utf8');
    const rawParsed = parseCSV(csvContent);
    const { validContacts, errors } = validateCSVContacts(rawParsed);

    if (validContacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid contacts found in the uploaded CSV file.',
        errors
      });
    }

    // Begin single atomic transaction for bulk insert
    await client.query('BEGIN');
    
    let importedCount = 0;
    let duplicateWarningsCount = 0;
    const importedContacts = [];

    for (const c of validContacts) {
      // Check if contact with same phone already exists for this user (duplicate detection)
      const dupCheck = await client.query(
        'SELECT id FROM contacts WHERE user_id = $1 AND phone = $2',
        [userId, c.phone]
      );

      if (dupCheck.rows.length > 0) {
        duplicateWarningsCount++;
        errors.push({
          line: c.line,
          name: c.name,
          errors: [`Contact with phone ${c.phone} already exists in database. Skipped.`]
        });
        continue;
      }

      // Insert record
      const insertRes = await client.query(
        `INSERT INTO contacts (user_id, name, phone, email, company, address, tags, favorite)
         VALUES ($1, $2, $3, $4, $5, $6, $7, false)
         RETURNING *`,
        [userId, c.name, c.phone, c.email, c.company, c.address, c.tags]
      );
      
      importedCount++;
      importedContacts.push(insertRes.rows[0]);
    }

    await client.query('COMMIT');

    // Mass hydration: Re-fetch all contacts and fully rebuild user Trie index in-memory
    const allContacts = await pool.query(
      'SELECT id, name, phone, email, company, address, tags, favorite, profile_picture FROM contacts WHERE user_id = $1',
      [userId]
    );
    TrieService.hydrateUserTrie(userId, allContacts.rows);

    logger.success(`CSV Import completed: Imported ${importedCount} contacts. Duplicates skipped: ${duplicateWarningsCount}`);

    res.status(200).json({
      success: true,
      message: `Successfully imported ${importedCount} contacts.`,
      meta: {
        totalParsed: rawParsed.length,
        importedCount,
        skippedCount: duplicateWarningsCount + (rawParsed.length - validContacts.length - duplicateWarningsCount),
        errorsCount: errors.length
      },
      errors // Return structural/duplicate alerts to user for reference
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

/**
 * Export all contacts as CSV file download
 */
export const exportContacts = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const contactsResult = await pool.query(
      `SELECT name, phone, email, company, address, array_to_string(tags, ';') as tags_list
       FROM contacts
       WHERE user_id = $1
       ORDER BY name ASC`,
      [userId]
    );

    const rows = contactsResult.rows;
    
    // Header string
    let csvString = 'Name,Phone,Email,Company,Address,Tags\r\n';

    // Map content cells escaping commas and double-quotes
    rows.forEach((row) => {
      const escape = (val) => {
        if (val === null || val === undefined) return '';
        const stringVal = String(val).replace(/"/g, '""'); // Double double-quotes for CSV escaping
        if (stringVal.includes(',') || stringVal.includes('\n') || stringVal.includes('"') || stringVal.includes('\r')) {
          return `"${stringVal}"`;
        }
        return stringVal;
      };

      csvString += `${escape(row.name)},${escape(row.phone)},${escape(row.email)},${escape(row.company)},${escape(row.address)},${escape(row.tags_list)}\r\n`;
    });

    // Send HTTP Headers for file trigger
    const filename = `smart_phonebook_export_${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    res.status(200).send(csvString);
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve unique list of companies currently active
 */
export const getActiveCompaniesAndTags = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const companiesRes = await pool.query(
      `SELECT DISTINCT company 
       FROM contacts 
       WHERE user_id = $1 AND company IS NOT NULL AND company != '' 
       ORDER BY company ASC`,
      [userId]
    );

    const tagsRes = await pool.query(
      `SELECT DISTINCT unnest(tags) as tag_name 
       FROM contacts 
       WHERE user_id = $1 
       ORDER BY tag_name ASC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      companies: companiesRes.rows.map(r => r.company),
      tags: tagsRes.rows.map(r => r.tag_name)
    });
  } catch (err) {
    next(err);
  }
};
