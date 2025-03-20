# Popmelt MCP Server

An MCP (Model Context Protocol) server for Popmelt, providing access to Talent AI and Taste Profiles for dynamic UI component styling.

## Overview

The Popmelt MCP Server leverages the Model Context Protocol to expose Talent AI profiles and styling capabilities to LLMs and other applications. It connects directly to Popmelt's PostgreSQL database to access and serve detailed Talent profiles, including structured metadata and weighted styling attributes.

## Features

- **Talent AI Profile Access**: Retrieve complete Talent profiles with their unique aesthetic characteristics and design attributes
- **CSS Styling Generation**: Generate CSS styling rules directly from stored metadata
- **Dynamic UI Component Styling**: Easily integrate Talent-driven design choices into your UI components
- **Database Integration**: Direct connection to PostgreSQL database where Talent profiles are stored
- **Multiple Transport Options**: Run the server using stdio for command-line tools or HTTP with SSE for remote servers

## Project Structure

```
popmelt-mcp-server/
├── src/                         # Source code
│   ├── db/                      # Database access layer
│   │   └── index.ts             # Database connection and query functions
│   ├── utils/                   # Utility modules
│   │   └── css-generator.ts     # CSS generation utilities
│   ├── mcp-server.ts            # MCP server core implementation
│   ├── server.ts                # Stdio transport server
│   └── http-server.ts           # HTTP/SSE transport server
├── scripts/                     # Helper scripts
│   ├── setup-db.sql             # SQL for setting up the database
│   └── setup-db.js              # Script to run the SQL setup
├── examples/                    # Example client usage
│   └── generate-css.js          # Example script to generate CSS
├── dist/                        # Compiled TypeScript output
├── package.json                 # Project configuration
└── tsconfig.json                # TypeScript configuration
```

## Database Schema

The Popmelt MCP Server uses a PostgreSQL database with the following schema:

```sql
CREATE TABLE talents (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB NOT NULL
);
```

Where the `metadata` JSON field has the following structure:

```json
{
  "aesthetic_characteristics": {
    "style": "minimalist",
    "mood": "calm",
    "complexity": 2,
    "minimalism": 9,
    "boldness": 3,
    "playfulness": 2,
    "elegance": 8
  },
  "design_attributes": {
    "whitespace_balance": 9,
    "color_harmony": 7,
    "visual_rhythm": 6,
    "layout_density": 2,
    "texture_use": 1,
    "border_use": 2,
    "shadow_use": 3
  },
  "color_palette": {
    "primary": "#2D3748",
    "secondary": "#4A5568",
    "accent": "#38B2AC",
    "background": "#FFFFFF",
    "text": "#1A202C"
  },
  "typography": {
    "headingFont": "Inter, sans-serif",
    "bodyFont": "Inter, sans-serif",
    "scale": 1.2,
    "weight": "light",
    "letterSpacing": 0.02,
    "lineHeight": 1.5
  }
}
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the example environment file and update with your database details:
   ```
   cp .env.example .env
   ```
4. Set up the database:
   ```
   node scripts/setup-db.js
   ```
5. Build the TypeScript code:
   ```
   npm run build
   ```

### Running the Server

Two server modes are available:

1. **Standard stdio mode** (for command-line tools and direct integration):
```bash
npm start
```

2. **HTTP server with SSE support** (for remote access and web integration):
```bash
npm run start:http
```

The HTTP server provides:
- An SSE endpoint at `/sse` for receiving real-time updates
- A POST endpoint at `/messages` for sending commands
- A health check endpoint at `/health`

## API Reference

### Resources

The server exposes the following MCP resources:

| Resource URI | Description |
|--------------|-------------|
| `talent://list` | List all available talent profiles |
| `talent://{id}` | Get a specific talent profile by ID |
| `talent-attribute://{id}/{attribute}` | Get a specific attribute of a talent (supports dot notation for nested properties) |
| `component-style://{talent_id}/{component_name}` | Get CSS for a specific component using a talent profile |

### Tools

The server provides the following MCP tools:

| Tool Name | Description | Arguments |
|-----------|-------------|-----------|
| `generate-css` | Generate CSS for a component based on a talent profile | `talentId`, `component`, `state` (optional), `customProperties` (optional) |
| `generate-component-library` | Generate CSS for a complete component library | `talentId` |
| `query-talents` | Perform a read-only query on talent metadata | `filters` |
| `analyze-style-compatibility` | Analyze compatibility between different talent styles | `talentId1`, `talentId2` |

### Prompts

The server offers the following MCP prompts:

| Prompt Name | Description | Arguments |
|-------------|-------------|-----------|
| `style-component` | LLM prompt for styling a component | `talentId`, `component`, `requirements` (optional) |
| `create-talent-description` | LLM prompt for creating a descriptive summary of a talent | `talentId` |
| `recommend-talent` | LLM prompt for recommending talents based on requirements | `projectType`, `brandPersonality`, `targetAudience`, `aestheticPreferences` (optional) |

## Example Usage

### Using the MCP Client

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Create transport
const transport = new StdioClientTransport({
  command: 'node',
  args: ['dist/server.js']
});

// Create client
const client = new Client(
  { name: 'example-client', version: '1.0.0' },
  { capabilities: { resources: {}, tools: {} } }
);

// Connect to server
await client.connect(transport);

// List all talents
const talents = await client.listResources('talent://');

// Get a specific talent
const talent = await client.readResource('talent://modern-minimalist');

// Generate CSS for a button
const css = await client.callTool({
  name: 'generate-css',
  arguments: {
    talentId: 'modern-minimalist',
    component: 'button',
    state: 'hover'
  }
});

// Analyze compatibility between two talents
const compatibility = await client.callTool({
  name: 'analyze-style-compatibility',
  arguments: {
    talentId1: 'modern-minimalist',
    talentId2: 'bold-vibrant'
  }
});
```

### Running the Example Script

```
node examples/generate-css.js
```

This example script demonstrates how to use the MCP client to generate CSS for all available talents and analyze compatibility between two talents.

## Development

### Building the Project

```
npm run build
```

### Running in Development Mode

```
npm run dev
```

## License

MIT
