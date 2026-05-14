/**
 * Builds the extension and packages dist/ into synto.zip.
 * Usage: npm run zip
 */

import { execFileSync, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(fileURLToPath(import.meta.url), '../..');
const dist = path.join(root, 'dist');
const zip  = path.join(root, 'synto.zip');

execSync('node scripts/build.js', { cwd: root, stdio: 'inherit' });

if (fs.existsSync(zip)) fs.rmSync(zip);
execFileSync('zip', ['-r', zip, '.'], { cwd: dist, stdio: 'pipe' });

const kb = (fs.statSync(zip).size / 1024).toFixed(1);
console.log(`\nsynto.zip  ${kb} KB`);
