/* build/clean-urls.js — MUST RUN LAST in the pipeline.

   Cloudflare Pages 308-redirects /foo.html to /foo, so a .html link costs a
   redirect hop and, worse, makes a page declare a canonical that is not the
   URL serving it. This rewrites the rendered output to the clean form Pages
   actually serves.

   Verified against a real Pages preview deployment:
     /dubai              -> 200 (dubai.html)
     /dubai/             -> 308 -> /dubai
     /dubai/business-bay -> 200 (dubai/business-bay.html)

   Idempotent: the committed tree is already clean, so a second run is a no-op.
   Runs over HTML *and* sitemap.xml, because <loc> values carry the extension
   too. */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKIP = new Set(['build', 'assets', 'node_modules', '.git', '.wrangler', 'functions']);

function walk(dir, rel = '') {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('.') || SKIP.has(name)) continue;
    const full = path.join(dir, name);
    const r = rel ? `${rel}/${name}` : name;
    if (fs.statSync(full).isDirectory()) out.push(...walk(full, r));
    else if (name.endsWith('.html')) out.push(r);
  }
  return out;
}

function clean(s) {
  return s
    .replace(/"index\.html"/g, '"/"')
    .replace(/'index\.html'/g, "'/'")
    .replace(/\/index\.html(["'#<])/g, '/$1')
    .replace(/\.html"/g, '"')
    .replace(/\.html'/g, "'")
    .replace(/\.html#/g, '#')
    .replace(/\.html</g, '<');       // sitemap <loc>…html</loc>
}

const targets = walk(ROOT).concat(fs.existsSync(path.join(ROOT, 'sitemap.xml')) ? ['sitemap.xml'] : []);
let changed = 0;
for (const f of targets) {
  const abs = path.join(ROOT, f);
  const before = fs.readFileSync(abs, 'utf8');
  const after = clean(before);
  if (after !== before) { fs.writeFileSync(abs, after, 'utf8'); changed++; }
}

console.log(`clean-urls: rewrote ${changed} of ${targets.length} file(s)`);
