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

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
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
/**
 * Read a brace-balanced `{...}` starting at `from`, across lines, stripping
 * JSDoc leading asterisks. Return types nest arbitrarily —
 * `{{total:number, at:(t)=>{phase:string}}}` — and span lines, which no single
 * regex handles cleanly. Returns null when unbalanced.
 * @param {string} text
 * @param {number} from - index of the opening brace
 * @returns {string|null}
 */
function balancedBraces(text, from) {
  if (text[from] !== '{') return null;
  let depth = 0;
  for (let i = from; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) {
        return text.slice(from + 1, i)
          .split('\n').map((l) => l.replace(/^\s*\*\s?/, '')).join(' ')
          .replace(/\s+/g, ' ').trim();
      }
    }
  }
  return null;
}

/**
 * Extract `@returns` type + description from a JSDoc block.
 * @param {string} doc
 * @returns {{type:string, description?:string}|undefined}
 */
function parseReturns(doc) {
  const at = doc.search(/@returns?\s+\{/);
  if (at === -1) return undefined;
  const brace = doc.indexOf('{', at);
  const type = balancedBraces(doc, brace);
  if (type === null) return undefined;
  let depth = 0, close = brace;
  for (let i = brace; i < doc.length; i++) {
    if (doc[i] === '{') depth++;
    else if (doc[i] === '}' && --depth === 0) { close = i; break; }
  }
  // The description may wrap onto following ` *   ` lines, like @param does.
  const tail = doc.slice(close + 1);
  const raw = tail.match(/^[ \t]*([^\n]*(?:\n\s*\*(?![ \t]*@|\/)[ \t]*[^\n]*)*)/)?.[1] || '';
  const desc = raw
    .split('\n').map((l) => l.replace(/^\s*\*\s?/, '')).join(' ')
    .replace(/\s+/g, ' ').trim();
  return { type, description: desc || undefined };
}

/** Flatten a wrapped JSDoc description into one line. */
function flattenDoc(raw) {
  const t = (raw || '')
    .split('\n').map((l) => l.replace(/^\s*\*\s?/, '')).join(' ')
    .replace(/\s+/g, ' ').trim();
  return t && !t.startsWith('@') ? t : undefined;
}

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

  // Standalone functions need signatures too. Publishing `rms, smoothRms,
  // mouthTarget, approach` as four bare names tells a consumer nothing — not
  // the argument order, not what each one takes. Blind validation could not
  // write a single correct call from that.
  const fnDetail = {};
  const fnRe = /(?:\/\*\*((?:[^*]|\*(?!\/))*)\*\/\s*\n)?^export (?:async )?function (\w+)\s*\(([^)]*)\)/gm;
  for (const m of source.matchAll(fnRe)) {
    const doc = m[1] ?? '';
    const params = [...doc.matchAll(/@param\s+\{((?:[^{}\n]|\{[^{}\n]*\})+)\}\s+\[?([\w.]+)\]?(?:=([^\]]*))?\]?[ \t]*[-—–]?[ \t]*([^\n]*)/g)]
      .map((pm) => ({
        name: pm[2], type: pm[1].trim(),
        default: pm[3] !== undefined ? pm[3] : undefined,
        description: flattenDoc(pm[4]),
      }));
    const returns = parseReturns(doc);
    const summary = (doc.split('\n').map((l) => l.replace(/^\s*\*\s?/, '').trim())
      .filter((l) => l && !l.startsWith('@'))[0]) || undefined;
    fnDetail[m[2]] = {
      signature: `${m[2]}(${m[3].replace(/\s+/g, ' ').trim()})`,
      summary,
      params: params.length ? params : undefined,
      returns,
    };
  }

  // Documented instance properties (@property in the class JSDoc). `.levels`
  // was referenced in prose but its shape was published nowhere.
  const properties = {};
  const propRe = /@property\s+\{((?:[^{}\n]|\{[^{}\n]*\})+)\}\s+(\S+)[ \t]*[-—–]?[ \t]*(.*(?:\n\s*\*(?![ \t]*@|\/)[ \t]*[^\n]*)*)/g;
  for (const m of source.matchAll(propRe)) {
    const desc = (m[3] || '')
      .split('\n').map((l) => l.replace(/^\s*\*\s?/, '')).join(' ')
      .replace(/\s+/g, ' ').trim();
    properties[m[2]] = { type: m[1].trim(), description: desc || undefined };
  }
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

  // Two fixes here, both found by blind validation rather than by reading:
  //  1. The separator after `]` used `\s*`, which crosses newlines. A param
  //     with no inline description therefore swallowed the NEXT @param line
  //     whole, silently dropping it from the published surface. Latent since
  //     0.3.0 — it only bites when a param has no trailing prose.
  //  2. Brace-BALANCED type capture. `[^}]+` stopped at the first closing brace, so
  // any param whose type contained braces — `{{warp:number,grain:number}}`,
  // `{'card'|{w:number,h:number}}` — failed to match and was dropped from the
  // published surface entirely. Found by blind validation, not by reading this.
  const optionRe = /@param\s+\{((?:[^{}\n]|\{[^{}\n]*\})+)\}\s+\[options\.(\w+)(?:=([^\]]*))?\][ \t]*[-—–]?[ \t]*(.*(?:\n\s*\*(?![ \t]*@|\/)[ \t]*[^\n]*)*)/g;
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

  // Namespace objects — `export const X = { method() {} }` — are a real public
  // shape here (MicroGfx), not just a constant. Without this they published as
  // a bare name with no constructor and no methods, so a consumer had no
  // documented way to invoke them at all.
  const methodParamRe = /@param\s+\{((?:[^{}\n]|\{[^{}\n]*\})+)\}\s+\[?([\w.]+)\]?(?:=([^\]]*))?\]?[ \t]*[-—–]?[ \t]*(.*(?:\n\s*\*(?![ \t]*@|\/)[ \t]*[^\n]*)*)/g;

  const namespaces = {};
  for (const m of source.matchAll(/^export const (\w+) = \{/gm)) {
    const start = m.index;
    // Walk braces to find the object's extent.
    let depth = 0, end = start;
    for (let i = source.indexOf('{', start); i < source.length; i++) {
      if (source[i] === '{') depth++;
      else if (source[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
    }
    const body = source.slice(start, end);
    const nsRe = /(?:\/\*\*((?:[^*]|\*(?!\/))*)\*\/\s*\n)?^  (?:async )?([a-zA-Z]\w*)\s*\(([^)]*)\)\s*\{/gm;
    const names = [];
    for (const mm of body.matchAll(nsRe)) {
      if (['if', 'for', 'while', 'switch', 'catch', 'return'].includes(mm[2])) continue;
      const doc = mm[1] ?? '';
      const returns = parseReturns(doc);
      const summary = (doc.split('\n').map((l) => l.replace(/^\s*\*\s?/, '').trim())
        .filter((l) => l && !l.startsWith('@'))[0]) || undefined;
      const nsParams = [...doc.matchAll(methodParamRe)]
        .map((pm) => ({
          name: pm[2], type: pm[1].trim(),
          default: pm[3] !== undefined ? pm[3] : undefined,
          description: flattenDoc(pm[4]),
        }));
      names.push({
        name: mm[2],
        signature: `${mm[2]}(${mm[3].replace(/\s+/g, ' ').trim()})`,
        summary,
        params: nsParams.length ? nsParams : undefined,
        returns,
      });
    }
    if (names.length) namespaces[m[1]] = names;
  }

  // Constructor signature per class — components differ (element+options vs
  // options-only), and blind validation showed consumers cannot guess.
  const constructors = {};
  classMarks.forEach((c, i) => {
    const slice = source.slice(c.index, classMarks[i + 1]?.index);
    const sig = slice.match(/constructor\s*\(([^)]*)\)/)?.[1]?.replace(/\s+/g, ' ').trim();
    if (sig !== undefined) constructors[c.name] = sig;
  });

  // Public methods per class, WITH their signature and parameter shapes.
  //
  // Names alone are not usable: blind validation showed a consumer can see
  // that `setData` and `fire` exist and still have no idea what to pass them.
  // The data shape lives in each method's own @param tags, not in the
  // constructor options, so it never reached the published surface before.
  const methods = {};
  const methodDetail = {};
  classMarks.forEach((c, i) => {
    const slice = source.slice(c.index, classMarks[i + 1]?.index);
    const found = [];
    const detail = {};
    // Capture each method along with the JSDoc block immediately above it.
    // The `static` marker must survive: a static method called on an instance
    // throws `TypeError: x is not a function`. Publishing ScrollDecode.scramble
    // under a plain "Methods:" heading sent a blind consumer straight into that.
    const methodRe = /(?:\/\*\*((?:[^*]|\*(?!\/))*)\*\/\s*\n)?^  (static )?(?:async )?([a-zA-Z]\w*)\s*\(([^)]*)\)\s*\{/gm;
    for (const m of slice.matchAll(methodRe)) {
      const name = m[3];
      if (name === 'constructor' || ['if', 'for', 'while', 'switch', 'catch'].includes(name)) continue;
      if (found.includes(name)) continue;
      found.push(name);
      const doc = m[1] ?? '';
      const isStatic = Boolean(m[2]);
      const args = m[4].replace(/\s+/g, ' ').trim();
      const params = [...doc.matchAll(methodParamRe)]
        .map((pm) => ({ name: pm[2], type: pm[1].trim(), description: flattenDoc(pm[4]) }))
        .filter((pp) => !pp.name.startsWith('options.'));
      const returns = parseReturns(doc);
      const summary = (doc.split('\n').map((l) => l.replace(/^\s*\*\s?/, '').trim())
        .filter((l) => l && !l.startsWith('@'))[0]) || undefined;
      detail[name] = {
        static: isStatic || undefined,
        signature: `${isStatic ? `${c.name}.` : ''}${name}(${args})`,
        summary,
        params: params.length ? params : undefined,
        returns,
      };
    }
    if (found.length) {
      methods[c.name] = found;
      methodDetail[c.name] = detail;
    }
  });

  if (classMarks.length > 1) {
    const byClass = {};
    for (const o of options) {
      const key = o.owner ?? 'module';
      (byClass[key] ??= []).push({ ...o, owner: undefined });
    }
    return { description, version, classes, functions, constants, composes,
             options: [], classOptions: byClass, methods, methodDetail, constructors, namespaces, fnDetail, properties };
  }
  const seen = new Set();
  const uniqueOptions = options
    .map((o) => ({ ...o, owner: undefined }))
    .filter((o) => !seen.has(o.name) && seen.add(o.name));
  return { description, version, classes, functions, constants, composes,
           options: uniqueOptions, methods, methodDetail, constructors, namespaces, fnDetail, properties };
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
      const targetPath = path.join(ROOT, target);
      const source = readFileSync(targetPath, 'utf8');
      const parsed = parseModule(source);
      // Follow `export { A, B } from './internal.js'` barrels (e.g.
      // animation-blocks re-exports its classes from _blocks-advanced.js /
      // _blocks-anime.js) so re-exported classes reach the agent surface too.
      const reExportRe = /export\s*\{([^}]+)\}\s*from\s*['"](\.[^'"]+)['"]/g;
      let rx;
      while ((rx = reExportRe.exec(source))) {
        const names = rx[1].split(',').map((s) => s.trim()).filter(Boolean);
        const childPath = path.resolve(path.dirname(targetPath), rx[2]);
        let childSrc;
        try { childSrc = readFileSync(childPath, 'utf8'); } catch { continue; }
        const child = parseModule(childSrc);
        const childOpts = child.classOptions
          || (child.classes?.length === 1 ? { [child.classes[0]]: child.options } : {});
        for (const name of names) {
          if (!child.classes?.includes(name)) continue; // classes only, skip helper fns
          (parsed.classes ??= []).push(name);
          if (child.methods?.[name]) (parsed.methods ??= {})[name] = child.methods[name];
          if (child.constructors?.[name]) (parsed.constructors ??= {})[name] = child.constructors[name];
          if (childOpts[name]?.length) (parsed.classOptions ??= {})[name] = childOpts[name];
        }
      }
      Object.assign(entry, {
        description: parsed.description || undefined,
        version: parsed.version || undefined,
        classes: parsed.classes.length ? parsed.classes : undefined,
        functions: parsed.functions.length ? parsed.functions : undefined,
        constants: parsed.constants.length ? parsed.constants : undefined,
        options: parsed.options.length ? parsed.options : undefined,
        classOptions: parsed.classOptions,
        methods: parsed.methods && Object.keys(parsed.methods).length ? parsed.methods : undefined,
        methodDetail: parsed.methodDetail && Object.keys(parsed.methodDetail).length ? parsed.methodDetail : undefined,
        fnDetail: parsed.fnDetail && Object.keys(parsed.fnDetail).length ? parsed.fnDetail : undefined,
        namespaces: parsed.namespaces && Object.keys(parsed.namespaces).length ? parsed.namespaces : undefined,
        properties: parsed.properties && Object.keys(parsed.properties).length ? parsed.properties : undefined,
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
      scriptLoadingPitfall: 'NEVER load a src/ file with a classic <script src> tag — it throws "Cannot use import statement outside a module" and the class stays undefined. Use <script type="module"> or a dist/*.global.js build; there is no third way',
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
    const det = singleClass ? e.methodDetail?.[singleClass] : null;
    const meth = singleClass && e.methods?.[singleClass]
      ? ` methods: ${e.methods[singleClass].map((n) => det?.[n]?.signature ?? `${n}()`).join(' ')}.`
      : '';
    const props = e.properties && Object.keys(e.properties).length
      ? ` props: ${Object.entries(e.properties).map(([n, d]) => `${n}:${d.type}`).join(' ')}.`
      : '';
    const fns = e.fnDetail && Object.keys(e.fnDetail).length
      ? ` fns: ${Object.values(e.fnDetail).map((d) => d.signature + (d.returns ? `→${d.returns.type}` : '')).join(' ')}.`
      : '';
    const nsFns = e.namespaces && Object.keys(e.namespaces).length
      ? ' ' + Object.entries(e.namespaces).map(([ns, list]) =>
          `${ns}: ${list.map((f) => f.signature + (f.returns ? `→${f.returns.type}` : '')).join(' ')}.`).join(' ')
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
    lines.push(`- ${e.export}${flag} → { ${api} }.${singleCtor} ${e.description ?? ''}${opts}${meth}${props}${fns}${nsFns}${css}${comp}`);
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
      const det = e.methodDetail?.[singleClass];
      if (det) {
        out.push('- Methods:');
        for (const name of e.methods[singleClass]) {
          const d = det[name];
          if (!d) { out.push(`  - \`${name}()\``); continue; }
          const ret = d.returns ? ` → \`${d.returns.type}\`` : '';
          const tag = d.static ? ' _(static — call on the class, not an instance)_' : '';
          out.push(`  - \`${d.signature}\`${ret}${tag}${d.summary ? ` — ${d.summary}` : ''}`);
          for (const pp of d.params ?? []) {
            out.push(`    - \`${pp.name}\`: \`${pp.type}\`${pp.description ? ` — ${pp.description}` : ''}`);
          }
          if (d.returns?.description) out.push(`    - returns: ${d.returns.description}`);
        }
      } else {
        out.push(`- Methods: \`${e.methods[singleClass].join('()\`, \`')}()\``);
      }
    }
    if (e.properties && Object.keys(e.properties).length) {
      out.push('- Properties:');
      for (const [n, d] of Object.entries(e.properties)) {
        out.push(`  - \`${n}\`: \`${d.type}\`${d.description ? ` — ${d.description}` : ''}`);
      }
    }
    if (e.fnDetail && Object.keys(e.fnDetail).length) {
      out.push('- Functions:');
      for (const [n, d] of Object.entries(e.fnDetail)) {
        const ret = d.returns ? ` → \`${d.returns.type}\`` : '';
        out.push(`  - \`${d.signature}\`${ret}${d.summary ? ` — ${d.summary}` : ''}`);
        for (const pp of d.params ?? []) {
          out.push(`    - \`${pp.name}\`${pp.default !== undefined ? ` (default \`${pp.default}\`)` : ''}: \`${pp.type}\`${pp.description ? ` — ${pp.description}` : ''}`);
        }
        if (d.returns?.description) out.push(`    - returns: ${d.returns.description}`);
      }
    }
    if (e.namespaces && Object.keys(e.namespaces).length) {
      for (const [ns, fns] of Object.entries(e.namespaces)) {
        out.push(`- \`${ns}\` methods:`);
        for (const f of fns) {
          const ret = f.returns ? ` → \`${f.returns.type}\`` : '';
          out.push(`  - \`${ns}.${f.signature}\`${ret}${f.summary ? ` — ${f.summary}` : ''}`);
          for (const pp of f.params ?? []) {
            out.push(`    - \`${pp.name}\`${pp.default !== undefined ? ` (default \`${pp.default}\`)` : ''}: \`${pp.type}\`${pp.description ? ` — ${pp.description}` : ''}`);
          }
        }
      }
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
    'Canvas components (`corrupted-globe`, `corrupted-graph`, `audio-spectrum`) take',
    'a `<canvas>` and size their backing store for the display. Give the canvas a',
    'size in CSS; a bare `<canvas width="600">` with no CSS size also works, but its',
    'layout box is then pinned to that first measurement rather than staying',
    'responsive.',
    '',
    'The CDN URLs below resolve against the published `@latest`. Working from a',
    'checkout of this repo, or against a version that is not published yet, import',
    'from the local tree instead — e.g.',
    '`import { CorruptedGlobe } from \'../src/lib/corrupted-globe.js\'`.',
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
  // Read directly and handle absence via catch (no existsSync-then-read race).
  let ref = null;
  try { ref = readFileSync(refPath, 'utf8'); } catch { /* reference doc absent — skip refresh */ }
  if (ref !== null) {
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
