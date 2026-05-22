import logger from './logger.js';

/**
 * Parses custom CSV string, taking care of quoted values and commas.
 * Highly robust and suitable for high-performance file reading.
 */
export const parseCSV = (csvText) => {
  if (!csvText) return [];
  
  const results = [];
  const lines = [];
  let currentLine = '';
  let inQuotes = false;

  // Split lines accounting for newlines inside quotes
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && csvText[i + 1] === '\n') {
        i++; // Skip \n
      }
      lines.push(currentLine);
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  if (lines.length === 0) return [];

  // Parse headers (first line)
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  
  // Header map to find correct columns dynamically
  const headerMap = {
    name: headers.indexOf('name'),
    phone: headers.indexOf('phone'),
    email: headers.indexOf('email'),
    company: headers.indexOf('company'),
    address: headers.indexOf('address'),
    tags: headers.indexOf('tags'),
    category: headers.indexOf('category') // Support alternative name for tags
  };

  // Find fallback standard headers if exact match fails
  if (headerMap.name === -1) headerMap.name = headers.findIndex(h => h.includes('name') || h.includes('full'));
  if (headerMap.phone === -1) headerMap.phone = headers.findIndex(h => h.includes('phone') || h.includes('number') || h.includes('tel'));
  if (headerMap.email === -1) headerMap.email = headers.findIndex(h => h.includes('mail'));
  if (headerMap.company === -1) headerMap.company = headers.findIndex(h => h.includes('comp') || h.includes('work'));
  
  // If we can't map name or phone, reject the file
  if (headerMap.name === -1 || headerMap.phone === -1) {
    throw new Error('CSV must contain at least "name" (or "Full Name") and "phone" columns.');
  }

  // Parse rows
  for (let idx = 1; idx < lines.length; idx++) {
    const rawLine = lines[idx].trim();
    if (!rawLine) continue; // Skip empty rows

    const cells = parseCSVLine(rawLine);
    if (cells.length < 2) continue; // Skip corrupted rows

    const getValue = (fieldIndex) => {
      if (fieldIndex === -1 || fieldIndex >= cells.length) return '';
      return cells[fieldIndex].trim();
    };

    const name = getValue(headerMap.name);
    const phone = getValue(headerMap.phone);
    const email = getValue(headerMap.email);
    const company = getValue(headerMap.company);
    const address = getValue(headerMap.address);
    
    // Parse tags (tags could be comma or semicolon separated e.g. "Work;Friends")
    const rawTags = getValue(headerMap.tags) || getValue(headerMap.category);
    const tags = rawTags
      ? rawTags.split(/[;,]/).map(t => t.trim()).filter(t => t.length > 0)
      : [];

    results.push({
      line: idx + 1,
      name,
      phone,
      email: email || null,
      company: company || null,
      address: address || null,
      tags
    });
  }

  return results;
};

/**
 * Splits a single CSV line into an array of cells, honoring double-quotes
 */
const parseCSVLine = (line) => {
  const cells = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // If we see double double-quotes inside quotes, parse as an escaped single double-quote
      if (inQuotes && line[i + 1] === '"') {
        currentCell += '"';
        i++; // Skip the next quote
      } else {
        inQuotes = !inQuotes; // Toggle quote block
      }
    } else if (char === ',' && !inQuotes) {
      cells.push(currentCell);
      currentCell = '';
    } else {
      currentCell += char;
    }
  }
  cells.push(currentCell);
  return cells;
};

/**
 * Validates parsed contacts list, detecting issues and duplicate candidates
 */
export const validateCSVContacts = (contacts) => {
  const validContacts = [];
  const errors = [];
  const phoneSeen = new Set();
  const emailSeen = new Set();

  for (const c of contacts) {
    const rowErrors = [];

    // Basic requirements validation
    if (!c.name) {
      rowErrors.push('Name is required');
    }
    if (!c.phone) {
      rowErrors.push('Phone number is required');
    } else {
      // Normalize phone digits for duplicate check
      const normalizedPhone = c.phone.replace(/\D/g, '');
      if (normalizedPhone.length < 5) {
        rowErrors.push('Phone number is invalid');
      } else if (phoneSeen.has(normalizedPhone)) {
        rowErrors.push(`Duplicate phone number in CSV: ${c.phone}`);
      } else {
        phoneSeen.add(normalizedPhone);
      }
    }

    if (c.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(c.email)) {
        rowErrors.push(`Invalid email format: ${c.email}`);
      } else if (emailSeen.has(c.email.toLowerCase())) {
        rowErrors.push(`Duplicate email address in CSV: ${c.email}`);
      } else {
        emailSeen.add(c.email.toLowerCase());
      }
    }

    if (rowErrors.length > 0) {
      errors.push({
        line: c.line,
        name: c.name || 'Unknown',
        errors: rowErrors
      });
    } else {
      validContacts.push(c);
    }
  }

  return { validContacts, errors };
};
