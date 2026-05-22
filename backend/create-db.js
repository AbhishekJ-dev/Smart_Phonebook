import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

async function createDb() {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // connect to default db first
  });

  try {
    await client.connect();
    console.log('Connected to default postgres database.');
    
    // Check if database exists
    const res = await client.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = 'smart_phonebook'`);
    if (res.rowCount === 0) {
      console.log('Database smart_phonebook does not exist. Creating...');
      await client.query(`CREATE DATABASE smart_phonebook`);
      console.log('Database smart_phonebook created successfully!');
    } else {
      console.log('Database smart_phonebook already exists.');
    }
  } catch (err) {
    console.error('Error creating database:', err.message);
  } finally {
    await client.end();
  }
}

createDb();
