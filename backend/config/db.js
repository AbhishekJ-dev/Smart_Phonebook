import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Establish database configuration reading standard PostgreSQL env variables or DATABASE_URL
const isProduction = process.env.NODE_ENV === 'production';

if (process.env.DATABASE_URL) {
  console.log('DB_CONFIG: Using connection string (DATABASE_URL)');
} else {
  console.warn('DB_CONFIG: No DATABASE_URL found. Falling back to individual environment variables (Host: ' + (process.env.DB_HOST || 'localhost') + ')');
}

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // Force SSL for managed databases like Render
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'smart_phonebook',
      password: process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT || '5432'),
      ssl: isProduction ? { rejectUnauthorized: false } : false
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

/**
 * Connects to PostgreSQL with retries and runs database migrations schema
 */
export const connectAndMigrate = async (retries = 5, delay = 3000) => {
  let client;
  while (retries > 0) {
    try {
      console.log(`Connecting to PostgreSQL database (attempts left: ${retries})...`);
      client = await pool.connect();
      console.log('Successfully connected to PostgreSQL!');
      
      // Execute table migration
      await runMigrations(client);
      
      client.release();
      return pool;
    } catch (err) {
      console.error('Database connection failed:', err.message);
      retries -= 1;
      if (retries === 0) {
        console.error('Could not connect to PostgreSQL after multiple attempts. Exiting...');
        throw err;
      }
      console.log(`Waiting ${delay / 1000}s before retrying database connection...`);
      await new Promise((res) => setTimeout(res, delay));
      delay *= 1.5; // Exponential backoff
    }
  }
};

/**
 * Reads dbSchema.sql and executes the queries on the active client
 */
const runMigrations = async (client) => {
  try {
    console.log('Running database schema migrations...');
    const schemaPath = path.join(__dirname, '../models/dbSchema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.warn('Migration schema file not found. Skipping migration runner.');
      return;
    }
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Explicitly set search path to ensure tables are created in the public schema
    await client.query('SET search_path TO public;');

    // Execute all queries as a unified block
    await client.query(schemaSql);
    console.log('Database tables, extensions, and indexes verified & compiled successfully!');
  } catch (err) {
    console.error('Error running schema migrations:', err);
    throw err;
  }
};

export default pool;
