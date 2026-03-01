/**
 * Builds the extension into dist/. Load the dist/ folder in Chrome (Load unpacked).
 * Keeps source (src/) separate from the loadable artifact (dist/).
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as esbuild from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

function mkdirp(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  mkdirp(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  mkdirp(destDir);
  for (const name of fs.readdirSync(srcDir)) {
    const srcPath = path.join(srcDir, name);
    const destPath = path.join(destDir, name);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function main() {
  if (fs.existsSync(dist)) {
    fs.rmSync(dist, { recursive: true });
  }
  mkdirp(dist);

  copyFile(path.join(root, 'manifest.json'), path.join(dist, 'manifest.json'));
  copyDir(path.join(root, 'src', 'background'), path.join(dist, 'background'));
  copyDir(path.join(root, 'src', 'popup'), path.join(dist, 'popup'));
  copyDir(path.join(root, 'src', 'options'), path.join(dist, 'options'));
  copyDir(path.join(root, 'src', 'shared'), path.join(dist, 'shared'));
  copyDir(path.join(root, 'lib'), path.join(dist, 'lib'));
  copyDir(path.join(root, 'icons'), path.join(dist, 'icons'));

  mkdirp(path.join(dist, 'content'));
  await esbuild.build({
    entryPoints: [path.join(root, 'src', 'content', 'main.js')],
    bundle: true,
    format: 'iife',
    target: 'es2020',
    outfile: path.join(dist, 'content', 'content.js'),
  });

  console.log('Built to dist/. In Chrome: Load unpacked → select the dist folder.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
