// tests/data/json-shape.test.js
// Verifies each canonical JSON validates against its schema (acts as a
// regression test alongside the npm run validate-data CLI).
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import Ajv from 'ajv';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, '..', '..', 'src', 'data');

function load(name) {
  return JSON.parse(readFileSync(resolve(dataDir, name), 'utf-8'));
}

const ajv = new Ajv({ allErrors: true });

test('phrases.json validates against its schema', () => {
  const validate = ajv.compile(load('schemas/phrases.schema.json'));
  const valid = validate(load('phrases.json'));
  assert.ok(valid, JSON.stringify(validate.errors, null, 2));
});

test('charsets.json validates against its schema', () => {
  const validate = ajv.compile(load('schemas/charsets.schema.json'));
  const valid = validate(load('charsets.json'));
  assert.ok(valid, JSON.stringify(validate.errors, null, 2));
});

test('colors.json validates against its schema', () => {
  const validate = ajv.compile(load('schemas/colors.schema.json'));
  const valid = validate(load('colors.json'));
  assert.ok(valid, JSON.stringify(validate.errors, null, 2));
});

test('phrases.json has all 6 pools in every language bundle', () => {
  const p = load('phrases.json');
  const expectedPools = ['data', 'system', 'status', 'void', 'memory', 'glitch'];
  for (const mode of ['sfw', 'nsfw']) {
    for (const lang of ['japanese', 'romaji', 'english']) {
      for (const pool of expectedPools) {
        assert.ok(Array.isArray(p[mode][lang][pool]), `${mode}.${lang}.${pool} missing`);
      }
    }
  }
});
