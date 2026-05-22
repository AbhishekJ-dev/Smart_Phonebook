-- SQL schema for Smart Phonebook Search Engine
-- Enables high-performance search via Trigram indices and Full-Text Vectoring

-- Enable pgcrypto for UUID generation (if gen_random_uuid() is not standard)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable pg_trgm for fuzzy string similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  company VARCHAR(150),
  address TEXT,
  tags VARCHAR(50)[] DEFAULT '{}',
  favorite BOOLEAN DEFAULT false,
  profile_picture VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Full Text Search generated vector
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english'::regconfig, 
      name || ' ' || 
      coalesce(phone, '') || ' ' || 
      coalesce(email, '') || ' ' || 
      coalesce(company, '')
    )
  ) STORED
);

-- Create Recent Searches table for history logging
CREATE TABLE IF NOT EXISTS recent_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add high performance indices
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_favorite ON contacts(user_id, favorite);

-- Trigram index on name for instant fuzzy matching
CREATE INDEX IF NOT EXISTS idx_contacts_name_trgm ON contacts USING gin (lower(name) gin_trgm_ops);

-- Trigram index on phone, company, and email for comprehensive fuzzy matching
CREATE INDEX IF NOT EXISTS idx_contacts_phone_trgm ON contacts USING gin (phone gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_contacts_email_trgm ON contacts USING gin (lower(email) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_contacts_company_trgm ON contacts USING gin (lower(company) gin_trgm_ops);

-- GIN index on Tags array
CREATE INDEX IF NOT EXISTS idx_contacts_tags_gin ON contacts USING gin (tags);

-- GIN index on generated Full-Text Search vector
CREATE INDEX IF NOT EXISTS idx_contacts_search_vector ON contacts USING gin (search_vector);

-- Index on recent searches by user and creation order
CREATE INDEX IF NOT EXISTS idx_recent_searches_user_time ON recent_searches(user_id, created_at DESC);
