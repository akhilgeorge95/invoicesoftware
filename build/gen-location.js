/* build/gen-location.js — renders every location landing page from
   data-locations.js.

   Paths are derived from parentSlug alone:
     hub  (no parentSlug) -> <slug>.html            served at /<slug>
     city (has parentSlug)-> <parent>/<slug>.html   served at /<parent>/<slug>

   Both forms were verified against a real Cloudflare Pages preview deployment:
   /dubai serves dubai.html with no redirect, /dubai/ 308s to /dubai, and
   /dubai/business-bay serves dubai/business-bay.html. The canonical each page
   declares is therefore exactly the URL that serves it. */

'use strict';

const fs = require('fs');
const path = require('path');
const SEO = require('./seo');
const CHROME = require('./chrome');
const LOCATIONS = require('./data-locations');

const ROOT = path.join(__dirname, '..');
const esc = SEO.enc;

/* ---------------------------------------------------------------- indexes -- */
const bySlug = {};
const byParent = {};
for (const l of LOCATIONS) {
  bySlug[l.slug] = l;
  if (l.parentSlug) (byParent[l.parentSlug] = byParent[l.parentSlug] || []).push(l);
}

const fileOf = d => (d.parentSlug ? `${d.parentSlug}/${d.slug}.html` : `${d.slug}.html`);
const urlOf  = d => (d.parentSlug ? `${d.parentSlug}/${d.slug}` : d.slug);

const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
const PIN  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>';
const ARROW = '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

/* The three product cards every location page carries. Defined here rather than
   in the data file so a place entry only has to hold what is local to it. */
const CORE = [
  {
    href: '/e-invoicing',
    title: 'Ready for FTA e-invoicing',
    copy: 'Structured PINT AE output and Peppol exchange through an Accredited Service Provider, so the mandate becomes a setting rather than a migration.',
  },
  {
    href: '/features',
    title: '5% VAT applied automatically',
    copy: 'Standard, zero-rated, exempt and out-of-scope treatments per line, your TRN on every tax invoice, and a VAT summary that matches what your accountant files.',
  },
  {
    href: '/pricing',
    title: 'Priced in dirhams',
    copy: 'Free for up to five clients, then AED 49 a month. No percentage of what you invoice, and no gateway markup — you connect your own.',
  },
];

