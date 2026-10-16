/* build/gen-404.js — renders 404.html.

   Without this file Cloudflare Pages answers every unmatched path with the
   homepage and an HTTP 200. Verified before this was added: /no-such-page,
   /dubai/fake-city and /abc/def/ghi all returned 200 carrying the full
   homepage. That is a soft 404, and at scale it invites Google to index an
   unbounded set of junk URLs all showing identical content — the duplicate
   signal that does real ranking damage.

   With 404.html present, Pages serves it with a genuine 404 status. The page
   is noindex, follow: it should never be indexed itself, but the links on it
   should still pass equity to the real pages. */

'use strict';

const fs = require('fs');
const path = require('path');
const SEO = require('./seo');
const CHROME = require('./chrome');

const ROOT = path.join(__dirname, '..');
const ARROW = '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

const seoHead = SEO.head({
  url: '404',
  title: 'Page not found | InvoiceSoftware.ae',
  desc: 'That page does not exist. Find invoicing features, pricing in AED, the UAE e-invoicing guide, or invoice software for your emirate.',
  noindex: true,
  schemas: [SEO.organizationSchema()],
});

const LINKS = [
  ['/', 'Home', 'Invoicing, payments and expenses for UAE businesses'],
  ['/features', 'Features', 'Everything the platform does, in detail'],
  ['/pricing', 'Pricing', 'Free plan, then AED 49 a month'],
  ['/e-invoicing', 'e-Invoicing', 'The FTA mandate, explained plainly'],
  ['/locations', 'Locations', 'Invoice software for every emirate'],
  ['/contact', 'Contact', 'Book a demo or ask us a question'],
];

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

${CHROME.navOnly(null)}

${CHROME.mobileMenu()}

<main id="main">

<section class="page-hero">
  <div class="ambient" aria-hidden="true">
    <span class="aurora aurora--1"></span>
    <span class="aurora aurora--2"></span>
    <span class="grid-overlay"></span>
    <span class="noise"></span>
  </div>
  <div class="container page-hero__inner hero-in">
    <span class="eyebrow">Error 404</span>
    <h1 class="h1" data-split>This page doesn't <em class="serif grad-text">exist</em></h1>
    <p class="lead">
      The link may be out of date, or the address mistyped. Everything on the site is
      one click away below.
    </p>
  </div>
</section>

<section class="section section--tight">
  <div class="container container--wide">
    <div class="grid grid-3" data-reveal-group="70">
${LINKS.map(([href, title, copy]) => `      <a class="card card--spot loc-card reveal" href="${href}">
        <h2 class="h3">${title}</h2>
        <p>${copy}</p>
        <span class="link-arrow">Go ${ARROW}</span>
      </a>`).join('\n')}
    </div>
  </div>
</section>

</main>

${CHROME.footer()}

<script src="/assets/js/main.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, '404.html'), html, 'utf8');
console.log('gen-404: wrote 404.html (noindex, follow)');
