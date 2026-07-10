#!/usr/bin/env node
// scripts/inline-data.js
//
// Generates browser-safe ES modules from each src/data/*.json.
//
// Why: source modules historically used
//   import x from '../data/foo.json' with { type: 'json' };
// to keep the canonical JSON as the single source of truth. But import
// attributes (`with { type: 'json' }`) only parse in Chromium 123+ — Safari
// and Firefox throw a SyntaxError before the module body runs. CDN consumers
// loading these as <script type="module"> get a silent breakage across two
// of the three major browsers (the 0.2.0 regression).
//
// This script emits a sibling `.data.js` for each JSON file that re-exports
// the parsed content as `export default`. The .data.js files are committed
// (so the package works out-of-the-box without a build step) and regenerated
// on every build/test/publish.
//
// Canonical source remains src/data/*.json — non-JS consumers (Go CLI, etc.)
// keep reading the JSON files unchanged.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');

// withFileTypes gives the file/dir type from the single readdir syscall, so we
// never stat-then-read the same path (avoids a file-system race, CodeQL js/file-system-race).
const entries = readdirSync(DATA_DIR, { withFileTypes: true });
let generated = 0;

for (const dirent of entries) {
  if (!dirent.isFile() || !dirent.name.endsWith('.json')) continue;
  const entry = dirent.name;
  const fullPath = join(DATA_DIR, entry);

  const outName = basename(entry, '.json') + '.data.js';
  const outPath = join(DATA_DIR, outName);
  const raw = readFileSync(fullPath, 'utf8');

  // Parse to validate; re-emit JSON so trailing whitespace / formatting
  // differences in the source don't leak into the JS module.
  const parsed = JSON.parse(raw);
  const body =
    `// AUTO-GENERATED from ${entry} by scripts/inline-data.js — do not edit by hand.\n` +
    `// Run \`npm run data:generate\` to regenerate.\n` +
    `export default ${JSON.stringify(parsed, null, 2)};\n`;

  writeFileSync(outPath, body);
  console.log(`  ${entry}  →  ${outName}`);
  generated++;
}

console.log(`\nGenerated ${generated} data module(s) in src/data/.`);
