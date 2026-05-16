#!/usr/bin/env node
/**
 * © 2025-present Artem Iagovdik
 * https://github.com/artttj/synto
 *
 * Validates library/library.json before bundling.
 * Catches: duplicate ids, missing en prompt, undeclared placeholders,
 * and missing <page>...</page> delimiters.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lib = JSON.parse(readFileSync(resolve(root, 'library/library.json'), 'utf8'));

const errors = [];
const idsSeen = new Set();

for (const entry of lib.entries) {
  if (!entry.id) {
    errors.push(`Missing id: ${JSON.stringify(entry).slice(0, 80)}`);
    continue;
  }
  if (idsSeen.has(entry.id)) errors.push(`Duplicate id: ${entry.id}`);
  idsSeen.add(entry.id);

  const promptValue = entry.prompt;
  const enPrompt = typeof promptValue === 'string' ? promptValue : promptValue?.en;
  if (!enPrompt) {
    errors.push(`${entry.id}: missing en prompt`);
    continue;
  }

  for (const ph of entry.placeholders ?? []) {
    if (!enPrompt.includes(`{${ph}}`)) {
      errors.push(`${entry.id}: declares placeholder {${ph}} but prompt does not use it`);
    }
  }

  if (!enPrompt.includes('<page>') || !enPrompt.includes('</page>')) {
    errors.push(`${entry.id}: prompt missing <page>...</page> content delimiter`);
  }
}

if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  process.exit(1);
}

console.log(`✓ ${lib.entries.length} library entries validated`);
