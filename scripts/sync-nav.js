#!/usr/bin/env node
/**
 * sync-nav.js — one canonical navbar, stamped into every site page.
 *
 * The site menus drifted because each page carried a hand-copied navbar
 * (owner finding, 0.3.0 release review: root and /examples/ showed
 * different menus). This script owns the single nav definition and
 * rewrites the first <nav class="navbar">…</nav> block in every
 * nav-bearing page, with hrefs computed relative to each page's location
 * and an `active` class on the current page's entry.
 *
 * Run: npm run nav:sync
 * Enforced: tests/data/nav-sync.test.js fails when any page's nav differs
 * from the canonical render, so drift breaks CI instead of shipping.
 *
 * @module scripts/sync-nav
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Canonical menu. Targets are site-root-relative; anchors allowed. */
export const NAV = [
  { label: 'Home', icon: 'fa-home', target: 'index.html' },
  {
    label: 'Components', icon: 'fa-cube', target: 'examples/showcase-complete.html',
    submenu: [
      { label: 'All Components', icon: 'fa-layer-group', target: 'examples/showcase-complete.html' },
      { label: 'Glass', icon: 'fa-square', target: 'examples/showcase-complete.html#glass' },
      { label: 'Standard', icon: 'fa-shapes', target: 'examples/showcase-complete.html#components' },
      { label: 'Navigation', icon: 'fa-bars', target: 'examples/showcase-complete.html#navigation' },
      { label: 'API Docs', icon: 'fa-code', target: 'examples/showcase-complete.html#api-docs' },
      { label: '0.3.0 New', icon: 'fa-wave-square', target: 'examples/showcase-complete.html#v030-components' },
      { label: '0.2.0 New', icon: 'fa-layer-group', target: 'examples/showcase-complete.html#v020-components' },
    ],
  },
  {
    label: 'Extensions', icon: 'fa-puzzle-piece', target: 'examples/extensions-showcase.html',
    submenu: [
      { label: 'All Extensions', icon: 'fa-list', target: 'examples/extensions-showcase.html' },
      { label: 'Gallery', icon: 'fa-images', target: 'examples/extensions-showcase.html#gallery' },
      { label: 'Lightbox', icon: 'fa-expand', target: 'examples/extensions-showcase.html#lightbox' },
      { label: 'NSFW Blur', icon: 'fa-eye-slash', target: 'examples/extensions-showcase.html#nsfw' },
      { label: 'Social Links', icon: 'fa-share-alt', target: 'examples/extensions-showcase.html#social' },
      { label: 'Countdown', icon: 'fa-hourglass-half', target: 'examples/extensions-showcase.html#countdown' },
    ],
  },
  {
    label: 'Examples', icon: 'fa-flask', target: 'examples/index.html',
    submenu: [
      { label: 'Animation Gallery (0.3.0)', icon: 'fa-th', target: 'examples/animations.html' },
      { label: 'Stream Overlays', icon: 'fa-broadcast-tower', target: 'examples/stream-overlays.html' },
      { label: 'Canvas Transitions', icon: 'fa-random', target: 'examples/transitions.html' },
      { label: 'Corrupted Mandala', icon: 'fa-dharmachakra', target: 'examples/corrupted-mandala.html' },
      { label: 'Scroll Decode', icon: 'fa-scroll', target: 'examples/scroll-decode.html' },
      { label: 'Corrupted Timeline', icon: 'fa-stream', target: 'examples/corrupted-timeline.html' },
      { label: 'Glitch Stagger Grid', icon: 'fa-border-all', target: 'examples/glitch-stagger-grid.html' },
      { label: 'Animation Blocks', icon: 'fa-film', target: 'examples/animation-blocks/index.html' },
      { label: 'CRT Effects', icon: 'fa-tv', target: 'examples/advanced/crt-effects.html' },
      { label: 'Decrypt Reveal', icon: 'fa-key', target: 'examples/advanced/decrypt-reveal.html' },
      { label: 'Phrase Cycle', icon: 'fa-history', target: 'examples/advanced/phrase-cycle.html' },
      { label: 'GLSL Vortex', icon: 'fa-hurricane', target: 'examples/advanced/glsl-vortex.html' },
      { label: 'Particles BG', icon: 'fa-atom', target: 'examples/advanced/particles-bg.html' },
      { label: 'Character Corruption', icon: 'fa-terminal', target: 'examples/basic/corrupted-text.html' },
      { label: 'Buffer Corruption', icon: 'fa-keyboard', target: 'examples/basic/typing-animation.html' },
      { label: 'Widgets Showcase', icon: 'fa-th-large', target: 'examples/components/showcase.html' },
      { label: 'Nikke Team Builder', icon: 'fa-users', target: 'examples/nikke-team-builder.html' },
      { label: 'Buttons', icon: 'fa-hand-pointer', target: 'examples/button.html' },
      { label: 'Cards', icon: 'fa-square', target: 'examples/card.html' },
      { label: 'Forms', icon: 'fa-edit', target: 'examples/form.html' },
      { label: 'Layouts', icon: 'fa-columns', target: 'examples/layout.html' },
    ],
  },
  { label: 'Docs', icon: 'fa-book', target: 'https://github.com/whykusanagi/corrupted-theme/blob/main/docs/COMPONENTS_REFERENCE.md' },
];

