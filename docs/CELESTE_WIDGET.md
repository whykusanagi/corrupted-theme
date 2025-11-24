# Celeste Widget - Complete Setup & Integration Guide

**Status:** Production Ready | **Security:** Enterprise Grade | **Last Updated:** 2025-11-24

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Configuration](#configuration)
5. [Deployment](#deployment)
6. [Integration](#integration)
7. [Security](#security)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Celeste widget provides secure AI chat integration using a **backend proxy pattern**. API credentials stay on the server—the browser never sees them.

### Key Features

✅ **Zero Browser Exposure** - Credentials never leave the server
✅ **Secure Proxy Pattern** - Backend handles authentication
✅ **Production Ready** - Docker, Node.js, and Cloudflare Worker support
✅ **Easy Integration** - Drop-in widget script
✅ **Fully Configurable** - Environment-based setup

---

## Quick Start

### Docker (Recommended)

```bash
# Build
docker build -t my-theme:latest .

# Run with environment variables
docker run -d \
  -p 8000:8000 \
  -e CELESTE_AGENT_KEY="your-api-key" \
  -e CELESTE_AGENT_ID="your-agent-id" \
  -e CELESTE_AGENT_BASE_URL="https://your-endpoint" \
  my-theme:latest

# Access at http://localhost:8000
```

### Local Development (Node.js)

**Terminal 1: Start proxy server (port 5000)**
```bash
CELESTE_AGENT_KEY="your-key" \
CELESTE_AGENT_ID="your-id" \
CELESTE_AGENT_BASE_URL="https://your-endpoint" \
node scripts/celeste-proxy-server.js
```

**Terminal 2: Start static server (port 8000)**
```bash
npm run dev:static
```

Access at `http://localhost:8000`

---

## Architecture

### Two-Server Model

```
┌─ PORT 8000: Static HTTP Server ─────────┐
│ - Serves HTML, CSS, JS                  │
│ - Hosts widget script                   │
│ - Users access this port                │
└─────────────────────────────────────────┘

┌─ PORT 5000: Celeste API Proxy ──────────┐
│ - Receives /api/chat requests           │
│ - Reads credentials from environment    │
│ - Authenticates with Celeste API        │
│ - Returns responses to widget           │
└─────────────────────────────────────────┘
```

### Request Flow

```
1. Browser loads page (port 8000)
2. Widget script initializes
3. User sends message
4. Widget calls http://localhost:5000/api/chat
5. Proxy authenticates with CELESTE_AGENT_KEY
6. Proxy calls Celeste API with Bearer token
7. Response returned to widget
8. User sees Celeste's reply
```

### Security Boundaries

```
BROWSER (Untrusted)
├─ No credentials injected
├─ No API keys in code
├─ No auth headers sent
└─ Can only call /api/chat endpoint

BACKEND (Trusted)
├─ Has CELESTE_AGENT_KEY in environment
├─ Validates all requests
├─ Handles authentication
└─ Communicates with Celeste API
```

---

## Configuration

### Required Environment Variables

All three variables are **required** and must be provided:

| Variable | Type | Format | Source |
|----------|------|--------|--------|
| `CELESTE_AGENT_KEY` | Secret Token | 32-character string | DigitalOcean Agent Settings |
| `CELESTE_AGENT_ID` | UUID | 8-4-4-4-12 hex format | DigitalOcean Agent Details |
| `CELESTE_AGENT_BASE_URL` | API URL | `https://subdomain.agents.do-ai.run` | DigitalOcean Deployment |

### Getting Your Credentials

1. **Log into DigitalOcean**
   - Go to AI Agents section
   - Find your agent

2. **Copy Agent ID**
   - Located in agent overview
   - UUID format (36 characters)

3. **Copy API Key**
   - In Agent Settings → API Keys
   - ⚠️ Save securely - can't be viewed again!

4. **Copy API Endpoint**
   - From deployment details
   - Format: `https://xxxxx.agents.do-ai.run`

### Using .env File

Create `.env` file for local development (DO NOT commit):

```bash
CELESTE_AGENT_KEY=your-32-character-api-key
CELESTE_AGENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
CELESTE_AGENT_BASE_URL=https://your-subdomain.agents.do-ai.run
```

See `examples/.env.example` for template.

---

## Deployment

### Docker Production

```bash
docker build -t my-theme:latest .

docker run -d \
  --name celeste-app \
  -p 8000:8000 \
  -e CELESTE_AGENT_KEY="$YOUR_KEY" \
  -e CELESTE_AGENT_ID="$YOUR_ID" \
  -e CELESTE_AGENT_BASE_URL="$YOUR_URL" \
  --restart always \
  my-theme:latest
```

### With Docker Compose

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      CELESTE_AGENT_KEY: ${CELESTE_AGENT_KEY}
      CELESTE_AGENT_ID: ${CELESTE_AGENT_ID}
      CELESTE_AGENT_BASE_URL: ${CELESTE_AGENT_BASE_URL}
    restart: always
```

### Cloudflare Workers

The widget can also run with Cloudflare Workers for global distribution:

1. Deploy to Cloudflare Pages
2. Set environment variables in Workers Settings
3. Widget auto-detects production URL
4. All security benefits remain

---

## Integration

### Include Widget in HTML

```html
<!-- Load the widget script -->
<script src="/src/lib/celeste-widget.js"></script>

<!-- Initialize widget -->
<script>
  const celeste = new CelesteAgent();
  celeste.initialize();
</script>
```

### Configuration Object

Optionally pass custom configuration:

```javascript
const celeste = new CelesteAgent({
  proxyUrl: 'http://localhost:5000',  // Custom proxy URL
  agentKey: 'optional-override',
  agentId: 'optional-override',
  agentBaseUrl: 'optional-override'
});
celeste.initialize();
```

### CSS Customization

The widget uses CSS variables from corrupted-theme:

```css
:root {
  --accent: #d94f90;           /* Primary color */
  --text: #f5f1f8;             /* Text color */
  --bg: #0a0a0a;               /* Background */
  --glass: rgba(20, 12, 40, 0.7); /* Glass effect */
}
```

---

## Security

### Security Model

**✅ What's Protected:**
- API credentials never in browser memory
- No credentials in HTML source
- No tokens in network requests (from browser)
- No hardcoded secrets in code
- Environment-only configuration

**❌ What's Not Protected (By Design):**
- Network traffic between browser and proxy (use HTTPS in production)
- Proxy server itself (must be trusted infrastructure)
- Environment variables on server (standard practice)

### Best Practices

1. **Rotate credentials regularly**
   - Change API key every 90 days
   - Update all deployments

2. **Use separate keys per environment**
   - Development key
   - Staging key
   - Production key

3. **Monitor API usage**
   - Check DigitalOcean dashboard
   - Alert on unusual patterns

4. **Secure the proxy server**
   - Use HTTPS in production
   - Restrict access if needed
   - Keep dependencies updated

5. **Never commit .env**
   - Always use `.env.example`
   - Keep `.env` in `.gitignore`
   - Use environment variable management

### Verification

**Test no credentials in HTML:**
```bash
curl http://localhost:8000 | grep -i "CELESTE_AGENT_KEY"
# Should return nothing
```

**Test proxy health:**
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"ok",...}
```

**Test widget communication:**
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "history": [],
    "system_prompt": "You are helpful"
  }'
```

---

## Troubleshooting

### Widget Not Appearing

**Problem:** Chat button doesn't appear on page

**Checklist:**
- [ ] `celeste-widget.js` is loaded in HTML
- [ ] `CelesteAgent` class initializes without errors
- [ ] Check browser console for errors
- [ ] Verify DOM is ready before initialization

**Fix:**
```html
<!-- Load after DOM is ready -->
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const celeste = new CelesteAgent();
    celeste.initialize();
  });
</script>
```

### "Cannot reach proxy"

**Problem:** Widget shows error reaching API

**Causes:**
- Proxy server not running
- Wrong proxy URL configured
- Port 5000 in use
- Network/firewall blocking

**Diagnosis:**
```bash
# Check if proxy is running
curl http://localhost:5000/api/health

# Check if port is in use
lsof -i :5000

# Check Docker container logs
docker logs <container-id>
```

### "Authentication failed"

**Problem:** Proxy returns 401 error

**Causes:**
- Invalid `CELESTE_AGENT_KEY`
- Key not set in environment
- Key was revoked in DigitalOcean

**Fix:**
```bash
# Verify environment variable is set
echo $CELESTE_AGENT_KEY

# Restart container/service with correct key
docker restart <container-id>
```

### "Service unavailable" (503)

**Problem:** Celeste API endpoint unreachable

**Causes:**
- Endpoint URL is incorrect
- DigitalOcean service down
- Network connectivity issue

**Fix:**
```bash
# Test endpoint directly
curl https://your-subdomain.agents.do-ai.run/health

# Verify URL format
echo $CELESTE_AGENT_BASE_URL
```

### Nothing Showing in Console

**Problem:** No errors but widget doesn't work

**Debug:**
```javascript
// Check if widget initialized
console.log(window.CelesteAgent);

// Check if DOM element exists
console.log(document.getElementById('celeste-widget'));

// Check if proxy URL detected correctly
const celeste = new CelesteAgent();
console.log(celeste.proxyUrl);
```

---

## Files Overview

| File | Purpose |
|------|---------|
| `src/lib/celeste-widget.js` | Widget UI and logic |
| `src/lib/celeste-proxy.js` | Shared proxy handler |
| `scripts/celeste-proxy-server.js` | Node.js proxy server |
| `scripts/static-server.js` | Node.js static server |
| `Dockerfile` | Docker build config |
| `docker-entrypoint.sh` | Container startup |
| `package.json` | Node dependencies |

---

## Support & Questions

- 📖 See `examples/.env.example` for configuration template
- 🐛 Report issues on GitHub
- 💬 Check troubleshooting section above
- 📚 Review source code for implementation details

---

## License

MIT - See LICENSE file for details
