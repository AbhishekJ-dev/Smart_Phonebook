import logger from '../utils/logger.js';

class TrieNode {
  constructor() {
    this.children = {};
    this.contacts = new Map(); // Map of contactId -> contact object
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  /**
   * Tokenizes a text string into normalized, searchable lowercase words/prefixes
   */
  tokenize(text) {
    if (!text) return [];
    // Convert to lowercase, remove special characters except @ or . (for email indexing), and split by whitespace
    return text
      .toLowerCase()
      .replace(/[^\w\s@.]/g, '')
      .split(/\s+/)
      .filter((token) => token.length > 0);
  }

  /**
   * Inserts a contact under multiple keys (name tokens, phone numbers, email prefixes, company tokens, tags)
   */
  insert(contact) {
    if (!contact || !contact.id) return;

    const tokens = new Set();
    
    // 1. Name tokens
    this.tokenize(contact.name).forEach(t => tokens.add(t));
    
    // 2. Phone prefixes (digits only and raw tokens)
    if (contact.phone) {
      tokens.add(contact.phone);
      const digits = contact.phone.replace(/\D/g, '');
      if (digits) tokens.add(digits);
    }
    
    // 3. Email prefixes (e.g. "john.doe" from "john.doe@company.com")
    if (contact.email) {
      tokens.add(contact.email.toLowerCase());
      const username = contact.email.split('@')[0];
      if (username) tokens.add(username.toLowerCase());
    }

    // 4. Company tokens
    if (contact.company) {
      this.tokenize(contact.company).forEach(t => tokens.add(t));
    }

    // 5. Tags
    if (Array.isArray(contact.tags)) {
      contact.tags.forEach(tag => {
        if (tag) tokens.add(tag.toLowerCase());
      });
    }

    // Insert the contact into the Trie for each token prefix
    for (const token of tokens) {
      this._insertToken(token, contact);
    }
  }

  _insertToken(token, contact) {
    let node = this.root;
    
    // Save contact at root node for empty search queries (match all)
    node.contacts.set(contact.id, contact);

    for (const char of token) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
      node.contacts.set(contact.id, contact);
    }
  }

  /**
   * Removes a contact completely from the user Trie by traversing children or flushing keys
   */
  remove(contactId) {
    // A clean and absolute way to remove from an in-memory trie is to perform a depth-first purge
    this._removeNodeDfs(this.root, contactId);
  }

  _removeNodeDfs(node, contactId) {
    if (!node) return;
    
    node.contacts.delete(contactId);
    
    for (const char in node.children) {
      this._removeNodeDfs(node.children[char], contactId);
      // Clean up empty nodes to save memory
      if (Object.keys(node.children[char].children).length === 0 && node.children[char].contacts.size === 0) {
        delete node.children[char];
      }
    }
  }

  /**
   * Searches the Trie for contacts matching a given prefix query
   */
  search(prefix) {
    if (!prefix) {
      // If empty query, return first 20 contacts from the root
      return Array.from(this.root.contacts.values()).slice(0, 20);
    }

    const normalized = prefix.toLowerCase().trim();
    let node = this.root;

    for (const char of normalized) {
      if (!node.children[char]) {
        return []; // No matches
      }
      node = node.children[char];
    }

    // Return deduplicated values as array
    return Array.from(node.contacts.values());
  }
}

// In-memory Registry: Map of userId -> Trie instance
const trieRegistry = new Map();

export const TrieService = {
  /**
   * Gets or initializes the Trie for a specific user
   */
  getUserTrie(userId) {
    if (!trieRegistry.has(userId)) {
      trieRegistry.set(userId, new Trie());
    }
    return trieRegistry.get(userId);
  },

  /**
   * Indexes a single contact for a user
   */
  indexContact(userId, contact) {
    try {
      const trie = this.getUserTrie(userId);
      trie.insert(contact);
    } catch (err) {
      logger.error(`Error indexing contact in Trie for user ${userId}`, err);
    }
  },

  /**
   * De-indexes a contact from a user's Trie
   */
  deindexContact(userId, contactId) {
    try {
      if (trieRegistry.has(userId)) {
        const trie = trieRegistry.get(userId);
        trie.remove(contactId);
      }
    } catch (err) {
      logger.error(`Error removing contact ${contactId} from Trie for user ${userId}`, err);
    }
  },

  /**
   * Hydrates the in-memory Trie registry for a user with their complete contact list
   */
  hydrateUserTrie(userId, contactsList) {
    try {
      const trie = new Trie(); // Instantiate a clean, fresh Trie
      contactsList.forEach((contact) => trie.insert(contact));
      trieRegistry.set(userId, trie);
      logger.info(`Hydrated in-memory Trie cache with ${contactsList.length} contacts for user ${userId}`);
    } catch (err) {
      logger.error(`Failed to hydrate Trie cache for user ${userId}`, err);
    }
  },

  /**
   * Cleans the cache memory for a specific user
   */
  clearUserTrie(userId) {
    trieRegistry.delete(userId);
    logger.info(`Evicted Trie cache registry for user ${userId}`);
  }
};

export default TrieService;
