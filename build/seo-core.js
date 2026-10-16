/* build/seo-core.js — injects the full SEO head block into the five
   hand-written core pages.

   Idempotent two ways: if the SEO:START/SEO:END sentinels are already present
   it replaces what is between them; if not, it strips the page's original
   hand-written SEO tags and inserts the block after the viewport meta. Running
   it twice changes nothing.

   FAQPage schema is PARSED OUT OF THE PAGE'S OWN ACCORDION rather than being
   written again here. Google penalises FAQ markup that does not match visible
   content, and a second hand-maintained copy of every answer would drift the
   first time someone edited the page. */

'use strict';

const fs = require('fs');
const path = require('path');
const SEO = require('./seo');

const ROOT = path.join(__dirname, '..');

/* Strip tags and collapse entities for use inside a JSON-LD string. */
function text(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Pull Q&A pairs straight out of the rendered accordion. */
function faqsFrom(html) {
  const out = [];
  for (const m of html.matchAll(/<div class="acc-item[^"]*">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g)) {
    const block = m[1];
    const q = block.match(/<button class="acc-btn"[^>]*>([\s\S]*?)<span class="acc-btn__icon"/);
    const a = block.match(/<div class="acc-panel"><div><p>([\s\S]*?)<\/p>/);
    if (q && a) out.push({ q: text(q[1]), a: text(a[1]) });
  }
  return out;
}

const crumb = (...names) => SEO.breadcrumbSchema(
  [{ name: 'Home', url: 'index.html' }].concat(
    names.map(n => ({ name: n[0], url: n[1] }))
  )
);

/* One config per core page. desc is the meta description; it is also what the
   OG/Twitter description becomes. */
const PAGES = [
  {
    file: 'index.html',
    url: 'index.html',
    title: 'Invoice Software UAE | VAT Invoicing, Payments & Expenses',
    desc: 'Send VAT-compliant invoices, take online payments, and track expenses, time and projects — one platform built for UAE businesses and ready for FTA e-invoicing.',
    keywords: 'invoice software UAE, invoicing software UAE, VAT invoice software, billing software UAE, e-invoicing UAE, FTA e-invoicing, accounting software UAE, free invoice software',
    schemas: h => [SEO.organizationSchema(), SEO.webSiteSchema(), SEO.softwareAppSchema(), SEO.faqSchema(faqsFrom(h))],
  },
  {
    file: 'features.html',
    url: 'features',
    title: 'Features | Invoicing, Payments, Expenses & Projects',
    desc: 'Invoicing and quotes, online payments, recurring billing, time tracking, projects, expenses, banking, a branded client portal, automations and a full REST API — built for UAE businesses.',
    keywords: 'invoice software features, invoicing features UAE, recurring invoices, time tracking invoicing, expense tracking UAE, client portal invoicing, invoice templates UAE, invoicing API',
    schemas: h => [SEO.organizationSchema(), crumb(['Features', 'features'])],
  },
  {
    file: 'pricing.html',
    url: 'pricing',
    title: 'Pricing in AED | Free Plan, Pro from AED 49/month',
    desc: 'Free forever for up to 5 clients. Pro from AED 49/month, Enterprise from AED 69/month, Premium from AED 1,099/year. 30-day money-back promise, no cut of what you invoice.',
    keywords: 'invoice software pricing UAE, invoicing software cost AED, free invoice software UAE, billing software price Dubai, invoice software plans',
    schemas: h => [SEO.organizationSchema(), crumb(['Pricing', 'pricing']), SEO.softwareAppSchema(), SEO.faqSchema(faqsFrom(h))],
  },
  {
    file: 'e-invoicing.html',
    url: 'e-invoicing',
    title: 'UAE e-Invoicing & PINT AE | FTA Mandate Guide',
    desc: 'A plain-English guide to the UAE e-invoicing mandate: the Peppol five-corner model, the PINT AE format, Accredited Service Providers, and the FTA timeline through 2026 and 2027.',
    keywords: 'UAE e-invoicing, PINT AE, FTA e-invoicing mandate, Peppol UAE, Accredited Service Provider UAE, e-invoicing timeline UAE, UAE VAT e-invoice',
    type: 'article',
    schemas: h => [SEO.organizationSchema(), crumb(['e-Invoicing', 'e-invoicing']), SEO.faqSchema(faqsFrom(h))],
  },
  {
    file: 'contact.html',
    url: 'contact',
    title: 'Contact & Demo | Invoice Software UAE, Abu Dhabi',
    desc: 'Book a demo, ask about FTA e-invoicing readiness, or get help migrating your data. Our office is in Abu Dhabi and support runs Sunday to Thursday on UAE hours.',
    keywords: 'contact invoice software UAE, invoicing software demo UAE, e-invoicing consultation UAE, invoice software support Abu Dhabi',
    schemas: h => [
      SEO.organizationSchema(),
      crumb(['Contact', 'contact']),
      { '@type': 'ContactPage', name: 'Contact InvoiceSoftware.ae', url: SEO.abs('contact'), about: { '@id': SEO.ORG_ID } },
      SEO.faqSchema(faqsFrom(h)),
    ],
  },
];

/* Tags seo.js now owns. Removed from a page before the block is inserted, so
   nothing is declared twice. */
const STRIP = [
  /^\s*<title>[\s\S]*?<\/title>\s*$/,
  /^\s*<meta name="description"[^>]*>\s*$/,
  /^\s*<link rel="canonical"[^>]*>\s*$/,
  /^\s*<meta name="theme-color"[^>]*>\s*$/,
  /^\s*<meta property="og:[^"]*"[^>]*>\s*$/,
  /^\s*<meta name="twitter:[^"]*"[^>]*>\s*$/,
  /^\s*<link rel="icon"[^>]*>\s*$/,
];

let changed = 0;
for (const p of PAGES) {
  const abs = path.join(ROOT, p.file);
  let html = fs.readFileSync(abs, 'utf8');
  const original = html;

  const block = SEO.head({
    url: p.url,
    title: p.title,
    desc: p.desc,
    keywords: p.keywords,
    type: p.type || 'website',
    schemas: p.schemas(html).filter(Boolean),
  });

  if (html.includes('<!-- SEO:START -->')) {
    html = html.replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, block);
  } else {
    // Drop the page's original hand-written SEO tags and its old JSON-LD.
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, '');
    html = html.split('\n').filter(line => !STRIP.some(rx => rx.test(line))).join('\n');
    // Insert after the viewport meta, which every core page has.
    html = html.replace(
      /(<meta name="viewport"[^>]*>)/,
      `$1\n${block}`
    );
    // Tidy the blank run the strip can leave behind.
    html = html.replace(/\n{3,}/g, '\n\n');
  }

  // Match the location pages and the hreflang we declare: en-AE, not bare en.
  html = html.replace(/<html lang="en"([ >])/, '<html lang="en-AE"$1');

  if (html !== original) { fs.writeFileSync(abs, html, 'utf8'); changed++; }

  const n = (p.schemas(original).filter(Boolean)).length;
  const faqs = faqsFrom(original).length;
  console.log(`  ${p.file.padEnd(20)} ${n} schema node(s)${faqs ? `, ${faqs} FAQ Q&A parsed from the page` : ''}`);
}

console.log(`seo-core: updated ${changed} of ${PAGES.length} core page(s)`);
