import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to save the generated CSS
const outputPath = path.join(__dirname, '..', 'test-output.css');

// Function to run the test
async function testCssGeneration() {
  console.log('Testing CSS generation via HTTP endpoint...');
  
  // Construct request body for the generate-css tool
  const requestBody = {
    name: 'mcp__generate_css',
    arguments: {
      talentId: 'modern-minimalist',
      component: 'button',
      state: 'default'
    }
  };
  
  try {
    // Make POST request to the server's HTTP endpoint
    console.log('Sending request to http://localhost:3000/mcp/invoke');
    const response = await fetch('http://localhost:3000/mcp/invoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Response type:', data.type);
    
    // Check if response contains CSS content
    if (data.type === 'tool_result' && data.content) {
      console.log('\nGenerated CSS from HTTP endpoint:');
      console.log('--------------------------');
      console.log(data.content);
      console.log('--------------------------');
      
      // Save CSS to file
      fs.writeFileSync(outputPath, data.content);
      console.log(`CSS saved to ${outputPath}`);
      
      // Check if CSS includes design system variables
      if (data.content.includes('var(--u-color-brand-primary)')) {
        console.log('✅ CSS contains design system variables');
      } else {
        console.log('❌ CSS does not contain design system variables');
      }
    } else {
      console.log('No CSS content found in response');
    }
  } catch (error) {
    console.error('Error occurred:', error.message);
  }
}

// Run the test
testCssGeneration(); 