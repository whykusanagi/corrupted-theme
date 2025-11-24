#!/usr/bin/env node
/**
 * Simple Static File Server
 * Serves static files for whykusanagi.xyz portfolio
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const PORT = process.env.STATIC_PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function serveFile(filePath, res) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  // Security: prevent directory traversal
  if (!fullPath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(fullPath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Try index.html for directories
      if (filePath.endsWith('/') || filePath === '') {
        const indexPath = path.join(fullPath, 'index.html');
        fs.stat(indexPath, (err2, stats2) => {
          if (err2 || !stats2.isFile()) {
            res.writeHead(404);
            res.end('Not Found');
          } else {
            serveFileContent(indexPath, res);
          }
        });
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
      return;
    }

    serveFileContent(fullPath, res);
  });
}

function serveFileContent(filePath, res) {
  const mimeType = getMimeType(filePath);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Internal Server Error');
      return;
    }

    res.writeHead(200, {
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=3600'
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // Parse URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  let filePath = url.pathname;

  // Default to index.html for root
  if (filePath === '/') {
    filePath = '/index.html';
  }

  // Remove leading slash
  filePath = filePath.substring(1);

  serveFile(filePath, res);
});

server.listen(PORT, HOST, () => {
  console.log(`📁 Static file server running on http://${HOST}:${PORT}`);
});

