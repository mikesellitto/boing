# Boing

Push notification service you can self-host. Built with Next.js and Web Push API.

## Quick Start

**Requirements:** Node.js 18+, Vercel account, smartphone

```bash
# Clone and generate keys
git clone https://github.com/mikesellitto/boing.git
cd boing
npm run setup  # Choose Vercel, save your keys!

# Deploy
npm i -g vercel
vercel --prod

# Configure on vercel.com/dashboard:
# 1. Settings → Environment Variables → Add:
#    NEXT_PUBLIC_VAPID_PUBLIC = (from setup)
#    VAPID_PRIVATE = (from setup)
#    AUTH_TOKEN = (from setup)
#    VAPID_EMAIL = mailto:<YOUR_EMAIL_HERE>
# 2. Storage → Create Database → Upstash → Continue →
#    Accept defaults → Create
# 3. Deployments → Redeploy (three dots menu) → Redeploy

# On your phone: visit https://<YOUR_APP_NAME>.vercel.app
# Enable notifications when prompted

# Test:
curl -X POST https://<YOUR_APP_NAME>.vercel.app/api/send \
  -H "Authorization: Bearer <YOUR_AUTH_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello","message":"Test"}'
```

## API

### Send Notification
```bash
POST /api/send
Authorization: Bearer <YOUR_AUTH_TOKEN>

{
  "title": "Title",
  "message": "Message",
  "url": "/optional-url"
}
```

### Subscribe
```bash
POST /api/subscribe

{
  "subscription": {
    "endpoint": "...",
    "keys": { "auth": "...", "p256dh": "..." }
  }
}
```

### Get History
```bash
GET /api/notifications
```

## Phone Setup

**iOS:** Safari → Visit app → Share → Add to Home Screen → Open from home → Enable Notifications

**Android:** Chrome → Visit app → Enable Notifications → Settings → Apps → Browser → Battery → Unrestricted

## MCP Integration

Add to Claude Desktop config:

```json
{
  "mcpServers": {
    "boing": {
      "command": "npx",
      "args": ["tsx", "/path/to/boing/mcp-server/index.ts"],
      "env": {
        "BOING_API_URL": "https://<YOUR_APP_NAME>.vercel.app/api/send",
        "BOING_AUTH_TOKEN": "<YOUR_AUTH_TOKEN>"
      }
    }
  }
}
```

## Self-Hosted Deployment

```bash
npm run setup  # Choose self-hosted
npm run build
PORT=3000 npm start
```

Requires: HTTPS certificate, Redis/PostgreSQL database, all environment variables from setup

## Configuration

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_VAPID_PUBLIC` | VAPID public key |
| `VAPID_PRIVATE` | VAPID private key |
| `AUTH_TOKEN` | Bearer token |
| `VAPID_EMAIL` | mailto:<YOUR_EMAIL_HERE> |
| `ENABLE_AUTH` | Enable authentication (default: true) |

## Troubleshooting

- **iOS not working?** Must use Safari and add to home screen first
- **Android delays?** Disable battery optimization
- **No notifications?** Check browser permissions and auth token

## License

MIT