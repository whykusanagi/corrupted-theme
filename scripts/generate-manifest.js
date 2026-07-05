#!/usr/bin/env node
/**
 * generate-manifest.js — the Astryx-style agent surface generator.
 *
 * Reads package.json exports + each module's JSDoc and emits:
 *   dist/manifest.json — machine-readable component map: name → import path
 *     → CDN URL → description → classes/functions → constructor options →
 *     composition hints (@composes) → version
 *   dist/llms.txt — token-efficient text surface for LLM sessions building
 *     with the package (conventions + one line per export)
 *   docs/COMPONENTS_REFERENCE.md — refreshes the auto-generated block
 *     between the MANIFEST markers (rest of the file is hand-authored)
 *
 * Design reference: facebook/astryx `manifest --json` + `--dense` docs
 * (MIT) — concept only. Run: npm run manifest:generate
 *
 * @module scripts/generate-manifest
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CDN_BASE = 'https://cdn.whykusanagi.xyz/corrupted-theme/@latest';

/** Exports that touch `document` at import time (0.1.x behavior kept for compat). */
const BROWSER_ONLY = new Set(['./corrupted-text']);

/**
 * Parse the leading JSDoc block + export surface of one module.
 * @param {string} source - File contents
 * @returns {object} { description, version, classes, functions, constants, composes, options }
 */
export function parseModule(source) {
  const header = source.match(/\/\*\*([\s\S]*?)\*\//)?.[1] ?? '';
  const lines = header.split('\n').map((l) => l.replace(/^\s*\*\s?/, ''));

  // Description: first non-empty, non-tag lines up to the first blank/tag
  const descLines = [];
  for (const line of lines) {
    if (!line.trim()) { if (descLines.length) break; continue; }
    if (line.trim().startsWith('@')) break;
    descLines.push(line.trim());
  }
  let description = descLines.join(' ').replace(/\s+/g, ' ').trim();
  // Fallback for verbatim-ported modules with `//` line-comment headers
  if (!description) {
    const lineHeader = source.match(/^\/\/\s*(.+)$/m)?.[1] ?? '';
    description = lineHeader.replace(/\s+/g, ' ').trim();
  }

  const version = header.match(/@version\s+([\d.]+)/)?.[1] ?? null;
  const composes = [...header.matchAll(/@composes\s+(\S+)(?:\s+[—-]\s+(.*))?/g)]
    .map((m) => ({ target: m[1], note: (m[2] ?? '').trim() || undefined }));

  const classes = [...source.matchAll(/^export class (\w+)/gm)].map((m) => m[1]);
  const functions = [...source.matchAll(/^export (?:async )?function (\w+)/gm)].map((m) => m[1]);
  const constants = [...source.matchAll(/^export const (\w+)/gm)].map((m) => m[1]);

  // Constructor options: every `@param {..} [options.x=default] - desc` in the file
  const options = [...source.matchAll(
    /@param\s+\{([^}]+)\}\s+\[options\.(\w+)(?:=([^\]]*))?\]\s*[-—]?\s*(.*)/g
  )].map((m) => ({
    name: m[2],
    type: m[1].trim(),
    default: m[3] !== undefined ? m[3] : undefined,
    description: m[4].trim() || undefined,
  }));
  // De-dupe by option name (multi-class files repeat common options)
  const seen = new Set();
  const uniqueOptions = options.filter((o) => !seen.has(o.name) && seen.add(o.name));

  return { description, version, classes, functions, constants, composes, options: uniqueOptions };
}

/** Build the manifest object from package.json exports. */
export function buildManifest() {
  const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const entries = [];

  for (const [key, value] of Object.entries(pkg.exports)) {
    const target = typeof value === 'string' ? value : (value.import || value.require);
    const type = target.endsWith('.css') ? 'css' : target.endsWith('.json') ? 'data' : 'js';
    const entry = {
      export: key,
      path: target,
      type,
      cdnUrl: `${CDN_BASE}/${target.replace(/^\.\//, '')}`,
      npmImport: key === '.' ? pkg.name : `${pkg.name}/${key.replace(/^\.\//, '')}`,
    };
    if (type === 'js') {
      const parsed = parseModule(readFileSync(path.join(ROOT, target), 'utf8'));
      Object.assign(entry, {
        description: parsed.description || undefined,
        version: parsed.version || undefined,
        classes: parsed.classes.length ? parsed.classes : undefined,
        functions: parsed.functions.length ? parsed.functions : undefined,
        constants: parsed.constants.length ? parsed.constants : undefined,
        options: parsed.options.length ? parsed.options : undefined,
        composes: parsed.composes.length ? parsed.composes : undefined,
        browserOnly: BROWSER_ONLY.has(key) || undefined,
      });
    }
    entries.push(entry);
  }

  return {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    homepage: pkg.homepage,
    cdn: { base: CDN_BASE, hosts: ['cdn.whykusanagi.xyz', 'cdn.nikkers.cc'] },
    conventions: {
      api: 'new Component(element, options) with start()/stop()/destroy(); transitions use play(options, onComplete)/stop(); animation blocks use play() → Promise',
      nsfw: 'All NSFW content is opt-in via nsfw: false default (lewdMode is a deprecated alias)',
      colors: 'Canonical corruption palette only: #00ffff cyan (stable), #ff00ff magenta, #8b5cf6 purple, #d94f90 magenta2, #ff0000 red, #00ff00 green',
      determinism: 'Components exposing renderFrame(frameIdx, fps) + seed render byte-identical frames (see docs/RENDER_TO_VIDEO.md)',
      patterns: 'Corruption patterns 1-4 defined in CORRUPTED_THEME_SPEC.md; final states are always readable',
    },
    generatedAt: null, // stamped by the caller (deterministic module output)
    exports: entries,
  };
}

