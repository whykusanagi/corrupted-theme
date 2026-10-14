import { test } from 'node:test';
import assert from 'node:assert/strict';
import { httpErrors, getHttpError, defaultHttpError } from '../../src/core/http-errors.js';
import { renderErrorPage } from '../../scripts/generate-error-pages.js';

const expectedCodes = [400, 401, 402, 403, 404, 408, 409, 410, 417, 418,
  422, 423, 425, 426, 429, 451, 500, 501, 502, 503];

test('HTTP error copy covers every requested code and falls back for unknown codes', () => {
  assert.deepEqual(Object.keys(httpErrors).map(Number), expectedCodes);
  assert.deepEqual(getHttpError(404), {
    title: 'Page Not Found', line: "I wasn't where you were looking. I never was."
  });
  assert.equal(getHttpError(400).title, 'Bad Request');
  assert.equal(getHttpError(429).line, 'Rate limited.');
  assert.deepEqual(getHttpError(599), defaultHttpError);
  assert.deepEqual(getHttpError('__proto__'), defaultHttpError);
});

test('generated pages have index exclusions, styles, escaping and navigation', () => {
  const html = renderErrorPage(418, httpErrors[418]);
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.match(html, /<style>[\s\S]*\.error-code/);
  assert.match(html, /I&#39;m a Teapot/);
  assert.match(html, /href="\/"/);
  assert.match(html, /<main class="error-page">/);
  assert.doesNotMatch(html, /<script/);
  const escaped = renderErrorPage(500, { title: '<script>', line: 'A & B' });
  assert.match(escaped, /&lt;script&gt;/);
  assert.match(escaped, /A &amp; B/);
  assert.throws(() => renderErrorPage('oops', defaultHttpError), RangeError);
});
