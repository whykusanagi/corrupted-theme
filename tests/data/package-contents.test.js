/**
 * What actually ends up in the published tarball, and the dev server's
 * containment check.
 *
 * Both exist because of real escapes: the portfolio site's `Dockerfile` and
 * `docker-entrypoint.sh` shipped to npm in every release up to 0.3.3 (they
 * named another project and ran `scripts/` files the tarball excludes, so a
 * consumer's copy could never even build — both files were deleted in 0.3.4),
 * and the dev server's traversal guard was a bare startsWith().
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isInsideRoot } from '../../scripts/static-server.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('the build produces every artifact the CDN serves', () => {
  // publish-to-cdn.sh uploads whatever is in dist/, so a file the build stops
  // producing silently disappears from the next @version — and from @latest the
  // moment the pointer moves. That is how 0.3.4 nearly shipped: `npm run build`
  // emitted theme.min.css alone, while @0.3.3 served eight files. The three
  // rollup globals came from `build:umd`, which existed but was wired into
  // nothing; nikke-utilities.css came from an unscripted postcss invocation; and
  // corrupted-text.global.js was maintained by hand and had drifted from source.
  //
  // This list is the CDN's contract. Removing an entry is a breaking change for
  // no-build consumers and belongs in a major version with a migration note.
  const CDN_ARTIFACTS = [
    'clipboard-helpers.global.js',
    'corrupted-text.global.js',
    'llms.txt',
    'manifest.json',
    'nikke-utilities.css',
    'theme.min.css',
    'timer-registry.global.js',
    'toast.global.js',
  ];
  const dist = path.join(ROOT, 'dist');
  const missing = CDN_ARTIFACTS.filter((f) => !existsSync(path.join(dist, f)));
  assert.deepEqual(
    missing,
    [],
    `dist/ is missing ${missing.join(', ')} — run \`npm run build\`. These paths are already live on the CDN; dropping one 404s every pinned consumer that loads it.`,
  );
});

test('isInsideRoot rejects a sibling that merely shares the root prefix', () => {
  assert.equal(isInsideRoot('/srv/site/index.html', '/srv/site'), true);
  assert.equal(isInsideRoot('/srv/site', '/srv/site'), true);
  // The bug: a prefix test passes these, because '/srv/site' is a prefix of both.
  assert.equal(isInsideRoot('/srv/site-secrets/.env', '/srv/site'), false);
  assert.equal(isInsideRoot('/srv/sitex', '/srv/site'), false);
  assert.equal(isInsideRoot('/srv/site/../../etc/passwd', '/srv/site'), false);
  assert.equal(isInsideRoot('/etc/passwd', '/srv/site'), false);
});

test('the tarball carries package files only — no container, shell or dev strays', () => {
  const out = execFileSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: ROOT, encoding: 'utf8', maxBuffer: 1e8, stdio: ['ignore', 'pipe', 'ignore']
  });
  const files = JSON.parse(out)[0].files.map((f) => f.path);
  assert.ok(files.length > 50, `expected a populated tarball, got ${files.length} entries`);

  const shell = files.filter((f) => f.endsWith('.sh'));
  assert.deepEqual(shell, [], `shell scripts must not ship: ${shell.join(', ')}`);

  // The tarball root is documentation and manifests. Anything else there has
  // twice turned out to belong to another repository.
  const strays = files.filter(
    (f) => !f.includes('/') && !/\.(md|json)$/i.test(f) && f !== 'LICENSE'
  );
  assert.deepEqual(strays, [], `unexpected root-level files: ${strays.join(', ')}`);

  for (const dir of ['tests/', 'scripts/', 'docs/planning/']) {
    const leaked = files.filter((f) => f.startsWith(dir));
    assert.deepEqual(leaked, [], `${dir} must not ship: ${leaked.join(', ')}`);
  }
});

test('every generated data module still has its canonical JSON source', () => {
  // `npm run data:generate` writes a .data.js per src/data/*.json and never
  // removes anything. Deleting a canonical .json therefore leaves its module
  // behind, still shipping the data it inlined — and the CI staleness check
  // stays clean, because regeneration simply doesn't touch the orphan.
  const dir = path.join(ROOT, 'src/data');
  const orphans = readdirSync(dir)
    .filter((f) => f.endsWith('.data.js'))
    .filter((f) => !existsSync(path.join(dir, `${f.slice(0, -'.data.js'.length)}.json`)));
  assert.deepEqual(orphans, [], `generated module(s) with no source: ${orphans.join(', ')}`);
});