/** Render the token-efficient llms.txt from a manifest. */
export function renderLlmsTxt(manifest) {
  const lines = [
    `# ${manifest.name} v${manifest.version}`,
    '',
    manifest.description,
    '',
    `Install: npm i ${manifest.name} | CDN: ${manifest.cdn.base}/src/... (SRI hashes in CHANGELOG.md)`,
    `Machine-readable surface: ${manifest.cdn.base}/dist/manifest.json`,
    '',
    '## Conventions (read before generating code)',
    ...Object.entries(manifest.conventions).map(([k, v]) => `- ${k}: ${v}`),
    '',
    '## Exports',
  ];
  for (const e of manifest.exports) {
    if (e.type !== 'js') {
      lines.push(`- ${e.export} [${e.type}] ${e.npmImport}`);
      continue;
    }
    const api = [...(e.classes ?? []), ...(e.functions ?? []), ...(e.constants ?? [])].join(', ');
    const opts = e.options?.length
      ? ` options: ${e.options.map((o) => o.default !== undefined ? `${o.name}=${o.default}` : o.name).join(', ')}.`
      : '';
    const comp = e.composes?.length
      ? ` composes: ${e.composes.map((c) => c.target).join(', ')}.`
      : '';
    const flag = e.browserOnly ? ' [browser-only]' : '';
    lines.push(`- ${e.export}${flag} → { ${api} }. ${e.description ?? ''}${opts}${comp}`);
  }
  lines.push('', 'Every component settles to a stable readable final state (spec tenet).');
  return lines.join('\n') + '\n';
}

/** Render the auto-generated COMPONENTS_REFERENCE block. */
export function renderReferenceBlock(manifest) {
  const js = manifest.exports.filter((e) => e.type === 'js');
  const rows = js.map((e) => {
    const api = [...(e.classes ?? []), ...(e.functions ?? [])].slice(0, 4).join(', ') || '—';
    return `| \`${e.npmImport}\` | ${api} | ${(e.description ?? '').split('. ')[0]} |`;
  });
  return [
    '## Machine-Readable Surface (auto-generated — do not edit by hand)',
    '',
    `Full manifest: \`${manifest.cdn.base}/dist/manifest.json\` · LLM surface: \`${manifest.cdn.base}/dist/llms.txt\``,
    `Regenerate: \`npm run manifest:generate\` (v${manifest.version}, ${js.length} JS exports)`,
    '',
    '| Import | API | Purpose |',
    '|---|---|---|',
    ...rows,
  ].join('\n');
}

const MARK_START = '<!-- MANIFEST:START -->';
const MARK_END = '<!-- MANIFEST:END -->';

function main() {
  const manifest = buildManifest();
  manifest.generatedAt = new Date().toISOString();

  mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
  writeFileSync(path.join(ROOT, 'dist/manifest.json'), JSON.stringify(manifest, null, 2));
  writeFileSync(path.join(ROOT, 'dist/llms.txt'), renderLlmsTxt(manifest));

  // Refresh the marked block in COMPONENTS_REFERENCE.md (append markers if absent)
  const refPath = path.join(ROOT, 'docs/COMPONENTS_REFERENCE.md');
  if (existsSync(refPath)) {
    let ref = readFileSync(refPath, 'utf8');
    const block = `${MARK_START}\n${renderReferenceBlock(manifest)}\n${MARK_END}`;
    ref = ref.includes(MARK_START)
      ? ref.replace(new RegExp(`${MARK_START}[\\s\\S]*?${MARK_END}`), block)
      : `${ref.trimEnd()}\n\n${block}\n`;
    writeFileSync(refPath, ref);
  }

  console.log(`manifest.json: ${manifest.exports.length} exports · llms.txt · reference block refreshed`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
