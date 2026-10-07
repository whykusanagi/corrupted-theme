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
import { fileURLToPath } from 'node:url';
import { isInsideRoot } from '../../scripts/static-server.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

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
