import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testDatabase() {
  try {
    // Database file path
    const dbPath = path.join(__dirname, '..', 'db', 'popmelt.sqlite');
    
    console.log(`Opening SQLite database at ${dbPath}`);
    
    // Open SQLite database
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Query all talents
    console.log('Querying all talents...');
    const talents = await db.all('SELECT * FROM talents');
    
    console.log(`Found ${talents.length} talents:`);
    
    // Print talent names
    for (const talent of talents) {
      console.log(`- ${talent.id}: ${talent.name}`);
      
      try {
        // Parse metadata JSON
        const metadata = JSON.parse(talent.metadata);
        
        // Handle both old format (metadata.aesthetic_characteristics) and new format (metadata.design_profile.aesthetic_characteristics)
        if (metadata.design_profile && metadata.design_profile.aesthetic_characteristics) {
          // New format
          console.log(`  Style: ${metadata.design_profile.aesthetic_characteristics.style}`);
          console.log(`  Primary Color: ${metadata.design_profile.color_palette.primary}`);
        } else if (metadata.aesthetic_characteristics) {
          // Old format
          console.log(`  Style: ${metadata.aesthetic_characteristics.style}`);
          console.log(`  Primary Color: ${metadata.color_palette.primary}`);
        } else {
          console.log('  No style information found in talent profile');
        }
      } catch (e) {
        console.log(`  Error parsing metadata: ${e.message}`);
      }
    }
    
    // Close the database connection
    await db.close();
    
    console.log('Database test completed successfully!');
  } catch (error) {
    console.error('Error testing database:', error);
  }
}

testDatabase(); 