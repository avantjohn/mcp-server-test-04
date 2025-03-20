import { fileURLToPath } from 'url';
import path from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test the MCP server's HTTP endpoint directly
 */
async function testMcpServer() {
  try {
    console.log('Testing MCP Server endpoints...');
    
    // Generate a unique client ID for this test
    const clientId = `client_${Date.now()}`;
    console.log('Client ID:', clientId);
    
    // Base URL for the HTTP server
    const baseUrl = 'http://localhost:3000';
    
    // First check server health
    console.log('\nChecking server health...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed');
      console.log('Server status:', healthData.status);
    } else {
      console.error('❌ Health check failed:', healthResponse.status);
      process.exit(1);
    }
    
    // Test CSS generation endpoint
    console.log('\nTesting CSS generation endpoint...');
    const generateResponse = await fetch(`${baseUrl}/api/css/talent_001/button`);
    
    if (generateResponse.ok) {
      console.log('✅ CSS generation successful');
      const css = await generateResponse.text();
      
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
    } else {
      console.error('❌ CSS generation failed:', await generateResponse.text());
    }
    
    // Test talent list endpoint
    console.log('\nTesting talent list endpoint...');
    const talentsResponse = await fetch(`${baseUrl}/api/talents`);
    
    if (talentsResponse.ok) {
      console.log('✅ Talent list retrieved successfully');
      const talents = await talentsResponse.json();
      console.log(`Found ${talents.length} talents:`);
      
      // Print talent names
      for (const talent of talents) {
        console.log(`- ${talent.id}: ${talent.name}`);
      }
    } else {
      console.error('❌ Talent list retrieval failed:', await talentsResponse.text());
    }
    
    console.log('\nMCP Server test completed successfully!');
  } catch (error) {
    console.error('Error testing MCP server:', error);
    process.exit(1);
  }
}

// Run the test
testMcpServer(); 