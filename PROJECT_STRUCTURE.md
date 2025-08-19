# Boing - Project Structure

## Directory Layout

```
boing/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── send/            # Send notification endpoint
│   │   ├── subscribe/       # Subscribe to notifications
│   │   ├── notifications/   # Get notification history
│   │   └── clear/           # Clear data endpoints
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main UI page
│
├── lib/                      # Shared libraries
│   ├── config.ts            # Centralized configuration
│   ├── push-service.ts      # Push notification service
│   └── utils.ts             # Utility functions
│
├── public/                   # Static files
│   ├── sw.js                # Service Worker for push
│   ├── icon-192.png         # Notification icon
│   └── badge-72.png         # Notification badge
│
├── mcp-server/              # Model Context Protocol server
│   ├── index.js             # MCP server implementation
│   ├── package.json         # MCP dependencies
│   └── .env.example         # MCP configuration template
│
├── examples/                # Integration examples
│   ├── test-api.sh          # Bash API test script
│   ├── python-example.py    # Python client example
│   └── node-example.js      # Node.js client example
│
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── LICENSE                  # MIT License
├── README.md                # Main documentation
├── PROJECT_STRUCTURE.md     # This file
├── mcp-config.json          # MCP configuration example
├── package.json             # Project dependencies
└── tsconfig.json            # TypeScript configuration
```

## Key Components

### Web Application (`/app`)
- Next.js 15 application with App Router
- Provides web interface for managing notifications
- RESTful API endpoints for sending and managing notifications

### Push Service (`/lib/push-service.ts`)
- Modular service for handling Web Push notifications
- VAPID authentication
- Support for multiple subscribers
- Automatic cleanup of invalid subscriptions

### Configuration (`/lib/config.ts`)
- Centralized configuration management
- Environment variable validation
- Type-safe configuration access

### MCP Server (`/mcp-server`)
- Allows AI assistants to send notifications
- Implements Model Context Protocol
- Two tools: `send_notification` and `quick_notify`

### Service Worker (`/public/sw.js`)
- Handles push events in the browser
- Shows notifications with customizable options
- Supports click actions and data payloads

## Environment Variables

### Required
- `NEXT_PUBLIC_VAPID_PUBLIC` - VAPID public key
- `VAPID_PRIVATE` - VAPID private key
- `AUTH_TOKEN` - API authentication token (if auth enabled)

### Optional
- `VAPID_EMAIL` - Contact email for VAPID
- `ENABLE_AUTH` - Enable/disable API authentication
- `PUSH_TTL` - Time to live for notifications
- `PUSH_URGENCY` - Notification urgency level
- `MAX_NOTIFICATIONS` - Max stored notifications
- `MAX_SUBSCRIPTIONS` - Max concurrent subscriptions

### Vercel KV (Production)
- `KV_URL` - Vercel KV database URL
- `KV_REST_API_URL` - KV REST API URL
- `KV_REST_API_TOKEN` - KV API token

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/send` | POST | Send notification to all subscribers |
| `/api/subscribe` | POST | Subscribe to notifications |
| `/api/notifications` | GET | Get notification history |
| `/api/clear` | POST | Clear notification history |
| `/api/clear-subscriptions` | POST | Clear all subscriptions |

## MCP Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `send_notification` | Send custom notification | `message`, `title` |
| `quick_notify` | Send preset notification | `type`, `custom_message` |

## Development Workflow

1. **Setup Environment**
   ```bash
   cp .env.example .env.local
   npm run generate-keys  # Generate VAPID keys
   ```

2. **Development**
   ```bash
   npm run dev  # Start development server
   ```

3. **Testing**
   ```bash
   # Test API
   ./examples/test-api.sh
   
   # Test with Python
   python examples/python-example.py
   
   # Test with Node.js
   node examples/node-example.js
   ```

4. **Deployment**
   ```bash
   npm run build  # Build for production
   vercel --prod  # Deploy to Vercel
   ```

## Integration Patterns

### Direct API Integration
- Use REST API with Bearer token authentication
- Send POST requests to `/api/send`
- Suitable for server-side applications

### MCP Integration
- Configure MCP server in AI assistant
- Use natural language to trigger notifications
- Best for AI-assisted workflows

### Browser Subscription
- Users visit web interface
- Subscribe to push notifications
- Receive notifications in browser

## Security Considerations

- VAPID keys ensure only authorized servers can send
- Bearer token authentication for API access
- Automatic cleanup of expired subscriptions
- Environment variables for sensitive configuration
- HTTPS required for Web Push API