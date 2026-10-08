#!/usr/bin/env node
// scripts/build-globals.js — classic-script build of corrupted-text.
//
// The CDN has served dist/corrupted-text.global.js since 0.2.x for pages that
// load the library with a plain <script> tag. Until 0.3.4 that file was
// maintained BY HAND and had drifted from its source: it predated the
// `typeof document !== 'undefined'` SSR guard and still used CommonJS
// `exports.`. Generating it closes the drift.
//
// Not a rollup target. rollup's iife output namespaces its exports
// (`window.Toast.Toast` is the class), and this file's consumers have always
// had `CorruptedText` flat. The source already assigns the globals itself and
// has no imports, so the only thing standing between it and a classic script
// is the one ESM export statement.
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = 'src/lib/corrupted-text.js';
const OUT = 'dist/corrupted-text.global.js';

const source = readFileSync(SRC, 'utf8');

if (/^\s*import\s/m.test(source)) {
  throw new Error(`${SRC} has gained an import — it can no longer be served as a classic script without bundling.`);
}

const EXPORT_LINE = /^export \{[^}]*\};?[ \t]*$/m;
if (!EXPORT_LINE.test(source)) {
  throw new Error(`${SRC}: expected a single \`export { ... };\` statement to strip, found none.`);
}

const out = source.replace(
  EXPORT_LINE,
  '// ESM export stripped by scripts/build-globals.js: a classic script cannot\n'
    + '// carry one. The window.* assignments below are the entry point here.',
);

if (/^\s*export\s/m.test(out)) {
  throw new Error(`${SRC} has more than one export statement; update scripts/build-globals.js.`);
}

writeFileSync(OUT, out);
console.log(`${OUT}: generated from ${SRC} (${out.length} bytes)`);
