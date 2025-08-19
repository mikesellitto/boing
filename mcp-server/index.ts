#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Configuration
const API_URL = process.env.BOING_API_URL || '<YOUR_API_URL_HERE>/api/send';
const AUTH_TOKEN = process.env.BOING_AUTH_TOKEN || '<YOUR_AUTH_TOKEN_HERE>';

if (AUTH_TOKEN.includes('<YOUR_')) {
  console.error('Error: Please configure BOING_API_URL and BOING_AUTH_TOKEN environment variables');
  process.exit(1);
}

// Create MCP server
const server = new Server(
  {
    name: 'notify-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'send_notification',
        description: 'Send a push notification to your devices',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'The notification message to send',
            },
            title: {
              type: 'string',
              description: 'Optional title for the notification',
              default: 'Notification',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'quick_notify',
        description: 'Send a quick notification with preset messages',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['done', 'check_email', 'reminder', 'alert', 'test'],
              description: 'Type of quick notification to send',
            },
            custom_message: {
              type: 'string',
              description: 'Optional custom message to append',
            },
          },
          required: ['type'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'send_notification') {
      const { message, title = 'Notification' } = args;
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`,
        },
        body: JSON.stringify({ message, title }),
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'sent') {
        return {
          content: [
            {
              type: 'text',
              text: `✅ Notification sent successfully! (${data.sent} devices)`,
            },
          ],
        };
      } else {
        throw new Error(data.error || 'Failed to send notification');
      }
    }
    
    if (name === 'quick_notify') {
      const { type, custom_message } = args;
      
      const messages = {
        done: 'Task completed ✓',
        check_email: 'Check your email 📧',
        reminder: 'Reminder: ' + (custom_message || 'Check your tasks'),
        alert: '⚠️ Alert: ' + (custom_message || 'Attention needed'),
        test: 'Test notification ' + new Date().toLocaleTimeString(),
      };
      
      const message = messages[type] || type;
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`,
        },
        body: JSON.stringify({ 
          message, 
          title: type.charAt(0).toUpperCase() + type.slice(1) 
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'sent') {
        return {
          content: [
            {
              type: 'text',
              text: `✅ Quick notification "${type}" sent! Message: ${message}`,
            },
          ],
        };
      } else {
        throw new Error(data.error || 'Failed to send notification');
      }
    }
    
    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Notify MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});