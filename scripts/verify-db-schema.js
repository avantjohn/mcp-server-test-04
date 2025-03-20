import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verifyDatabase() {
  try {
    console.log('Verifying SQLite database...');
    
    // Database file path
    const dbPath = path.join(__dirname, '..', 'db', 'popmelt.sqlite');
    
    // Open SQLite database
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Get the first talent record to verify schema
    const talent = await db.get('SELECT * FROM talents LIMIT 1');
    console.log('Sample talent ID:', talent.id);
    console.log('Sample talent name:', talent.name);
    
    // Parse the metadata (which is stored as text in SQLite)
    const metadata = JSON.parse(talent.metadata);
    
    // Check if design_system field exists
    if (metadata.design_system) {
      console.log('✅ design_system field exists in metadata');
      
      // Check for key components of the design system
      if (metadata.design_system.colors) {
        console.log('✅ design_system.colors exists');
        console.log('   Core color:', metadata.design_system.colors.core);
      } else {
        console.log('❌ design_system.colors is missing');
      }
      
      if (metadata.design_system.typography) {
        console.log('✅ design_system.typography exists');
        console.log('   Font family heading:', metadata.design_system.typography.font_family_heading);
      } else {
        console.log('❌ design_system.typography is missing');
      }
      
      if (metadata.design_system.components) {
        console.log('✅ design_system.components exists');
        console.log('   Number of components:', Object.keys(metadata.design_system.components).length);
        Object.keys(metadata.design_system.components).forEach(component => {
          console.log(`   - ${component}`);
        });
      } else {
        console.log('❌ design_system.components is missing');
      }
    } else {
      console.log('❌ design_system field is missing from metadata');
    }
    
    // Check all talents to ensure they all have design_system field
    const talents = await db.all('SELECT id, metadata FROM talents');
    let allHaveDesignSystem = true;
    
    for (const talent of talents) {
      const talentMetadata = JSON.parse(talent.metadata);
      if (!talentMetadata.design_system) {
        console.log(`❌ Talent ${talent.id} is missing design_system field`);
        allHaveDesignSystem = false;
      }
    }
    
    if (allHaveDesignSystem) {
      console.log(`✅ All ${talents.length} talents have design_system field`);
    }
    
    // Close the database connection
    await db.close();
    
    console.log('Database verification completed!');
  } catch (error) {
    console.error('Error verifying database:', error);
  }
}

verifyDatabase(); 