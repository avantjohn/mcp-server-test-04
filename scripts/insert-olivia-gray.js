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

async function insertOliviaGray() {
  try {
    console.log('Inserting Olivia Gray as the master example...');
    
    // Database file path
    const dbDir = path.join(__dirname, '..', 'db');
    const dbPath = path.join(dbDir, 'popmelt.sqlite');
    
    // Check if database exists
    if (!fs.existsSync(dbPath)) {
      console.error(`Database not found at ${dbPath}. Please run setup-database.js first.`);
      process.exit(1);
    }
    
    // Open SQLite database
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    console.log(`Connected to SQLite database at ${dbPath}`);
    
    // Read Olivia Gray's talent profile
    const oliviaGrayPath = path.join(__dirname, '..', 'talents', 'olivia-gray.json');
    const oliviaGrayData = JSON.parse(fs.readFileSync(oliviaGrayPath, 'utf8'));
    
    // Create a complete talent profile with design_profile
    const talentProfile = {
      id: 'talent_001',
      name: oliviaGrayData.name || 'Olivia Gray',
      title: oliviaGrayData.title || 'UX/UI Designer',
      summary: oliviaGrayData.summary || 'Minimalist design advocate with a focus on intuitive user experiences and clean interfaces.',
      photo: oliviaGrayData.photo,
      contact: oliviaGrayData.contact,
      skills: oliviaGrayData.skills,
      experience: oliviaGrayData.experience,
      education: oliviaGrayData.education,
      projects: oliviaGrayData.projects,
      languages: oliviaGrayData.languages,
      interests: oliviaGrayData.interests,
      description: oliviaGrayData.summary || 'Minimalist design advocate with clean, intuitive interfaces',
      design_profile: oliviaGrayData.design_profile
    };
    
    // Check if Olivia Gray already exists in the database
    const existingTalent = await db.get('SELECT id FROM talents WHERE id = ?', ['talent_001']);
    
    if (existingTalent) {
      console.log('Talent talent_001 already exists. Updating...');
      await db.run(
        'UPDATE talents SET name = ?, description = ?, metadata = ? WHERE id = ?',
        [
          talentProfile.name,
          talentProfile.description,
          JSON.stringify(talentProfile),
          'talent_001'
        ]
      );
    } else {
      console.log('Inserting Olivia Gray as a new talent...');
      await db.run(
        'INSERT INTO talents (id, name, description, metadata) VALUES (?, ?, ?, ?)',
        [
          talentProfile.id,
          talentProfile.name,
          talentProfile.description,
          JSON.stringify(talentProfile)
        ]
      );
    }
    
    // Also set as default talent by adding a config record
    // First check if config table exists
    const configTableExists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='config'");
    
    if (!configTableExists) {
      // Create config table if it doesn't exist
      await db.exec(`
        CREATE TABLE IF NOT EXISTS config (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Create trigger for updated_at
      await db.exec(`
        CREATE TRIGGER IF NOT EXISTS update_config_updated_at
        AFTER UPDATE ON config
        FOR EACH ROW
        BEGIN
          UPDATE config SET updated_at = CURRENT_TIMESTAMP WHERE key = NEW.key;
        END;
      `);
    }
    
    // Update or insert default_talent config
    const existingConfig = await db.get('SELECT key FROM config WHERE key = ?', ['default_talent']);
    
    if (existingConfig) {
      await db.run(
        'UPDATE config SET value = ? WHERE key = ?',
        [talentProfile.id, 'default_talent']
      );
    } else {
      await db.run(
        'INSERT INTO config (key, value) VALUES (?, ?)',
        ['default_talent', talentProfile.id]
      );
    }
    
    console.log('Olivia Gray has been successfully set as the master example!');
    
    // Close the database connection
    await db.close();
  } catch (error) {
    console.error('Error inserting Olivia Gray:', error);
  }
}

insertOliviaGray(); 