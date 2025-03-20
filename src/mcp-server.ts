import { McpServer, ResourceTemplate, ListResourcesCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

// Import database functions and types
import db, { 
  TalentProfile, 
  getTalentById, 
  getAllTalents, 
  getTalentsByAttribute,
  queryTalents,
  getDefaultTalentId
} from './db/index.js';

// Import CSS generation utilities
import cssGenerator from './utils/css-generator.js';

/**
 * Create and configure an MCP server for Popmelt
 */
export async function createMcpServer(): Promise<McpServer> {
  // Create the MCP server
  const server = new McpServer({
    name: 'Popmelt',
    version: '1.0.0',
  });
  
  // Register talent list resource
  server.resource(
    'talent-list',
    'talent://list',
    async (uri) => {
      try {
        const talents = await getAllTalents();
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(talents, null, 2),
            mediaType: 'application/json'
          }]
        };
      } catch (error) {
        console.error('Error fetching talent list:', error);
        throw new Error('Failed to fetch talent list');
      }
    }
  );
  
  // Define list resources callback
  const listTalentsCallback: ListResourcesCallback = async () => {
    const talents = await getAllTalents();
    return {
      resources: talents.map((talent) => ({
        name: talent.name,
        uri: `talent://${talent.id}`,
        description: talent.description
      }))
    };
  };
  
  // Add individual talent resource
  server.resource(
    'talent',
    new ResourceTemplate('talent://{id}', { list: listTalentsCallback }),
    async (uri, { id }) => {
      try {
        // Ensure id is a string
        const talentId = Array.isArray(id) ? id[0] : id;
        
        const talent = await getTalentById(talentId);
        
        if (!talent) {
          throw new Error(`Talent with ID ${talentId} not found`);
        }
        
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(talent, null, 2),
            mediaType: 'application/json'
          }]
        };
      } catch (error) {
        console.error(`Error fetching talent ${id}:`, error);
        throw new Error(`Failed to fetch talent with ID ${id}`);
      }
    }
  );
  
  // Add default talent resource
  server.resource(
    'default-talent',
    'talent://default',
    async (uri) => {
      try {
        // Get the default talent ID (which should be Olivia Gray's ID: talent_001)
        const defaultId = await getDefaultTalentId();
        
        // Fetch the default talent
        const talent = await getTalentById(defaultId);
        
        if (!talent) {
          throw new Error(`Default talent with ID ${defaultId} not found`);
        }
        
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(talent, null, 2),
            mediaType: 'application/json'
          }]
        };
      } catch (error) {
        console.error(`Error fetching default talent:`, error);
        throw new Error(`Failed to fetch default talent`);
      }
    }
  );
  
  // Add talent attribute resource
  server.resource(
    'talent-attribute',
    new ResourceTemplate('talent-attribute://{id}/{attribute}', { list: undefined }),
    async (uri, { id, attribute }) => {
      try {
        // Ensure id is a string
        const talentId = Array.isArray(id) ? id[0] : id;
        // Ensure attribute is a string
        const attrName = Array.isArray(attribute) ? attribute[0] : attribute;
        
        const talent = await getTalentById(talentId);
        
        if (!talent) {
          throw new Error(`Talent with ID ${talentId} not found`);
        }
        
        // Handle nested attributes using dot notation
        const attributePath = attrName.split('.');
        let value: any = talent;
        
        for (const path of attributePath) {
          if (value && typeof value === 'object' && path in value) {
            value = value[path];
          } else {
            throw new Error(`Attribute ${attrName} not found in talent ${talentId}`);
          }
        }
        
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(value, null, 2),
            mediaType: 'application/json'
          }]
        };
      } catch (error) {
        console.error(`Error fetching talent attribute:`, error);
        throw new Error(`Failed to fetch talent attribute: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );
  
  // Generate CSS for a component based on talent ID
  server.resource(
    'generate-css',
    new ResourceTemplate('popmelt://{talent_id}/css/{component}', { list: undefined }),
    async (uri, { talent_id, component }) => {
      try {
        // Validate component type
        const validComponents = ['button', 'card', 'input', 'navbar', 'modal', 'table'];
        const componentType = Array.isArray(component) ? component[0] : component;
        
        if (!validComponents.includes(componentType)) {
          throw new Error(`Invalid component type: ${componentType}. Must be one of: ${validComponents.join(', ')}`);
        }
        
        // Ensure talent_id is a string
        const talentId = Array.isArray(talent_id) ? talent_id[0] : talent_id;
        
        // Get the talent profile
        const talent = await getTalentById(talentId);
        
        if (!talent) {
          throw new Error(`Talent with ID ${talentId} not found`);
        }
        
        // Check if talent has the required design_profile field
        if (!talent.design_profile) {
          throw new Error(`Talent with ID ${talentId} does not have a design_profile`);
        }
        
        // Parse URL search params for state and custom properties
        const url = new URL(uri.href);
        const state = url.searchParams.get('state') || 'default';
        const customProps: Record<string, string | number> = {};
        
        // Extract custom properties from search params
        for (const [key, value] of url.searchParams.entries()) {
          if (key !== 'state' && key !== 'component') {
            // Try to convert to number if possible
            customProps[key] = isNaN(Number(value)) ? value : Number(value);
          }
        }
        
        // Generate the component CSS
        const css = cssGenerator.generateComponentCss(talent, {
          component: componentType as any,
          state: state as any,
          customProperties: customProps
        });
        
        return {
          contents: [{
            uri: uri.href,
            text: css,
            mediaType: 'text/css'
          }]
        };
      } catch (error) {
        console.error('Error generating CSS:', error);
        throw new Error(`Failed to generate CSS: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );
  
  // Generate a complete component library CSS based on talent ID
  server.resource(
    'generate-component-library',
    new ResourceTemplate('popmelt://{talent_id}/component-library', { list: undefined }),
    async (uri, { talent_id }) => {
      try {
        // Ensure talent_id is a string
        const talentId = Array.isArray(talent_id) ? talent_id[0] : talent_id;
        
        // Get the talent profile
        const talent = await getTalentById(talentId);
        
        if (!talent) {
          throw new Error(`Talent with ID ${talentId} not found`);
        }
        
        // Check if talent has the required design_profile field
        if (!talent.design_profile) {
          throw new Error(`Talent with ID ${talentId} does not have a design_profile`);
        }
        
        // Generate the complete component library CSS
        const css = cssGenerator.generateComponentLibraryCss(talent);
        
        return {
          contents: [{
            uri: uri.href,
            text: css,
            mediaType: 'text/css'
          }]
        };
      } catch (error) {
        console.error('Error generating component library:', error);
        throw new Error(`Failed to generate component library: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );
  
  // Return the configured server
  return server;
} 