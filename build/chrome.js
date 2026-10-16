/* build/chrome.js — the shared header, mobile menu and footer.

   Every link is ROOT-ABSOLUTE (/features, /assets/...), so the same markup
   works at any folder depth. That is why there is no `px` path-prefix
   mechanism here, unlike the rfidsolutions.ae generator which used relative
   paths and had to thread a prefix through every href.

   This markup must stay byte-identical to the five hand-written core pages,
   or generated pages will drift visually from them. */

'use strict';

const SEO = require('./seo');

/* The seven emirate hubs, in the order they appear in the footer and on
   locations.html. Source of truth for nav/footer location links. */
const EMIRATES = [
  { slug: 'abu-dhabi',      city: 'Abu Dhabi' },
  { slug: 'dubai',          city: 'Dubai' },
  { slug: 'sharjah',        city: 'Sharjah' },
  { slug: 'ajman',          city: 'Ajman' },
  { slug: 'umm-al-quwain',  city: 'Umm Al Quwain' },
  { slug: 'ras-al-khaimah', city: 'Ras Al Khaimah' },
  { slug: 'fujairah',       city: 'Fujairah' },
];

const BRAND_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <path d="M14 2v6h6M9 13h6M9 17h4"/>
        </svg>`;

const NAV = [
  { href: '/',            label: 'Home' },
  { href: '/features',    label: 'Features' },
  { href: '/pricing',     label: 'Pricing' },
  { href: '/e-invoicing', label: 'e-Invoicing' },
  { href: '/contact',     label: 'Contact' },
];

/* `active` is the href of the current page, or null for pages that are not in
   the nav (individual location pages mark /locations active instead). */
function navOnly(active) {
  const links = NAV.map(n =>
    `      <a class="nav__link${n.href === active ? ' is-active' : ''}" href="${n.href}">${n.label}</a>`
  ).join('\n');

  return `<header class="nav">
  <div class="container container--wide nav__inner">
    <a class="brand" href="/" aria-label="InvoiceSoftware.ae home">
      <span class="brand__mark" aria-hidden="true">
        ${BRAND_SVG}
      </span>
      <span class="brand__text">InvoiceSoftware<span class="dot">.ae</span></span>
    </a>

    <nav class="nav__links" aria-label="Primary">
${links}
    </nav>

    <div class="nav__actions">
      <button class="theme-toggle" data-theme-toggle type="button" aria-label="Toggle colour theme">
        <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
        </svg>
        <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
        </svg>
      </button>
      <a class="btn btn--ghost btn--sm" href="/contact">Sign in</a>
      <a class="btn btn--primary btn--sm" href="/pricing">
        Start free
        <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>
      <button class="nav__burger" type="button" aria-expanded="false" aria-label="Open menu" aria-controls="mobile-menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>`;
}

function mobileMenu() {
  return `<div class="mobile-menu" id="mobile-menu">
${NAV.map(n => `  <a href="${n.href}">${n.label}</a>`).join('\n')}
  <a class="btn btn--primary btn--lg" href="/pricing">Start free</a>
</div>`;
}

/* Generators want both blocks together; sync-chrome.js replaces them
   separately inside the hand-written core pages. */
function header(active) {
  return navOnly(active) + '\n\n' + mobileMenu();
}

function footer() {
  const emirateLinks = EMIRATES
    .map(e => `          <a href="/${e.slug}">${e.city}</a>`)
    .join('\n');

  return `<footer class="footer">
  <div class="container container--wide">
    <div class="footer__grid">
      <div class="footer__about">
        <a class="brand" href="/">
          <span class="brand__mark" aria-hidden="true">
            ${BRAND_SVG}
          </span>
          <span class="brand__text">InvoiceSoftware<span class="dot">.ae</span></span>
        </a>
        <p class="small muted">
          Invoicing, payments and expense software for UAE freelancers and small businesses.
          VAT-ready, and built for the FTA e-invoicing mandate.
        </p>
        <div class="footer__contact">
          <a href="mailto:${SEO.SITE.email}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>
            ${SEO.SITE.email}
          </a>
          <a href="tel:${SEO.SITE.phone}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.4 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>
            ${SEO.SITE.phoneDisplay}
          </a>
        </div>
        <div class="socials">
          <a href="/contact" aria-label="X"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7 8 8.2 12h-6.4l-5-7.3-5.8 7.3H2.9l7.5-8.6L2.5 2H9l4.6 6.7zm-1.1 18h1.8L7.3 3.9H5.4z"/></svg></a>
          <a href="/contact" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.5 8.5h4V24h-4zM8.5 8.5h3.8v2.1h.06c.53-1 1.83-2.1 3.77-2.1 4.03 0 4.77 2.6 4.77 6V24h-4v-6.8c0-1.6-.03-3.7-2.25-3.7-2.26 0-2.6 1.76-2.6 3.58V24h-4z"/></svg></a>
          <a href="mailto:${SEO.SITE.email}" aria-label="Email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg></a>
        </div>
      </div>

      <div>
        <h4>Product</h4>
        <div class="footer__links">
          <a href="/features">Features</a>
          <a href="/pricing">Pricing</a>
          <a href="/#features">How it works</a>
          <a href="/e-invoicing">e-Invoicing</a>
          <a href="/features#templates">Invoice templates</a>
          <a href="/features#apps">Mobile &amp; desktop apps</a>
        </div>
      </div>

      <div>
        <h4>Emirates</h4>
        <div class="footer__links">
${emirateLinks}
        </div>
      </div>

      <div>
        <h4>Resources</h4>
        <div class="footer__links">
          <a href="/e-invoicing">UAE VAT guide</a>
          <a href="/e-invoicing">PINT AE explained</a>
          <a href="/locations">All locations</a>
          <a href="/contact">Documentation</a>
          <a href="/contact">API reference</a>
          <a href="/contact">Support</a>
        </div>
      </div>

      <div>
        <h4>Company</h4>
        <div class="footer__links">
          <a href="/contact">About us</a>
          <a href="/contact">Contact</a>
          <a href="/contact">Careers</a>
          <a href="/contact">Terms of service</a>
          <a href="/contact">Privacy policy</a>
          <a href="/contact">Security</a>
        </div>
      </div>
    </div>

    <div class="footer__bottom">
      <span>© <span data-year>2026</span> InvoiceSoftware.ae — All rights reserved.</span>
      <span>Made in the UAE 🇦🇪 · Prices in AED, exclusive of VAT</span>
      <a class="powered-by" href="https://brocodesolutions.com" target="_blank" rel="noopener noreferrer">
        <span class="powered-by__label">Powered by</span>
        <span class="powered-by__name">Brocode Solutions</span>
      </a>
    </div>
  </div>
</footer>`;
}

module.exports = { header, navOnly, mobileMenu, footer, EMIRATES, NAV };