/* ------------------------------------------------------------------- page -- */
function page(d) {
  const geo = SEO.PLACES[d.slug];
  if (!geo) throw new Error(`No SEO.PLACES entry for slug "${d.slug}"`);

  const url = urlOf(d);
  const parent = d.parentSlug ? bySlug[d.parentSlug] : null;
  const children = byParent[d.slug] || [];
  const siblings = d.parentSlug ? (byParent[d.parentSlug] || []).filter(x => x.slug !== d.slug) : [];

  /* ---- breadcrumbs: schema trail and visible trail from the same source -- */
  const trail = [{ name: 'Home', url: 'index.html' }, { name: 'Locations', url: 'locations.html' }];
  if (parent) trail.push({ name: parent.city, url: urlOf(parent) });
  trail.push({ name: d.city, url });

  const crumbs = trail.map((c, i) => {
    const href = c.url === 'index.html' ? '/' : '/' + c.url.replace(/\.html$/, '');
    return i === trail.length - 1
      ? `<span aria-current="page">${esc(c.name)}</span>`
      : `<a href="${href}">${esc(c.name)}</a>`;
  }).join('<i aria-hidden="true">/</i>');

  const seoHead = SEO.head({
    url,
    title: d.title,
    desc: d.description,
    keywords: d.keywords,
    type: 'website',
    geo,
    schemas: [
      SEO.organizationSchema(),
      SEO.breadcrumbSchema(trail),
      SEO.serviceAreaSchema({
        city: d.city,
        url,
        name: `Invoice software in ${d.city}`,
        desc: d.description,
        containedIn: geo.containedIn,
      }),
      SEO.faqSchema(d.faqs),
    ],
  });

  /* ---- cards: this place's own, then the shared money-page three ---------- */
  const allCards = (d.cards || []).concat(CORE);
  const cardsHtml = allCards.map(c => `      <a class="card card--spot loc-card reveal" href="${c.href}">
        <h3 class="h3">${esc(c.title)}</h3>
        <p>${esc(c.copy)}</p>
        <span class="link-arrow">Read more ${ARROW}</span>
      </a>`).join('\n');

  /* ---- hub gets a child grid; a city gets its siblings plus an up-link --- */
  let relatedBlock = '';
  if (children.length) {
    relatedBlock = `
<section class="section section--alt">
  <div class="container container--wide">
    <div class="section-head reveal">
      <span class="eyebrow">Cities &amp; areas</span>
      <h2 class="h2">Invoicing across <em class="serif grad-text">${esc(d.city)}</em></h2>
      <p class="lead center">Pages for the commercial centres we see the most billing activity from.</p>
    </div>
    <div class="loc-grid" data-reveal-group="60">
${children.map(c => `      <a class="loc-tile reveal" href="/${urlOf(c)}">
        <span class="loc-tile__pin" aria-hidden="true">${PIN}</span>
        <span>${esc(c.city)}</span>
      </a>`).join('\n')}
    </div>
  </div>
</section>`;
  } else if (parent && siblings.length) {
    relatedBlock = `
<section class="section section--alt">
  <div class="container container--wide">
    <div class="section-head reveal">
      <span class="eyebrow">Also in ${esc(parent.city)}</span>
      <h2 class="h2">Other areas we cover</h2>
    </div>
    <div class="loc-grid" data-reveal-group="60">
${siblings.map(c => `      <a class="loc-tile reveal" href="/${urlOf(c)}">
        <span class="loc-tile__pin" aria-hidden="true">${PIN}</span>
        <span>${esc(c.city)}</span>
      </a>`).join('\n')}
    </div>
    <p class="center small faint" style="margin-top:24px">
      <a class="link-arrow" href="/${urlOf(parent)}">See invoice software across all of ${esc(parent.city)} ${ARROW}</a>
    </p>
  </div>
</section>`;
  }

  return `<!DOCTYPE html>
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
    <nav class="breadcrumb" aria-label="Breadcrumb">${crumbs}</nav>
    <h1 class="h1" data-split>${esc(d.h1)}</h1>
    <p class="lead">${esc(d.sub)}</p>
    <div class="hero__cta" style="justify-content:center">
      <a class="btn btn--primary btn--lg" href="/contact" data-magnetic>
        Create a free account ${ARROW}
      </a>
      <a class="btn btn--ghost btn--lg" href="/pricing">See pricing</a>
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    <div class="stats reveal">
      <div class="stat">
        <div class="stat__num"><span data-count="11">0</span></div>
        <div class="stat__label">Invoice designs, fully brandable</div>
      </div>
      <div class="stat">
        <div class="stat__num"><span data-count="40" data-suffix="+">0</span></div>
        <div class="stat__label">Payment gateways supported</div>
      </div>
      <div class="stat">
        <div class="stat__num"><span data-count="5" data-suffix="%">0</span></div>
        <div class="stat__label">UAE VAT applied automatically</div>
      </div>
      <div class="stat">
        <div class="stat__num">AED <span data-count="0">0</span></div>
        <div class="stat__label">Free plan, forever</div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container container--wide">
    <div class="split">
      <div class="split__copy reveal reveal--left">
        <span class="tag tag--brand">${esc(d.city)}</span>
        <h2 class="h2">${esc(d.introHead)}</h2>
${d.intro.map(p => `        <p class="lead">${esc(p)}</p>`).join('\n')}
        <a class="btn btn--ghost" href="/features">See the full feature list</a>
      </div>
      <div class="split__media reveal reveal--right">
        <div class="card" style="padding:30px">
          <span class="tag tag--gold" style="margin-bottom:20px">What you get</span>
          <ul class="check-list">
            <li><span class="tick" aria-hidden="true">${TICK}</span>VAT-compliant tax invoices in English or Arabic</li>
            <li><span class="tick" aria-hidden="true">${TICK}</span>Online payments through your own gateway</li>
            <li><span class="tick" aria-hidden="true">${TICK}</span>Recurring invoices and automatic reminders</li>
            <li><span class="tick" aria-hidden="true">${TICK}</span>Expenses, vendors and purchase orders</li>
            <li><span class="tick" aria-hidden="true">${TICK}</span>Time tracking and project billing</li>
            <li><span class="tick" aria-hidden="true">${TICK}</span>A branded portal for every client</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="container container--wide">
    <div class="section-head reveal">
      <span class="eyebrow">Why it fits</span>
      <h2 class="h2">Built for how <em class="serif grad-text">${esc(d.city)}</em> businesses bill</h2>
    </div>
    <div class="grid grid-3" data-reveal-group="80">
${cardsHtml}
    </div>
  </div>
</section>

<section class="section">
  <div class="container container--wide">
    <div class="section-head reveal">
      <span class="eyebrow">Coverage</span>
      <h2 class="h2">${esc(d.areasHead)}</h2>
    </div>
    <div class="chip-row reveal">
${d.areas.map(a => `      <span class="tag">${esc(a)}</span>`).join('\n')}
    </div>
    <div class="note-box reveal" style="margin-top:30px">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>
      <p>${esc(d.areasNote)}</p>
    </div>
  </div>
</section>
${relatedBlock}

<section class="section${relatedBlock ? '' : ' section--alt'}">
  <div class="container container--narrow">
    <div class="section-head reveal">
      <span class="eyebrow">FAQ</span>
      <h2 class="h2">Invoice software in ${esc(d.city)} — common questions</h2>
    </div>
    <div class="accordion reveal">
${d.faqs.map((f, i) => `      <div class="acc-item${i === 0 ? ' is-open' : ''}">
        <button class="acc-btn" type="button" aria-expanded="${i === 0}">
          ${esc(f.q)}
          <span class="acc-btn__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span>
        </button>
        <div class="acc-panel"><div><p>${esc(f.a)}</p></div></div>
      </div>`).join('\n')}
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
        <h2 class="h2">${esc(d.ctaHead)}</h2>
        <p>${esc(d.ctaSub)}</p>
        <div class="hero__cta" style="justify-content:center">
          <a class="btn btn--primary btn--lg" href="/contact" data-magnetic>Create a free account ${ARROW}</a>
          <a class="btn btn--ghost btn--lg" href="/e-invoicing">Read the e-invoicing guide</a>
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
}

/* ------------------------------------------------------------------ write -- */
let written = 0;
for (const d of LOCATIONS) {
  const rel = fileOf(d);
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, page(d), 'utf8');
  written++;
}
console.log(`gen-location: wrote ${written} page(s)`);
for (const d of LOCATIONS) console.log(`  /${urlOf(d)}  <- ${fileOf(d)}`);
