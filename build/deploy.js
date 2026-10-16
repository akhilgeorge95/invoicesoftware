/* build/deploy.js — stages only the public files, then deploys that to
   Cloudflare Pages.

   The repo root is the publish directory, which means a plain
   `wrangler pages deploy .` uploads build/ too — verified: /build/seo.js
   returned 200 on the live site. Nothing in there is secret, but shipping the
   generators, the location data and the research notes in bannedNames is
   pointless weight and needless surface. robots.txt should be a courtesy, not
   the only thing keeping a directory out of sight.

   Usage:  node build/deploy.js [--branch <name>]
*/

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

/* Everything here stays local. Anything else at the root is published. */
const PRIVATE = new Set([
  'build', 'node_modules', '.git', '.wrangler', '.github',
  '.gitignore', '.gitattributes', '.assetsignore', 'README.md',
  'package.json', 'package-lock.json',
]);

const args = process.argv.slice(2);
const branch = (args.includes('--branch') ? args[args.indexOf('--branch') + 1] : 'main');

function copy(src, dest) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const n of fs.readdirSync(src)) copy(path.join(src, n), path.join(dest, n));
  } else {
    fs.copyFileSync(src, dest);
  }
}

const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'invoicesoftware-'));
let files = 0;
for (const name of fs.readdirSync(ROOT)) {
  if (PRIVATE.has(name)) continue;
  copy(path.join(ROOT, name), path.join(stage, name));
}

(function count(dir) {
  for (const n of fs.readdirSync(dir)) {
    const p = path.join(dir, n);
    fs.statSync(p).isDirectory() ? count(p) : files++;
  }
})(stage);

console.log(`staged ${files} public file(s) in ${stage}`);
console.log(`excluded: ${[...PRIVATE].filter(p => fs.existsSync(path.join(ROOT, p))).join(', ')}`);
console.log();

try {
  execFileSync('npx', ['--yes', 'wrangler@latest', 'pages', 'deploy', stage,
    '--project-name', 'invoicesoftware', '--branch', branch, '--commit-dirty=true'],
    { stdio: 'inherit', shell: process.platform === 'win32' });
} finally {
  fs.rmSync(stage, { recursive: true, force: true });
}
