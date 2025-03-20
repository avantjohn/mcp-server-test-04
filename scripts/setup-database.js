import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read SQL file with PostgreSQL syntax
const sqlFilePath = path.join(__dirname, 'setup-db.sql');
const pgSqlScript = fs.readFileSync(sqlFilePath, 'utf8');

// Convert PostgreSQL SQL to SQLite compatible SQL
function convertPgToSqlite(pgSql) {
  // Replace PostgreSQL-specific syntax with SQLite compatible syntax
  let sqliteSql = pgSql
    // Remove IF NOT EXISTS for INDEX (SQLite doesn't support this)
    .replace(/CREATE INDEX IF NOT EXISTS/g, 'CREATE INDEX')
    // Remove timezone info from timestamp type
    .replace(/TIMESTAMP WITH TIME ZONE/g, 'TIMESTAMP')
    // Replace JSONB with TEXT (SQLite will store JSON as text)
    .replace(/JSONB/g, 'TEXT')
    // Remove PostgreSQL-specific GIN index
    .replace(/CREATE INDEX.*?ON talents USING GIN.*?;/g, '')
    // Remove trigger and function definitions (we'll handle updated_at differently in SQLite)
    .replace(/CREATE OR REPLACE FUNCTION.*?END;.*?\$\$ language 'plpgsql';/gs, '')
    .replace(/CREATE TRIGGER.*?;/g, '');
  
  return sqliteSql;
}

const sqliteSqlScript = convertPgToSqlite(pgSqlScript);

// Extract the talent insertion statements
function extractTalentInserts(sqlScript) {
  const regex = /INSERT INTO talents.*?VALUES\s*(\(.*?\));/gs;
  const matches = [...sqlScript.matchAll(regex)];
  return matches.map(match => `INSERT INTO talents (id, name, description, metadata) VALUES ${match[1]};`);
}

const talentInserts = extractTalentInserts(pgSqlScript);

async function setupDatabase() {
  try {
    console.log('Setting up SQLite database...');
    
    // Create db directory if it doesn't exist
    const dbDir = path.join(__dirname, '..', 'db');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir);
    }
    
    // Database file path
    const dbPath = path.join(dbDir, 'popmelt.sqlite');
    
    // Check if database already exists
    const dbExists = fs.existsSync(dbPath);
    if (dbExists) {
      console.log(`Database already exists at ${dbPath}. Creating backup before updating...`);
      // Create a backup of the existing database
      const backupPath = path.join(dbDir, `popmelt_backup_${Date.now()}.sqlite`);
      fs.copyFileSync(dbPath, backupPath);
      console.log(`Backup created at ${backupPath}`);
      
      // Remove the existing database to start fresh
      fs.unlinkSync(dbPath);
      console.log('Existing database removed. Creating new database...');
    }
    
    // Open SQLite database
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    console.log(`Creating SQLite database at ${dbPath}`);
    
    // Create talents table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS talents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT NOT NULL
      );
    `);
    
    // Insert talent data
    for (const insertSql of talentInserts) {
      try {
        await db.exec(insertSql);
      } catch (error) {
        console.error(`Error executing SQL: ${insertSql.substring(0, 100)}...`, error);
      }
    }
    
    // Create a trigger to update the updated_at timestamp whenever a row is updated
    await db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_talents_updated_at
      AFTER UPDATE ON talents
      FOR EACH ROW
      BEGIN
        UPDATE talents SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    `);
    
    // Create an index on the metadata field for better performance
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_talents_id ON talents(id);
    `);
    
    console.log('Database setup completed successfully!');
    
    // Close the database connection
    await db.close();
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase(); 