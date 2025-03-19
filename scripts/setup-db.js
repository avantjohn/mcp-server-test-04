#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the SQL file
const sqlFilePath = path.join(__dirname, 'setup-db.sql');

// Create a client to connect to the database
const client = new pg.Client({
  // Connection parameters are read from environment variables:
  // PGHOST, PGUSER, PGDATABASE, PGPASSWORD, PGPORT
});

async function setupDatabase() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    
    console.log('Reading SQL file...');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Executing SQL...');
    await client.query(sqlContent);
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the setup
setupDatabase(); 