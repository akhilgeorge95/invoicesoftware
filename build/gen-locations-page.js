/* build/gen-locations-page.js — renders locations.html, the crawlable index of
   every location page.

   This page is why the location pages are not orphans. A <select> dropdown is
   not a link: Googlebot neither picks options nor submits forms, so a finder
   widget alone would leave every location page carrying no internal PageRank.
   An always-visible list of real <a href>s is what makes them reachable, and
   locations.html is linked from the nav and footer of every page. */

'use strict';

const fs = require('fs');
const path = require('path');
const SEO = require('./seo');
const GITDATE = require('./gitdate');
const CHROME = require('./chrome');
const LOCATIONS = require('./data-locations');

const ROOT = path.join(__dirname, '..');
const esc = SEO.enc;
const urlOf = d => (d.parentSlug ? `${d.parentSlug}/${d.slug}` : d.slug);

const hubs = LOCATIONS.filter(l => !l.parentSlug);
const childrenOf = slug => LOCATIONS.filter(l => l.parentSlug === slug);

const PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>';
const ARROW = '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

const total = LOCATIONS.length;

const groups = hubs.map(h => {
  const kids = childrenOf(h.slug);
  const tiles = [h].concat(kids).map(d => `        <a class="loc-tile reveal" href="/${urlOf(d)}">
          <span class="loc-tile__pin" aria-hidden="true">${PIN}</span>
          <span>${esc(d.city)}${d.slug === h.slug ? ' <span class="xs faint">(emirate)</span>' : ''}</span>
        </a>`).join('\n');

  return `      <div class="loc-group reveal">
        <div class="loc-group__head">
          <h2>${esc(h.city)}</h2>
          <span class="count">${kids.length ? `${kids.length + 1} pages` : '1 page'}</span>
        </div>
        <div class="loc-grid" data-reveal-group="50">
${tiles}
        </div>
      </div>`;
}).join('\n');

const trail = [{ name: 'Home', url: 'index.html' }, { name: 'Locations', url: 'locations.html' }];

const seoHead = SEO.head({
  url: 'locations',
  title: 'Invoice Software Across the UAE | All 7 Emirates',
  desc: `VAT-compliant invoicing software for businesses across all seven emirates — Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah and Fujairah. ${total} location pages.`,
  keywords: 'invoice software UAE, invoicing software emirates, VAT invoice software UAE, billing software UAE, e-invoicing UAE, invoice software Abu Dhabi Dubai Sharjah',
  type: 'website',
  schemas: [
    SEO.organizationSchema(),
    SEO.breadcrumbSchema(trail),
    SEO.webPageSchema({
      url: 'locations',
      title: 'Invoice Software Across the UAE | All 7 Emirates',
      desc: 'VAT-compliant invoicing software for businesses across all seven emirates.',
      modified: GITDATE.index().latest('build/data-locations.js', 'build/gen-locations-page.js'),
    }),
    {
      '@type': 'CollectionPage',
      name: 'Invoice software across the UAE',
      url: SEO.abs('locations'),
      description: 'Location pages for invoice software across every emirate of the United Arab Emirates.',
      isPartOf: { '@id': `${SEO.SITE.origin}/#website` },
      publisher: { '@id': SEO.ORG_ID },
    },
    SEO.webSiteSchema(),
  ],
});

const html = `<!DOCTYPE html>
<html lang="en-AE" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${seoHead}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&amp;family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/styles.css">

<script>
(function () {
  try {
    var t = localStorage.getItem("is-theme");
    if (!t) t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
  } catch (e) { document.documentElement.setAttribute("data-theme", "dark"); }
})();
</script>
</head>
<body>

<a class="skip-link" href="#main">Skip to content</a>
<div class="progress-bar" aria-hidden="true"></div>

${CHROME.header('/locations')}

<main id="main">

<section class="page-hero">
  <div class="ambient" aria-hidden="true">
    <span class="aurora aurora--1"></span>
    <span class="aurora aurora--2"></span>
    <span class="grid-overlay"></span>
    <span class="noise"></span>
  </div>
  <div class="container page-hero__inner hero-in">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Home</a><i aria-hidden="true">/</i><span aria-current="page">Locations</span>
    </nav>
    <h1 class="h1" data-split>Invoice software across the <em class="serif grad-text">UAE</em></h1>
    <p class="lead">
      The same VAT-ready platform, wherever you bill from. Pick your emirate or area for
      the free zones, licensing route and billing patterns that apply there.
    </p>
  </div>
</section>

<section class="section">
  <div class="container container--wide">
${groups}

    <div class="note-box reveal" style="margin-top:clamp(36px,5vw,60px)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>
      <p>
        <strong>One office, nationwide service.</strong> Brocode Solutions works from a single
        office in Abu Dhabi — Building # 146, Wadi Al Kisayfah St., Al Zahiyah. The platform
        is cloud software used by businesses in every emirate; these pages describe the markets
        we serve, not branch offices.
      </p>
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    <div class="cta-band reveal reveal--scale">
      <div class="ambient" aria-hidden="true">
        <span class="aurora aurora--1"></span>
        <span class="aurora aurora--2"></span>
      </div>
      <div class="cta-band__inner">
        <span class="tag tag--gold">Free plan, no card</span>
        <h2 class="h2">Invoice from anywhere in the <em class="serif">Emirates</em></h2>
        <p>Create a free account and send your first VAT-compliant invoice in the next ten minutes.</p>
        <div class="hero__cta" style="justify-content:center">
          <a class="btn btn--primary btn--lg" href="/contact" data-magnetic>Create a free account ${ARROW}</a>
          <a class="btn btn--ghost btn--lg" href="/pricing">See pricing</a>
        </div>
      </div>
    </div>
  </div>
</section>

</main>

${CHROME.footer()}

<script src="/assets/js/main.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, 'locations.html'), html, 'utf8');
console.log(`gen-locations-page: wrote locations.html — ${hubs.length} emirate group(s), ${total} page(s) linked`);
