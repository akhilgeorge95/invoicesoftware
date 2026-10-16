/* build/seo-audit.js — read-only, site-wide. Exits non-zero on any error.

   Errors are things that break indexing or waste crawl budget. Warnings are
   advisory only, because a deliberately long title is a judgement call, not a
   defect.

   Because this site is UAE-only, the locale/region/hreflang checks are single
   patterns rather than the hundred-country alternations a multi-market site
   needs — which also means they cannot silently fail a correct new page. */

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

const CHECKS = [
  ['title',            /<title>([^<]+)<\/title>/i],
  ['meta description', /<meta name="description" content="[^"]+"/i],
  ['canonical',        /<link rel="canonical" href="https:\/\/[^"]+"/i],
  ['robots',           /<meta name="robots" content="[^"]*index[^"]*"/i],
  ['og:title',         /<meta property="og:title" content="[^"]+"/i],
  ['og:description',   /<meta property="og:description" content="[^"]+"/i],
  ['og:url',           /<meta property="og:url" content="https:\/\/[^"]+"/i],
  ['og:image',         /<meta property="og:image" content="https:\/\/[^"]+"/i],
  ['og:locale en_AE',  /<meta property="og:locale" content="en_AE"/i],
  ['twitter:card',     /<meta name="twitter:card" content="summary_large_image"/i],
  ['geo.region AE-xx', /<meta name="geo\.region" content="AE-[A-Z]{2}"/],
  ['geo.position',     /<meta name="geo\.position" content="[\d.]+;[\d.]+"/],
  ['hreflang en-ae',   /<link rel="alternate" hreflang="en-ae" href="https:\/\/[^"]+"/i],
  ['hreflang x-default', /hreflang="x-default"/i],
  ['lang="en-AE"',     /<html lang="en-AE"/],
  ['viewport',         /<meta name="viewport"/i],
  ['favicon',          /<link rel="icon"/i],
  ['JSON-LD',          /application\/ld\+json/],
];

const files = walk(ROOT);
const problems = [];
const warnings = [];
const seen = { title: new Map(), desc: new Map(), canon: new Map() };

for (const f of files) {
  const html = fs.readFileSync(path.join(ROOT, f), 'utf8');

  for (const [name, rx] of CHECKS) {
    if (!rx.test(html)) problems.push(`${f}: missing or malformed ${name}`);
  }

  /* exactly one h1 */
  const h1s = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1s !== 1) problems.push(`${f}: ${h1s} <h1> tags, expected exactly 1`);

  /* every JSON-LD block must parse */
  for (const m of html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)) {
    try { JSON.parse(m[1]); }
    catch (e) { problems.push(`${f}: INVALID JSON-LD — ${e.message}`); }
  }

  /* images need alt text */
  for (const m of html.matchAll(/<img\s[^>]*>/gi)) {
    if (!/\salt=/i.test(m[0])) problems.push(`${f}: <img> without alt — ${m[0].slice(0, 70)}`);
  }

  /* uniqueness — duplicates are what make a location set look like doorways */
  const t = (html.match(/<title>([^<]+)<\/title>/i) || [])[1];
  const d = (html.match(/<meta name="description" content="([^"]+)"/i) || [])[1];
  const c = (html.match(/<link rel="canonical" href="([^"]+)"/i) || [])[1];
  const note = (map, key, label) => {
    if (!key) return;
    if (map.has(key)) problems.push(`${f}: DUPLICATE ${label} — also in ${map.get(key)}`);
    else map.set(key, f);
  };
  note(seen.title, t, 'TITLE');
  note(seen.desc, d, 'DESCRIPTION');
  note(seen.canon, c, 'CANONICAL');

  /* advisory lengths */
  if (t && t.length > 65) warnings.push(`${f}: title ${t.length} chars (>65, may truncate in SERPs)`);
  if (d && (d.length < 70 || d.length > 165)) warnings.push(`${f}: description ${d.length} chars (aim 70-165)`);
}

console.log(`Audited ${files.length} pages.`);
console.log(`Unique titles: ${seen.title.size} | descriptions: ${seen.desc.size} | canonicals: ${seen.canon.size}`);
console.log();

if (problems.length) {
  console.log(`✗ ${problems.length} error(s):`);
  problems.forEach(p => console.log('  - ' + p));
} else {
  console.log('✓ PASS — no SEO errors found.');
}
if (warnings.length) {
  console.log(`\n! ${warnings.length} warning(s) (advisory, not blocking):`);
  warnings.forEach(w => console.log('  - ' + w));
}

process.exitCode = problems.length ? 1 : 0;
