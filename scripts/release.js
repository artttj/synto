/**
 * Bumps version, builds, zips, commits, pushes, and creates a GitHub release.
 * Usage: npm run release [patch|minor|major]  (default: patch)
 */

import { execSync, execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(fileURLToPath(import.meta.url), '../..');

function bump(version, type) {
  const [major, minor, patch] = version.split('.').map(Number);
  if (type === 'major') return `${major + 1}.0.0`;
  if (type === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

const bumpType = process.argv[2] ?? 'patch';
if (!['patch', 'minor', 'major'].includes(bumpType)) {
  console.error('Usage: npm run release [patch|minor|major]');
  process.exit(1);
}

const manifestPath = path.join(root, 'manifest.json');
const pkgPath      = path.join(root, 'package.json');
const manifest     = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const pkg          = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const oldVersion   = manifest.version;
const newVersion   = bump(oldVersion, bumpType);

if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error('Invalid version format');
  process.exit(1);
}

manifest.version   = newVersion;
pkg.version        = newVersion;

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
fs.writeFileSync(pkgPath,      JSON.stringify(pkg,      null, 2) + '\n');
execSync('npm install --package-lock-only --silent', { cwd: root, stdio: 'inherit' });

console.log(`\nv${oldVersion} → v${newVersion}\n`);

execSync('node scripts/zip.js', { cwd: root, stdio: 'inherit' });

execSync('git add -u', { cwd: root, stdio: 'inherit' });
execFileSync('git', ['commit', '-m', `v${newVersion}`], { cwd: root, stdio: 'inherit' });
execSync('git push origin main', { cwd: root, stdio: 'inherit' });

execFileSync(
  'gh',
  ['release', 'create', `v${newVersion}`, path.join(root, 'synto.zip'), '--title', `v${newVersion}`, '--generate-notes'],
  { cwd: root, stdio: 'inherit' },
);

console.log(`\nReleased v${newVersion}`);
