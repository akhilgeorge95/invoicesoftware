/* build/sitemap.js — generates sitemap.xml and robots.txt from the files that
   actually exist on disk.

   Two deliberate choices:

   1. <lastmod> comes from git, not the build clock. Stamping every URL with
      today's date on every build tells Google nothing about what changed, so
      it learns to ignore the field. A file that differs from HEAD gets today;
      everything else gets the date of the commit that last touched it.

   2. hreflang is READ BACK from each page rather than assumed. Announcing
      en-ae for a page whose own tag says something else is a contradiction,
      and Google discards annotations it cannot reconcile. */

'use strict';

const fs = require('fs');
const path = require('path');
const SEO = require('./seo');
const GITDATE = require('./gitdate');

const ROOT = path.join(__dirname, '..');
const SKIP = new Set(['build', 'assets', 'node_modules', '.git', '.wrangler', 'functions']);

/* Pages that exist but must not be advertised: 404 is noindex by design. */
const EXCLUDE = new Set(['404.html']);

function walk(dir, rel = '') {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('.') || SKIP.has(name)) continue;
    const full = path.join(dir, name);
    const r = rel ? `${rel}/${name}` : name;
    if (fs.statSync(full).isDirectory()) out.push(...walk(full, r));
    else if (name.endsWith('.html') && !EXCLUDE.has(r)) out.push(r);
  }
  return out;
}

/* ---- rank / priority --------------------------------------------------- */
const CORE = ['index.html', 'features.html', 'pricing.html', 'e-invoicing.html', 'locations.html', 'contact.html'];

function rank(f) {
  const i = CORE.indexOf(f);
  if (i !== -1) return i;
  return f.includes('/') ? 100 : 50;   // emirate hubs before city pages
}

function meta(f) {
  if (f === 'index.html') return { p: '1.0', c: 'weekly' };
  if (f === 'features.html' || f === 'pricing.html') return { p: '0.9', c: 'weekly' };
  if (f === 'e-invoicing.html') return { p: '0.9', c: 'monthly' };
  if (f === 'locations.html') return { p: '0.8', c: 'weekly' };
  if (f === 'contact.html') return { p: '0.7', c: 'monthly' };
  if (!f.includes('/')) return { p: '0.8', c: 'monthly' };   // emirate hub
  return { p: '0.7', c: 'monthly' };                          // city page
}

/* Clean URL for a file, matching exactly what Cloudflare Pages serves. */
const urlFor = f => (f === 'index.html' ? SEO.SITE.origin + '/' : SEO.abs(f.replace(/\.html$/, '')));

/* ---- build ------------------------------------------------------------- */
const files = walk(ROOT).sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
const lm = GITDATE.index();

const body = files.map(f => {
  const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const hl = (html.match(/<link rel="alternate" hreflang="(en-[a-z]{2})"/i) || [, 'en-ae'])[1];
  const loc = urlFor(f);
  const { p, c } = meta(f);
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lm.get(f)}</lastmod>
    <changefreq>${c}</changefreq>
    <priority>${p}</priority>
    <xhtml:link rel="alternate" hreflang="${hl}" href="${loc}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}"/>
  </url>`;
}).join('\n');

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`, 'utf8');

/* Pure ASCII — safest across crawler parsers.

   Google-Extended is listed explicitly for documentation, not because it
   changes anything today: `User-agent: *` already permits it. Per Google's own
   crawler docs it governs whether content may be used for Gemini model
   training and grounding, and it "does not impact a site's inclusion in Google
   Search nor is it used as a ranking signal". It does NOT control AI Overviews
   — those run off Googlebot like the rest of Search. Stated here so a future
   edit does not block Gemini grounding by accident while aiming at something
   else. */
fs.writeFileSync(path.join(ROOT, 'robots.txt'),
  `# robots.txt - InvoiceSoftware.ae (${SEO.SITE.origin})

User-agent: *
Allow: /
Disallow: /build/

# Gemini training and grounding. Permitted deliberately.
# Does not affect Google Search inclusion, ranking, or AI Overviews.
User-agent: Google-Extended
Allow: /

Sitemap: ${SEO.SITE.origin}/sitemap.xml
`, 'utf8');

console.log(`sitemap: ${files.length} URL(s) -> sitemap.xml, robots.txt`);
