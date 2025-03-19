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
        transport.disconnect();
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
    
    // Create HTTP server and start listening
    const server = createServer(app);
    
    server.listen(PORT, () => {
      console.log(`Popmelt MCP Server listening on port ${PORT}`);
    });
    
    // Handle server shutdown
    const gracefulShutdown = async () => {
      console.log('Shutting down...');
      
      // Close all client connections
      for (const transport of clients.values()) {
        transport.disconnect();
      }
      
      // Close server
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
      
      // Force exit after timeout
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };
    
    // Listen for termination signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    console.error('Failed to start HTTP server:', error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startHttpServer();
}

export { startHttpServer }; 