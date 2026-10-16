/* build/sync-chrome.js — re-syncs the nav, mobile menu and footer into the five
   hand-written core pages so they match what the generators emit.

   Without this, the core pages keep whatever chrome they were hand-written
   with, and the location pages end up orphaned: linked from each other but
   from nothing on the main site. Googlebot discovers pages by following
   links, and a sitemap alone is the weakest possible discovery signal — so an
   unlinked location page is effectively invisible no matter how good it is.

   Only the three chrome blocks are touched. Everything between them — the
   actual page content — is left exactly as written. */

'use strict';

const fs = require('fs');
const path = require('path');
const CHROME = require('./chrome');

const ROOT = path.join(__dirname, '..');

/* Which nav item each core page should mark active. */
const PAGES = {
  'index.html': '/',
  'features.html': '/features',
  'pricing.html': '/pricing',
  'e-invoicing.html': '/e-invoicing',
  'contact.html': '/contact',
};

const BLOCKS = [
  // [what to find, what to replace it with]
  [/<header class="nav">[\s\S]*?<\/header>/, active => CHROME.navOnly(active)],
  [/<div class="mobile-menu" id="mobile-menu">[\s\S]*?\n<\/div>/, () => CHROME.mobileMenu()],
  [/<footer class="footer">[\s\S]*?<\/footer>/, () => CHROME.footer()],
];

let changed = 0;
for (const [file, active] of Object.entries(PAGES)) {
  const abs = path.join(ROOT, file);
  let html = fs.readFileSync(abs, 'utf8');
  const original = html;

  for (const [rx, build] of BLOCKS) {
    if (!rx.test(html)) { console.log(`  ! ${file}: no match for ${rx.source.slice(0, 32)}…`); continue; }
    html = html.replace(rx, () => build(active));
  }

  if (html !== original) { fs.writeFileSync(abs, html, 'utf8'); changed++; }
  console.log(`  ${file.padEnd(20)} nav active: ${active}`);
}

console.log(`sync-chrome: updated ${changed} of ${Object.keys(PAGES).length} core page(s)`);
