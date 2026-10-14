#!/usr/bin/env node
// Generate self-contained HTTP error documents for static-asset deployments.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { httpErrors } from '../src/core/http-errors.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'errors');
const css = [
  readFileSync(path.join(root, 'src/css/variables.css'), 'utf8'),
  readFileSync(path.join(root, 'src/css/error-pages.css'), 'utf8'),
].join('\n');

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

export function renderErrorPage(code, { title, line }) {
  if (!Number.isInteger(Number(code)) || !/^[45]\d\d$/.test(String(code))) {
    throw new RangeError('Expected a 4xx or 5xx HTTP status code');
  }
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${escapeHtml(code)} ${escapeHtml(title)} | Corrupted Theme</title>
  <style>${css}</style>
</head>
<body>
  <main class="error-page">
    <p class="error-code">${escapeHtml(code)}</p>
    <h1 class="error-title">${escapeHtml(title)}</h1>
    <p class="error-line">${escapeHtml(line)}</p>
    <nav class="error-links" aria-label="Error page actions">
      <a href="/">Back to home</a>
    </nav>
  </main>
</body>
</html>
`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  mkdirSync(outDir, { recursive: true });
  for (const [code, copy] of Object.entries(httpErrors)) {
    writeFileSync(path.join(outDir, `${code}.html`), renderErrorPage(code, copy));
  }
  console.log(`Generated ${Object.keys(httpErrors).length} error pages in errors/.`);
}
