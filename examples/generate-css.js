#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the server script
const serverScriptPath = path.join(__dirname, '..', 'dist', 'server.js');

// Ensure output directory exists
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

async function main() {
  console.log('Starting MCP client...');
  
  // Create transport to communicate with the server
  const transport = new StdioClientTransport({
    command: 'node',
    args: [serverScriptPath]
  });
  
  // Create MCP client
  const client = new Client(
    {
      name: 'example-client',
      version: '1.0.0'
    },
    {
      capabilities: {
        resources: {},
        tools: {}
      }
    }
  );
  
  try {
    // Connect to the server
    console.log('Connecting to server...');
    await client.connect(transport);
    
    // List available talents
    console.log('Listing available talents...');
    const talents = await client.listResources('talent://');
    console.log(`Found ${talents.length} talents`);
    
    // Generate component library CSS for each talent
    for (const talentResource of talents) {
      const talentId = talentResource.uri.split('://')[1];
      console.log(`Generating component library CSS for ${talentId}...`);
      
      // Read talent profile
      const talentProfile = await client.readResource(`talent://${talentId}`);
      console.log(`Talent profile loaded: ${JSON.parse(talentProfile[0].text).name}`);
      
      // Generate component library CSS
      const result = await client.callTool({
        name: 'generate-component-library',
        arguments: {
          talentId
        }
      });
      
      // Save CSS to file
      const cssFileName = `${talentId}-components.css`;
      const cssFilePath = path.join(outputDir, cssFileName);
      fs.writeFileSync(cssFilePath, result[0].text);
      console.log(`CSS saved to ${cssFilePath}`);
      
      // Also generate a button example with custom properties
      console.log(`Generating custom button for ${talentId}...`);
      const buttonCss = await client.callTool({
        name: 'generate-css',
        arguments: {
          talentId,
          component: 'button',
          state: 'default',
          customProperties: {
            'border-radius': '8px',
            'text-transform': 'uppercase'
          }
        }
      });
      
      // Save button CSS to file
      const buttonFileName = `${talentId}-button.css`;
      const buttonFilePath = path.join(outputDir, buttonFileName);
      fs.writeFileSync(buttonFilePath, buttonCss[0].text);
      console.log(`Button CSS saved to ${buttonFilePath}`);
    }
    
    // Analyze style compatibility between two talents
    console.log('Analyzing style compatibility between two talents...');
    const compatibilityResult = await client.callTool({
      name: 'analyze-style-compatibility',
      arguments: {
        talentId1: 'modern-minimalist',
        talentId2: 'bold-vibrant'
      }
    });
    
    // Save compatibility analysis to file
    const analysisFilePath = path.join(outputDir, 'compatibility-analysis.md');
    fs.writeFileSync(analysisFilePath, compatibilityResult[0].text);
    console.log(`Compatibility analysis saved to ${analysisFilePath}`);
    
    console.log('All operations completed successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    // Disconnect the client
    await client.disconnect();
  }
}

main(); 