/**
 * Builds the extension into dist/. Load the dist/ folder in Chrome (Load unpacked).
 *
 * What this does vs a plain file copy:
 *  - Bundles each JS entry point (popup, options, background, content) with esbuild
 *  - Minifies JS and CSS → smaller files, fewer module requests
 *  - Strips type="module" from HTML (bundled IIFE doesn't need it)
 *  - Resizes logo.png from 2560×2560 → 128×128 for dist (saves ~38 KB)
 *  - Skips lib/ and shared/ (bundled into popup.js / options.js / content.js)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import * as esbuild from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src  = path.join(root, 'src');
const dist = path.join(root, 'dist');

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(srcPath, destPath) {
  mkdirp(path.dirname(destPath));
  fs.copyFileSync(srcPath, destPath);
}

function copyHtml(srcPath, destPath) {
  let html = fs.readFileSync(srcPath, 'utf8');
  // Remove type="module" — bundled IIFE output doesn't need ES-module loading
  html = html.replace(/ type="module"/g, '');
  mkdirp(path.dirname(destPath));
  fs.writeFileSync(destPath, html);
}

async function minifyCss(srcPath, destPath) {
  const css = fs.readFileSync(srcPath, 'utf8');
  const result = await esbuild.transform(css, { loader: 'css', minify: true });
  mkdirp(path.dirname(destPath));
  fs.writeFileSync(destPath, result.code);
}

async function main() {
  // Clean dist
  if (fs.existsSync(dist)) fs.rmSync(dist, { recursive: true });
  mkdirp(dist);

  // ── Manifest ──────────────────────────────────────────────────────────────
  copyFile(path.join(root, 'manifest.json'), path.join(dist, 'manifest.json'));

  // ── Icons ─────────────────────────────────────────────────────────────────
  mkdirp(path.join(dist, 'icons'));
  for (const icon of ['icon16.png', 'icon48.png', 'icon128.png', 'logo.svg']) {
    copyFile(path.join(root, 'icons', icon), path.join(dist, 'icons', icon));
  }
  // Resize logo.png to 128×128 — source is 2560×2560, UI uses it at ≤24px
  execFileSync('sips', [
    '-z', '128', '128',
    path.join(root, 'icons', 'logo.png'),
    '--out', path.join(dist, 'icons', 'logo.png'),
  ]);

  // ── HTML (strip type="module") ────────────────────────────────────────────
  copyHtml(
    path.join(src, 'popup',   'popup.html'),
    path.join(dist, 'popup',  'popup.html'),
  );
  copyHtml(
    path.join(src, 'options', 'options.html'),
    path.join(dist, 'options','options.html'),
  );

  // ── CSS (minify) ──────────────────────────────────────────────────────────
  await minifyCss(
    path.join(src, 'popup',   'popup.css'),
    path.join(dist, 'popup',  'popup.css'),
  );
  await minifyCss(
    path.join(src, 'options', 'options.css'),
    path.join(dist, 'options','options.css'),
  );

  // ── JS (bundle + minify) ──────────────────────────────────────────────────
  const commonOpts = { bundle: true, minify: true, target: 'es2020' };

  await Promise.all([
    esbuild.build({
      ...commonOpts,
      entryPoints: [path.join(src, 'popup', 'popup.js')],
      format: 'iife',
      outfile: path.join(dist, 'popup', 'popup.js'),
    }),
    esbuild.build({
      ...commonOpts,
      entryPoints: [path.join(src, 'options', 'options.js')],
      format: 'iife',
      outfile: path.join(dist, 'options', 'options.js'),
    }),
    esbuild.build({
      ...commonOpts,
      entryPoints: [path.join(src, 'background', 'service-worker.js')],
      format: 'esm',
      outfile: path.join(dist, 'background', 'service-worker.js'),
    }),
    esbuild.build({
      ...commonOpts,
      entryPoints: [path.join(src, 'content', 'main.js')],
      format: 'iife',
      outfile: path.join(dist, 'content', 'content.js'),
    }),
  ]);

  // ── Report ────────────────────────────────────────────────────────────────
  const files = fs.readdirSync(dist, { recursive: true })
    .filter(f => !fs.statSync(path.join(dist, f)).isDirectory())
    .map(f => {
      const size = fs.statSync(path.join(dist, f)).size;
      return `  ${String(size).padStart(7)} B  ${f}`;
    });
  console.log(`\nBuilt to dist/  (${files.length} files)\n${files.join('\n')}`);
  console.log('\nIn Chrome → Load unpacked → select the dist/ folder.');
}

main().catch((err) => { console.error(err); process.exit(1); });
