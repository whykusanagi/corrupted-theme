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

/** Component → stylesheet export it needs (blind-validation gap fix). */
const REQUIRES_CSS = {
  './chromatic-pulse': './stream-overlays-css',
  './binary-particles': './stream-overlays-css',
  './glitch-title-card': './stream-overlays-css',
  './terminal-takeover': './stream-overlays-css',
  './stream-ticker': './stream-overlays-css',
  './corrupted-mandala': './corrupted-mandala-css',
  './toast': './toast-css',
};

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

  // Options are attributed to the class whose region of the file they sit in,
  // so multi-class bundles (animation-blocks: 27 classes) publish a per-class
  // map instead of one flat pool (0.3.0 blind-validation gap fix).
  const classMarks = [...source.matchAll(/^export class (\w+)/gm)]
    .map((m) => ({ name: m[1], index: m.index }));
  const regionFor = (index) => {
    let owner;
    for (const c of classMarks) if (c.index < index) owner = c.name;
    return owner ?? null;
  };

  const optionRe = /@param\s+\{([^}]+)\}\s+\[options\.(\w+)(?:=([^\]]*))?\]\s*[-—–]?[ \t]*(.*(?:\n\s*\*(?![ \t]*@|\/)[ \t]*[^\n]*)*)/g;
  const cleanDesc = (raw) => {
    const text = raw
      .split('\n').map((l) => l.replace(/^\s*\*\s?/, '')).join(' ')
      .replace(/\s+/g, ' ').trim();
    // Drop spillover captures (leaked neighboring JSDoc rather than prose)
    if (!text || text.startsWith('@') || text.startsWith('*/') || text.includes('@param')) return undefined;
    return text;
  };
  const options = [...source.matchAll(optionRe)].map((m) => ({
    name: m[2],
    type: m[1].trim(),
    default: m[3] !== undefined ? m[3] : undefined,
    description: cleanDesc(m[4]),
    owner: regionFor(m.index),
  }));

  // Constructor signature per class — components differ (element+options vs
  // options-only), and blind validation showed consumers cannot guess.
  const constructors = {};
  classMarks.forEach((c, i) => {
    const slice = source.slice(c.index, classMarks[i + 1]?.index);
    const sig = slice.match(/constructor\s*\(([^)]*)\)/)?.[1]?.replace(/\s+/g, ' ').trim();
    if (sig !== undefined) constructors[c.name] = sig;
  });

  // Public method names per class (constructor and _private excluded) — so
  // consumers see e.g. CorruptedTimeline's add/label/play/pause/seek surface.
  const methods = {};
  classMarks.forEach((c, i) => {
    const slice = source.slice(c.index, classMarks[i + 1]?.index);
    const names = [...slice.matchAll(/^  (?:static )?(?:async )?([a-zA-Z]\w*)\s*\(/gm)]
      .map((m) => m[1])
      .filter((n) => n !== 'constructor' && !['if', 'for', 'while', 'switch', 'catch'].includes(n));
    if (names.length) methods[c.name] = [...new Set(names)];
  });

  if (classMarks.length > 1) {
    const byClass = {};
    for (const o of options) {
      const key = o.owner ?? 'module';
      (byClass[key] ??= []).push({ ...o, owner: undefined });
    }
    return { description, version, classes, functions, constants, composes,
             options: [], classOptions: byClass, methods, constructors };
  }
  const seen = new Set();
  const uniqueOptions = options
    .map((o) => ({ ...o, owner: undefined }))
    .filter((o) => !seen.has(o.name) && seen.add(o.name));
  return { description, version, classes, functions, constants, composes,
           options: uniqueOptions, methods, constructors };
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
        classOptions: parsed.classOptions,
        methods: parsed.methods && Object.keys(parsed.methods).length ? parsed.methods : undefined,
        constructors: parsed.constructors && Object.keys(parsed.constructors).length ? parsed.constructors : undefined,
        composes: parsed.composes.length ? parsed.composes : undefined,
        requiresCss: REQUIRES_CSS[key],
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
      api: 'new Component(element, options) with start()/stop()/destroy(); transitions use play(options, onComplete)/stop() where onComplete fires when the transition finishes; animation blocks use play() → Promise that resolves when the animation completes',
      modules: 'Every JS export is an ES module — import from the cdnUrl with <script type="module">. Module imports are CORS-mode requests: keep them same-origin per docs/CDN_CONSUMPTION.md, or use the npm package. Browser-global IIFE builds exist only as dist/*.global.js (see CHANGELOG for the list + SRI)',
      scriptLoadingPitfall: 'NEVER load a src/ file with a classic <script src> tag — it throws "Cannot use import statement outside a module" and the class stays undefined (this broke two demo pages in the 0.3.0 review). Use <script type="module"> or a dist/*.global.js build; there is no third way',
      repoMaintenance: 'When editing this repo: the demo-site navbar is generated from NAV in scripts/sync-nav.js (edit NAV, run npm run nav:sync — never hand-edit a page navbar); only the current release gets What\'s-New promo surfaces; incident log + rules in docs/IMPLEMENTATION_NOTES.md',
      oneShots: 'One-shot overlay components (GlitchTitleCard, TerminalTakeover) accept start(onComplete); ambient components (StreamTicker, BinaryParticles, ChromaticPulse) run until stop()',
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
    const fmtOpts = (arr) => arr.map((o) => o.default !== undefined ? `${o.name}=${o.default}` : o.name);
    let opts = '';
    if (e.options?.length) {
      opts = ` options: ${fmtOpts(e.options).join(', ')}.`;
    } else if (e.classOptions) {
      const parts = Object.entries(e.classOptions)
        .filter(([k]) => k !== 'module')
        .map(([cls, arr]) => {
          const shown = fmtOpts(arr).slice(0, 6);
          const extra = arr.length > 6 ? `, +${arr.length - 6} more` : '';
          return `${cls}{${shown.join(', ')}${extra}}`;
        });
      if (parts.length) opts = ` options per class: ${parts.join(' · ')}.`;
    }
    const singleClass = e.classes?.length === 1 ? e.classes[0] : null;
    const meth = singleClass && e.methods?.[singleClass]
      ? ` methods: ${e.methods[singleClass].join('/')}.`
      : '';
    const cssEntry = e.requiresCss ? manifest.exports.find((x) => x.export === e.requiresCss) : null;
    const css = e.requiresCss ? ` needs css: ${e.requiresCss} (${cssEntry?.cdnUrl ?? ''}).` : '';
    const singleCtor = e.classes?.length === 1 && e.constructors?.[e.classes[0]] !== undefined
      ? ` new ${e.classes[0]}(${e.constructors[e.classes[0]]}).`
      : '';
    const comp = e.composes?.length
      ? ` composes: ${e.composes.map((c) => c.target).join(', ')}.`
      : '';
    const flag = e.browserOnly ? ' [browser-only]' : '';
    lines.push(`- ${e.export}${flag} → { ${api} }.${singleCtor} ${e.description ?? ''}${opts}${meth}${css}${comp}`);
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

  const optRows = (arr) => arr.map((o) =>
    `| \`${o.name}\` | \`${o.type}\` | ${o.default !== undefined ? '\`' + o.default + '\`' : ''} | ${o.description ?? ''} |`);
  const details = js.map((e) => {
    const out = [`### \`${e.export.replace('./', '')}\``, ''];
    if (e.description) out.push(e.description, '');
    out.push(`- npm: \`import { ${(e.classes ?? e.functions ?? ['…'])[0]} } from '${e.npmImport}'\``);
    out.push(`- CDN (ES module): \`${e.cdnUrl}\``);
    if (e.requiresCss) {
      const cssEntry = manifest.exports.find((x) => x.export === e.requiresCss);
      out.push(`- Requires stylesheet: \`${e.requiresCss}\` → \`${cssEntry?.cdnUrl ?? ''}\``);
    }
    if (e.browserOnly) out.push('- Browser-only: touches \`document\` at import time (do not import in Node/SSR)');
    const singleClass = e.classes?.length === 1 ? e.classes[0] : null;
    if (singleClass && e.constructors?.[singleClass] !== undefined) {
      out.push(`- Constructor: \`new ${singleClass}(${e.constructors[singleClass]})\``);
    }
    if (singleClass && e.methods?.[singleClass]) {
      out.push(`- Methods: \`${e.methods[singleClass].join('()\`, \`')}()\``);
    }
    if (singleClass) {
      const opts = (e.options ?? []).slice(0, 2)
        .filter((o) => o.default !== undefined)
        .map((o) => `${o.name}: ${o.default}`).join(', ');
      const run = e.methods?.[singleClass]?.includes('play') ? 'play()' : 'start()';
      const args = (e.constructors?.[singleClass] ?? '').startsWith('options')
        ? `{ ${opts} }` : `containerEl${opts ? `, { ${opts} }` : ''}`;
      out.push('', '```js', `new ${singleClass}(${args}).${run};`, '```');
    }
    if (e.options?.length) {
      out.push('', '| Option | Type | Default | Description |', '|---|---|---|---|', ...optRows(e.options));
    } else if (e.classOptions) {
      for (const [cls, arr] of Object.entries(e.classOptions)) {
        if (cls === 'module' || !arr.length) continue;
        out.push('', `**${cls}** options${e.methods?.[cls] ? ` (methods: \`${e.methods[cls].join('()\`, \`')}()\`)` : ''}:`,
          '', '| Option | Type | Default | Description |', '|---|---|---|---|', ...optRows(arr));
      }
    }
    return out.join('\n');
  });

  return [
    '## Machine-Readable Surface (auto-generated — do not edit by hand)',
    '',
    `Full manifest: \`${manifest.cdn.base}/dist/manifest.json\` · LLM surface: \`${manifest.cdn.base}/dist/llms.txt\``,
    `Regenerate: \`npm run manifest:generate\` (v${manifest.version}, ${js.length} JS exports)`,
    '',
    'Container expectations: overlay-suite and block components position themselves',
    'absolutely inside their container, so give the container \`position: relative\`',
    'and a size. The full-viewport canvas transitions render \`position: fixed\` and',
    'ignore container geometry. Every option below is parsed from the source JSDoc.',
    '',
    '| Import | API | Purpose |',
    '|---|---|---|',
    ...rows,
    '',
    ...details,
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
