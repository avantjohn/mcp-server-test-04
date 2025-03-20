import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import our MCP server setup function (without transport)
import { createMcpServer } from './mcp-server.js';

// Import database functions
import { getTalentById, getAllTalents, getDefaultTalentId } from './db/index.js';

const PORT = process.env.SERVER_PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

/**
 * Start the HTTP server with SSE support for MCP
 */
async function startHttpServer() {
  try {
    // Create Express app
    const app = express();
    
    // Configure middleware
    app.use(express.json());
    app.use(cors({
      origin: CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true
    }));
    
    // Simple health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok' });
    });
    
    // Create our MCP server
    const mcpServer = await createMcpServer();
    
    // Map of client IDs to their transports
    const clients = new Map<string, SSEServerTransport>();
    
    // SSE endpoint for clients to connect
    app.get('/sse', async (req, res) => {
      const clientId = req.query.clientId as string || `client_${Date.now()}`;
      
      // Set headers for SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Create a transport for this client
      const transport = new SSEServerTransport('/messages', res);
      
      // Store the transport
      clients.set(clientId, transport);
      
      // Connect the transport to the MCP server
      // This starts sending messages to the client
      await mcpServer.connect(transport);
      
      // When the client disconnects, remove the transport
      req.on('close', () => {
        clients.delete(clientId);
        // SSE transport doesn't have disconnect method, it will close when response ends
      });
    });
    
    // Endpoint for clients to send messages
    app.post('/messages', async (req, res) => {
      const clientId = req.query.clientId as string;
      
      if (!clientId || !clients.has(clientId)) {
        return res.status(400).json({ error: 'Client not connected. Please connect to /sse first.' });
      }
      
      const transport = clients.get(clientId)!;
      await transport.handlePostMessage(req, res);
    });
    
    // Add REST API endpoints for talent resources
    
    // Get all talents
    app.get('/api/talents', async (req, res) => {
      try {
        const talents = await getAllTalents();
        res.status(200).json(talents);
      } catch (error) {
        console.error('Error fetching talents:', error);
        res.status(500).json({ error: 'Failed to fetch talents' });
      }
    });
    
    // Get default talent (Olivia Gray)
    app.get('/api/talents/default', async (req, res) => {
      try {
        const defaultId = await getDefaultTalentId();
        const talent = await getTalentById(defaultId);
        
        if (!talent) {
          return res.status(404).json({ error: `Default talent not found` });
        }
        
        res.status(200).json(talent);
      } catch (error) {
        console.error('Error fetching default talent:', error);
        res.status(500).json({ error: 'Failed to fetch default talent' });
      }
    });
    
    // Get talent by ID
    app.get('/api/talents/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const talent = await getTalentById(id);
        
        if (!talent) {
          return res.status(404).json({ error: `Talent with ID ${id} not found` });
        }
        
        res.status(200).json(talent);
      } catch (error) {
        console.error(`Error fetching talent ${req.params.id}:`, error);
        res.status(500).json({ error: `Failed to fetch talent with ID ${req.params.id}` });
      }
    });
    
    // Generate CSS for a component
    app.get('/api/css/:talentId/:component', async (req, res) => {
      try {
        const talentId = req.params.talentId;
        const component = req.params.component;
        const state = req.query.state as string || 'default';
        
        // Get talent
        let talent;
        if (talentId === 'default') {
          const defaultId = await getDefaultTalentId();
          talent = await getTalentById(defaultId);
        } else {
          talent = await getTalentById(talentId);
        }
        
        if (!talent) {
          return res.status(404).json({ error: `Talent with ID ${talentId} not found` });
        }
        
        // Check if talent has design_profile
        if (!talent.design_profile) {
          return res.status(400).json({ error: `Talent with ID ${talentId} does not have a design_profile` });
        }
        
        // Check if component is valid
        const validComponents = ['button', 'card', 'input', 'navbar', 'modal', 'table'];
        if (!validComponents.includes(component)) {
          return res.status(400).json({ error: `Invalid component: ${component}` });
        }
        
        // Check if state is valid
        const validStates = ['default', 'hover', 'active', 'disabled', 'focus'];
        if (state && !validStates.includes(state)) {
          return res.status(400).json({ error: `Invalid state: ${state}` });
        }
        
        // Parse custom properties from query parameters
        const customProps: Record<string, string | number> = {};
        for (const [key, value] of Object.entries(req.query)) {
          if (key !== 'state' && typeof value === 'string') {
            // Try to convert to number if possible
            customProps[key] = isNaN(Number(value)) ? value : Number(value);
          }
        }
        
        // Import the CSS generator directly
        const cssGenerator = await import('./utils/css-generator.js');
        
        // Generate CSS
        const css = cssGenerator.default.generateComponentCss(talent, {
          component: component as any,
          state: state as any,
          customProperties: customProps
        });
        
        res.setHeader('Content-Type', 'text/css');
        res.status(200).send(css);
      } catch (error) {
        console.error('Error generating CSS:', error);
        res.status(500).json({ error: `Failed to generate CSS: ${error instanceof Error ? error.message : String(error)}` });
      }
    });
    
    // Add endpoint for generating complete component library CSS
    app.get('/api/component-library/:talentId', async (req, res) => {
      try {
        const talentId = req.params.talentId;
        
        // Get talent
        let talent;
        if (talentId === 'default') {
          const defaultId = await getDefaultTalentId();
          talent = await getTalentById(defaultId);
        } else {
          talent = await getTalentById(talentId);
        }
        
        if (!talent) {
          return res.status(404).json({ error: `Talent with ID ${talentId} not found` });
        }
        
        // Check if talent has design_profile
        if (!talent.design_profile) {
          return res.status(400).json({ error: `Talent with ID ${talentId} does not have a design_profile` });
        }
        
        // Import the CSS generator directly
        const cssGenerator = await import('./utils/css-generator.js');
        
        // Generate component library CSS
        const css = cssGenerator.default.generateComponentLibraryCss(talent);
        
        res.setHeader('Content-Type', 'text/css');
        res.status(200).send(css);
      } catch (error) {
        console.error('Error generating component library CSS:', error);
        res.status(500).json({ error: `Failed to generate component library CSS: ${error instanceof Error ? error.message : String(error)}` });
      }
    });
    
    // Create HTTP server and start listening
    const server = createServer(app);
    
    server.listen(PORT, () => {
      console.log(`Popmelt MCP Server listening on port ${PORT}`);
      console.log(`REST API available at http://localhost:${PORT}/api`);
      console.log(`Default talent available at http://localhost:${PORT}/api/talents/default`);
    });
    
    // Handle server shutdown
    const gracefulShutdown = async () => {
      console.log('Shutting down...');
      
      // Close all client connections
      for (const [clientId, transport] of clients.entries()) {
        // SSE transport doesn't have a disconnect method
        // We'll remove it from our map and let connections terminate naturally
        clients.delete(clientId);
      }
      
      // Close server
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    };
    
    // Listen for termination signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Start the server
startHttpServer();

export default startHttpServer; 