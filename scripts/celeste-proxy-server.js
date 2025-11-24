#!/usr/bin/env node
/**
 * Local Celeste Proxy Server for Testing
 * Runs the same proxy logic locally before deploying to Cloudflare Workers
 */

import http from 'http';
import { handleProxyRequest } from '../src/lib/celeste-proxy.js';

const PORT = process.env.PROXY_PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Load environment variables
const env = {
  CELESTE_AGENT_KEY: process.env.CELESTE_AGENT_KEY,
  CELESTE_AGENT_ID: process.env.CELESTE_AGENT_ID,
  CELESTE_AGENT_BASE_URL: process.env.CELESTE_AGENT_BASE_URL
};

// Validate environment
if (!env.CELESTE_AGENT_KEY || !env.CELESTE_AGENT_ID || !env.CELESTE_AGENT_BASE_URL) {
  console.error('❌ Missing required environment variables:');
  console.error('   CELESTE_AGENT_KEY');
  console.error('   CELESTE_AGENT_ID');
  console.error('   CELESTE_AGENT_BASE_URL');
  process.exit(1);
}

console.log('✅ Configuration validated');
console.log(`   Agent ID: ${env.CELESTE_AGENT_ID.substring(0, 8)}...`);
console.log(`   Base URL: ${env.CELESTE_AGENT_BASE_URL}`);

// Create server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // Handle health check directly
  if (url.pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'Celeste Widget API Proxy',
      timestamp: Date.now() / 1000,
      agent_id: env.CELESTE_AGENT_ID ? env.CELESTE_AGENT_ID.substring(0, 8) + '...' : 'not configured'
    }));
    return;
  }
  
  // Convert Node.js request to Fetch API Request
  const fullUrl = `http://${req.headers.host}${req.url}`;
  
  // Read request body
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      // Create Fetch API Request object
      const request = new Request(fullUrl, {
        method: req.method,
        headers: req.headers,
        body: body || undefined
      });

      // Handle proxy request
      const response = await handleProxyRequest(request, env);

      // Send response
      res.statusCode = response.status;
      
      // Copy headers
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      // Send body
      const responseBody = await response.text();
      res.end(responseBody);
    } catch (error) {
      console.error('Server error:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 Celeste Proxy Server running on http://${HOST}:${PORT}`);
  console.log('   Endpoints:');
  console.log('   - POST /api/chat (widget requests)');
  console.log('   - GET /api/health (health check)');
});

