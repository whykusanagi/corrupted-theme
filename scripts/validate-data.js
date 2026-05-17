#!/usr/bin/env node
/**
 * Validates each canonical JSON in src/data/ against its schema.
 * Exits with status 1 on any validation failure.
 *
 * Used by `npm run validate-data` and CI.
 */

import Ajv from 'ajv';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, '..', 'src', 'data');

const targets = [
  { data: 'phrases.json',  schema: 'schemas/phrases.schema.json' },
  { data: 'charsets.json', schema: 'schemas/charsets.schema.json' },
  { data: 'colors.json',   schema: 'schemas/colors.schema.json' },
];

const ajv = new Ajv({ allErrors: true });
let failed = false;

for (const { data, schema } of targets) {
  const dataPath   = resolve(dataDir, data);
  const schemaPath = resolve(dataDir, schema);
  const dataJson   = JSON.parse(readFileSync(dataPath, 'utf-8'));
  const schemaJson = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  const validate   = ajv.compile(schemaJson);
  if (validate(dataJson)) {
    console.log(`  ✓ ${data}`);
  } else {
    console.error(`  ✗ ${data}`);
    console.error(JSON.stringify(validate.errors, null, 2));
    failed = true;
  }
}

if (failed) {
  console.error('\nData validation failed.');
  process.exit(1);
}
console.log('\nAll data files valid.');