/** Href from a page (root-relative path) to a target (root-relative or URL). */
function hrefFrom(pagePath, target) {
  if (/^https?:/.test(target)) return target;
  const [file, anchor] = target.split('#');
  const rel = path.relative(path.dirname(pagePath), file).split(path.sep).join('/');
  return (rel || '.') + (anchor ? `#${anchor}` : '');
}

/** True when this nav target is the page being rendered. */
function isActive(pagePath, target) {
  return !/^https?:/.test(target) && target.split('#')[0] === pagePath;
}

/**
 * Render the canonical navbar for one page.
 * @param {string} pagePath - Root-relative page path (e.g. 'examples/index.html')
 * @returns {string} nav HTML
 */
export function renderNav(pagePath) {
  const chevron = '<i class="fas fa-chevron-down" style="font-size: 0.7em; margin-left: 4px;"></i>';
  const item = ({ label, icon, target }) =>
    `<a href="${hrefFrom(pagePath, target)}"${isActive(pagePath, target) ? ' class="active"' : ''}><i class="fas ${icon}"></i> ${label}</a>`;

  const lines = [
    '<nav class="navbar">',
    '    <div class="navbar-content">',
    `      <a href="${hrefFrom(pagePath, 'index.html')}" class="navbar-logo">`,
    '        <i class="fas fa-palette"></i> Corrupted Theme',
    '      </a>',
    '      <ul class="navbar-links">',
  ];
  for (const entry of NAV) {
    if (!entry.submenu) {
      lines.push(`        <li>${item(entry)}</li>`);
      continue;
    }
    const active = entry.submenu.some((s) => isActive(pagePath, s.target)) || isActive(pagePath, entry.target);
    lines.push(
      '        <li class="has-submenu">',
      `          <a href="${hrefFrom(pagePath, entry.target)}"${active ? ' class="active"' : ''}>`,
      `            <i class="fas ${entry.icon}"></i> ${entry.label}`,
      `            ${chevron}`,
      '          </a>',
      '          <div class="submenu">',
      ...entry.submenu.map((s) => `            ${item(s)}`),
      '          </div>',
      '        </li>',
    );
  }
  lines.push('      </ul>', '    </div>', '  </nav>');
  return lines.join('\n');
}

/** Every site page gets the navbar: root index.html + all of examples/. */
export function navPages() {
  const pages = readdirSync(path.join(ROOT, 'examples'), { recursive: true })
    .map(String)
    .filter((f) => f.endsWith('.html'))
    .map((f) => path.join('examples', f).split(path.sep).join('/'));
  return ['index.html', ...pages].sort();
}

/**
 * Replace the FIRST <nav class="navbar">…</nav> block, or inject the navbar
 * right after <body…> when a page has none (owner rule: the nav is
 * identical on every page). Later inline demo navbars are untouched.
 */
export function stampNav(source, pagePath) {
  const start = source.indexOf('<nav class="navbar">');
  if (start === -1) {
    const bodyOpen = source.match(/<body[^>]*>/);
    if (!bodyOpen) return source;
    const at = source.indexOf(bodyOpen[0]) + bodyOpen[0].length;
    return `${source.slice(0, at)}\n  ${renderNav(pagePath)}\n${source.slice(at)}`;
  }
  const end = source.indexOf('</nav>', start);
  return source.slice(0, start) + renderNav(pagePath) + source.slice(end + '</nav>'.length);
}

function main() {
  let changed = 0;
  for (const f of navPages()) {
    const p = path.join(ROOT, f);
    const before = readFileSync(p, 'utf8');
    const after = stampNav(before, f);
    if (after !== before) {
      writeFileSync(p, after);
      changed++;
    }
  }
  console.log(`nav synced across ${navPages().length} pages (${changed} rewritten)`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
