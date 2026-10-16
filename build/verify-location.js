/* build/verify-location.js — read-only. Exits non-zero on failure.

   Iterates data-locations.js rather than the filesystem, so an entry whose page
   was never generated is caught rather than silently missing.

   The check that matters most is the address-honesty pair. We have exactly one
   office, in Abu Dhabi. A location page that asserted a postal address in its
   target city would be a fake local listing, so this fails the build two ways:
   structurally (the Organization node's locality must still be Abu Dhabi) and
   by raw text scan (no addressLocality anywhere may name the target city),
   which also catches one smuggled into a hand-edited block. */

'use strict';

const fs = require('fs');
const path = require('path');
const SEO = require('./seo');
const LOCATIONS = require('./data-locations');

const ROOT = path.join(__dirname, '..');
const OFFICE = SEO.SITE.city;          // 'Abu Dhabi'
const fileOf = d => (d.parentSlug ? `${d.parentSlug}/${d.slug}.html` : `${d.slug}.html`);
const urlOf  = d => (d.parentSlug ? `${d.parentSlug}/${d.slug}` : d.slug);

let fail = 0;
const bad = m => { console.log('    ✗ ' + m); fail++; };

for (const d of LOCATIONS) {
  const rel = fileOf(d);
  const abs = path.join(ROOT, rel);
  console.log(`\n${rel}  (/${urlOf(d)})`);

  const before = fail;   // per-page failure count, so "ok" is per page not global
  if (!fs.existsSync(abs)) { bad('MISSING FILE — entry exists in data but no page was generated'); continue; }
  const html = fs.readFileSync(abs, 'utf8');

  /* 1. a PLACES entry must exist, and must not claim an office */
  const geo = SEO.PLACES[d.slug];
  if (!geo) bad(`no SEO.PLACES entry for "${d.slug}"`);
  else if (geo.office && d.slug !== 'abu-dhabi') bad(`PLACES marks office:true for ${d.city} — only ${OFFICE} may`);

  /* 2. every internal link resolves to a real file (clean-URL aware) */
  const broken = [];
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|tel:|#|data:)/.test(u)) continue;
    let f = u.split('#')[0].replace(/^\//, '');
    if (f === '') f = 'index.html';
    else if (!/\.[a-z0-9]+$/i.test(f)) f += '.html';
    if (!fs.existsSync(path.join(ROOT, f))) broken.push(u);
  }
  if (broken.length) bad(`broken links: ${[...new Set(broken)].join(', ')}`);

  /* 3. JSON-LD parses, and holds the four nodes a location page needs */
  const ldm = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
  if (!ldm) { bad('no JSON-LD block'); continue; }
  let graph;
  try { graph = JSON.parse(ldm[1])['@graph']; }
  catch (e) { bad('JSON-LD does not parse: ' + e.message); continue; }
  if (!Array.isArray(graph)) { bad('JSON-LD has no @graph array'); continue; }

  const typeOf = n => (Array.isArray(n['@type']) ? n['@type'].join('+') : n['@type']);
  const org = graph.find(n => String(typeOf(n)).includes('LocalBusiness'));
  const svc = graph.find(n => n['@type'] === 'Service');
  const faq = graph.find(n => n['@type'] === 'FAQPage');
  const crumb = graph.find(n => n['@type'] === 'BreadcrumbList');
  if (!org) bad('no Organization/LocalBusiness node');
  if (!svc) bad('no Service node');
  if (!crumb) bad('no BreadcrumbList node');

  /* 4. the Service must name THIS city as its areaServed */
  if (svc) {
    const name = svc.areaServed && svc.areaServed.name;
    if (name !== d.city) bad(`Service areaServed is ${JSON.stringify(name)}, expected ${JSON.stringify(d.city)}`);
    if (svc.provider && svc.provider['@id'] !== SEO.ORG_ID) bad('Service provider is not an @id reference to the Organization');
    if (svc.address || (svc.provider && svc.provider.address)) bad('Service carries an address — it must reference the Organization instead');
  }

  /* 5. FAQ depth — a location page with two questions is a thin page */
  if (!faq || !Array.isArray(faq.mainEntity) || faq.mainEntity.length < 4) {
    bad(`FAQPage missing or short (${faq && faq.mainEntity ? faq.mainEntity.length : 0} questions, need >= 4)`);
  }

  /* 6. THE HONESTY CHECK — structural, then raw text */
  if (org) {
    const locality = org.address && org.address.addressLocality;
    if (locality !== OFFICE) bad(`FAKE LOCAL ADDRESS — Organization addressLocality is ${JSON.stringify(locality)}, must stay ${JSON.stringify(OFFICE)}`);
  }
  if (d.city !== OFFICE && new RegExp(`addressLocality"\\s*:\\s*"${d.city}"`).test(html)) {
    bad(`asserts a ${d.city} postal address — NOT ALLOWED, there is one office and it is in ${OFFICE}`);
  }

  /* 7. refuted names must not appear anywhere in the rendered page */
  const hits = (d.bannedNames || []).filter(b => html.includes(b));
  if (hits.length) bad(`contains refuted/incorrect name(s): ${hits.join(', ')}`);

  /* 8. structural basics */
  const h1s = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1s !== 1) bad(`${h1s} <h1> tags, expected exactly 1`);
  if (!html.includes(`href="/${urlOf(d)}"`) && !html.includes('<nav class="breadcrumb"')) bad('no breadcrumb');

  /* 9. the first FAQ on a non-office page must address the office question */
  if (d.city !== OFFICE) {
    const first = (d.faqs && d.faqs[0] && d.faqs[0].q) || '';
    if (!/office in/i.test(first)) bad(`first FAQ is ${JSON.stringify(first)} — it should answer whether there is a local office`);
  }

  if (fail === before) console.log('    ok');
}

console.log(`\n${fail ? `✗ ${fail} failure(s)` : `✓ all ${LOCATIONS.length} location pages verified`}`);
process.exitCode = fail ? 1 : 0;
