import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from './mcp-server.js';
import dotenv from 'dotenv';
import { closePool } from './db/index.js';

// Load environment variables
dotenv.config();

/**
 * Start the MCP server with stdio transport
 */
async function startServer() {
  try {
    // Create MCP server
    const server = await createMcpServer();
    
    // Create stdio transport
    const transport = new StdioServerTransport();
    
    // Connect server to transport
    await server.connect(transport);
    
    console.log('Popmelt MCP Server started with stdio transport');
    
    // Handle graceful shutdown
    const gracefulShutdown = async () => {
      console.log('Shutting down...');
      
      // Close database connection
      await closePool();
      
      console.log('Server closed');
      process.exit(0);
    };
    
    // Listen for termination signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

// Start the server
startServer(); 