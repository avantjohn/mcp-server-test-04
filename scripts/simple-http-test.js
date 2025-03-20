import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, '..', 'test-output.css');

/**
 * Simple test for the HTTP endpoints of the MCP server
 */
async function testHttpEndpoints() {
  try {
    // First check if the server is alive
    console.log('Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3000/health');
    
    if (healthResponse.ok) {
      console.log('✅ Health check passed');
      const healthData = await healthResponse.json();
      console.log('Server status:', healthData.status);
    } else {
      console.error('❌ Health check failed');
      process.exit(1);
    }
    
    // We'll need to directly look at test-output.css after running this test
    // to verify the CSS contains design system variables
    console.log('\nVerifying CSS generator functionality indirectly...');
    console.log('Connecting to database to fetch talent...');
    
    // Import the necessary modules
    const { getTalentById } = await import('../dist/db/index.js');
    const talent = await getTalentById('talent_001'); // Use Olivia Gray's talent ID
    
    if (!talent) {
      console.error('❌ Talent not found in database');
      process.exit(1);
    }
    
    console.log(`✅ Found talent: ${talent.name}`);
    
    // Parse the metadata JSON if needed
    let parsedTalent = talent;
    if (typeof talent.metadata === 'string') {
      const metadata = JSON.parse(talent.metadata);
      parsedTalent = { ...talent, ...metadata };
    }
    
    // Check if design_profile.design_system field exists (new format)
    if (parsedTalent.design_profile && parsedTalent.design_profile.design_system) {
      console.log('✅ design_system field exists in design_profile');
      
      // Import the CSS generator and test it directly
      const { default: cssGenerator } = await import('../dist/utils/css-generator.js');
      
      // Generate CSS for a button
      const css = cssGenerator.generateComponentCss(parsedTalent, { 
        component: 'button', 
        state: 'default' 
      });
      
      // Save CSS to file
      fs.writeFileSync(outputPath, css);
      console.log(`CSS saved to ${outputPath}`);
      
      // Print out a portion of the CSS
      console.log('\nGenerated CSS (first 10 lines):');
      console.log('--------------------------');
      console.log(css.split('\n').slice(0, 10).join('\n'));
      console.log('--------------------------');
      
      // Check if CSS includes design system variables
      if (css.includes('var(--u-color') || css.includes('var(--color-')) {
        console.log('✅ CSS contains design system variables');
      } else {
        console.log('❌ CSS does not contain design system variables');
      }
      
      console.log('\nMCP server functionality verification complete');
    } else if (parsedTalent.design_system) {
      // Old format where design_system is directly in metadata
      console.log('✅ design_system field exists directly in metadata (old format)');
      
      // Import the CSS generator
      const { default: cssGenerator } = await import('../dist/utils/css-generator.js');
      
      // Transform to new format on the fly
      const transformedTalent = {
        ...parsedTalent,
        design_profile: {
          id: parsedTalent.id,
          name: parsedTalent.name,
          description: parsedTalent.description || '',
          aesthetic_characteristics: parsedTalent.aesthetic_characteristics,
          design_attributes: parsedTalent.design_attributes,
          color_palette: parsedTalent.color_palette,
          typography: parsedTalent.typography,
          design_system: parsedTalent.design_system
        }
      };
      
      // Generate CSS with transformed format
      const css = cssGenerator.generateComponentCss(transformedTalent, { 
        component: 'button', 
        state: 'default' 
      });
      
      // Save CSS to file
      fs.writeFileSync(outputPath, css);
      console.log(`CSS saved to ${outputPath}`);
      
      // Print out a portion of the CSS
      console.log('\nGenerated CSS (first 10 lines):');
      console.log('--------------------------');
      console.log(css.split('\n').slice(0, 10).join('\n'));
      console.log('--------------------------');
      
      console.log('\nMCP server functionality verification complete');
    } else {
      console.error('❌ design_system field is missing from both design_profile and metadata');
    }
  } catch (error) {
    console.error('Error during test:', error);
    process.exit(1);
  }
}

// Run the test
testHttpEndpoints(); 