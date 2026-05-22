class TrieNode {
  constructor() {
    this.children = {};
    this.contacts = new Map(); // Store matching contacts as Map of id -> contact
  }
}

export class ClientTrie {
  constructor() {
    this.root = new TrieNode();
  }

  /**
   * Normalizes text into lowercase tokens
   */
  tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s@.]/g, '') // Keep alphanumeric, whitespace, dot, and @
      .split(/\s+/)
      .filter(t => t.length > 0);
  }

  /**
   * Inserts a contact under searchable prefixes
   */
  insert(contact) {
    if (!contact || !contact.id) return;

    const tokens = new Set();

    // 1. Name tokens
    this.tokenize(contact.name).forEach(t => tokens.add(t));

    // 2. Phone tokens
    if (contact.phone) {
      tokens.add(contact.phone);
      const digits = contact.phone.replace(/\D/g, '');
      if (digits) tokens.add(digits);
    }

    // 3. Email tokens
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

    // Index the contact for each token prefix
    for (const token of tokens) {
      this._insertToken(token, contact);
    }
  }

  _insertToken(token, contact) {
    let node = this.root;
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
   * Performs real-time prefix matching and returns deduplicated matching contacts
   */
  search(prefix) {
    if (!prefix) {
      return Array.from(this.root.contacts.values());
    }

    const normalized = prefix.toLowerCase().trim();
    let node = this.root;

    for (const char of normalized) {
      if (!node.children[char]) {
        return []; // No local matches
      }
      node = node.children[char];
    }

    return Array.from(node.contacts.values());
  }

  /**
   * Rebuilds the Trie index in bulk
   */
  rebuild(contactsList) {
    this.root = new TrieNode(); // Clear existing
    if (Array.isArray(contactsList)) {
      contactsList.forEach((c) => this.insert(c));
    }
  }
}

export default ClientTrie;
