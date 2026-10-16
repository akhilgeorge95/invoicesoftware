/* build/seo.js — single source of truth for company facts, geo targets, the
   <head> SEO block and every schema.org node this site emits.
   Mirrors the architecture of the rfidsolutions.ae generator.

   Change SITE.origin and rebuild to re-point every canonical, og:url,
   hreflang, schema @id, sitemap <loc> and robots.txt at a new host. */

'use strict';

const SITE = {
  // Canonical host is www. The apex serves the same content and is consolidated
  // onto www by the absolute canonical each page carries (a zone-level Redirect
  // Rule would make it a true 301 — see README).
  origin: 'https://www.invoicesoftware.ae',

  name: 'InvoiceSoftware.ae',
  legal: 'Brocode Solutions LLC',
  product: 'InvoiceSoftware.ae',

  phone: '+971507612213',
  phoneDisplay: '+971 50 761 2213',
  landline: '+97125464108',
  landlineDisplay: '+971 2 546 4108',
  email: 'hello@brocodesolutions.com',

  // The ONE real address. No page may assert a postal address anywhere else —
  // build/verify-location.js fails the build if one appears.
  poBox: '51710',
  street: '103/12, A2Z Business Center, Khaleefa Complex B, TCA',
  city: 'Abu Dhabi',
  regionCode: 'AE-AZ',
  region: 'Abu Dhabi',
  country: 'AE',
  countryName: 'United Arab Emirates',
  lat: 24.4900,
  lng: 54.3800,

  logo: 'assets/img/favicon.svg',
  ogImage: 'assets/img/og.png',
  themeColor: '#07080e',
};

const ORG_ID = `${SITE.origin}/#organization`;

const abs = p => {
  const s = String(p).replace(/^\//, '');
  return s === 'index.html' || s === '' ? `${SITE.origin}/` : `${SITE.origin}/${s}`;
};

/* HTML-escape for attribute values. */
const enc = s => String(s)
  .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Trim to ~158 chars on a word boundary so meta descriptions are not cut
   mid-word by the SERP. */
function clamp(text, n = 158) {
  const s = String(text).replace(/\s+/g, ' ').trim();
  if (s.length <= n) return s;
  return s.slice(0, s.lastIndexOf(' ', n - 1)).replace(/[,;:—-]$/, '') + '…';
}

/* ------------------------------------------------------------------ PLACES --
   One entry per geo target, keyed by the slug used in data-locations.js.

   regionCode — ISO 3166-2 of the emirate the place sits IN. A city inside Abu
                Dhabi emirate (Al Ain, Mussafah) carries AE-AZ, not its own code.
   lat/lng    — approximate centre, used for geo.position and ICBM only. These
                are locality coordinates, never an assertion of an office there.
   office     — true only for the one place we actually have an address.
   containedIn— emirate name, for cities. Nests the Service areaServed as
                City -> AdministrativeArea -> Country.                          */

const AZ = 'Emirate of Abu Dhabi';
const PLACES = {
  // ---- emirate hubs -------------------------------------------------------
  'abu-dhabi':      { regionCode: 'AE-AZ', city: 'Abu Dhabi',     lat: SITE.lat, lng: SITE.lng, office: true },
  'dubai':          { regionCode: 'AE-DU', city: 'Dubai',         lat: 25.2048, lng: 55.2708, office: false },
  'sharjah':        { regionCode: 'AE-SH', city: 'Sharjah',       lat: 25.3463, lng: 55.4209, office: false },
  'ajman':          { regionCode: 'AE-AJ', city: 'Ajman',         lat: 25.4052, lng: 55.5136, office: false },
  'umm-al-quwain':  { regionCode: 'AE-UQ', city: 'Umm Al Quwain', lat: 25.5647, lng: 55.5532, office: false },
  'ras-al-khaimah': { regionCode: 'AE-RK', city: 'Ras Al Khaimah',lat: 25.7895, lng: 55.9432, office: false },
  'fujairah':       { regionCode: 'AE-FU', city: 'Fujairah',      lat: 25.1288, lng: 56.3265, office: false },

  // ---- Abu Dhabi emirate --------------------------------------------------
  'al-ain':         { regionCode: 'AE-AZ', city: 'Al Ain',        lat: 24.2075, lng: 55.7447, office: false, containedIn: AZ },
  'mussafah':       { regionCode: 'AE-AZ', city: 'Mussafah',      lat: 24.3500, lng: 54.5000, office: false, containedIn: AZ },
  'khalifa-city':   { regionCode: 'AE-AZ', city: 'Khalifa City',  lat: 24.4200, lng: 54.5800, office: false, containedIn: AZ },
  'madinat-zayed':  { regionCode: 'AE-AZ', city: 'Madinat Zayed', lat: 23.6500, lng: 53.7000, office: false, containedIn: AZ },
  'ruwais':         { regionCode: 'AE-AZ', city: 'Ruwais',        lat: 24.0900, lng: 52.7300, office: false, containedIn: AZ },

  // ---- Dubai --------------------------------------------------------------
  'business-bay':         { regionCode: 'AE-DU', city: 'Business Bay',         lat: 25.1850, lng: 55.2650, office: false, containedIn: 'Emirate of Dubai' },
  'deira':                { regionCode: 'AE-DU', city: 'Deira',               lat: 25.2700, lng: 55.3100, office: false, containedIn: 'Emirate of Dubai' },
  'bur-dubai':            { regionCode: 'AE-DU', city: 'Bur Dubai',           lat: 25.2600, lng: 55.2970, office: false, containedIn: 'Emirate of Dubai' },
  'jebel-ali':            { regionCode: 'AE-DU', city: 'Jebel Ali',           lat: 25.0100, lng: 55.0600, office: false, containedIn: 'Emirate of Dubai' },
  'al-quoz':              { regionCode: 'AE-DU', city: 'Al Quoz',             lat: 25.1400, lng: 55.2300, office: false, containedIn: 'Emirate of Dubai' },
  'dubai-silicon-oasis':  { regionCode: 'AE-DU', city: 'Dubai Silicon Oasis', lat: 25.1200, lng: 55.3800, office: false, containedIn: 'Emirate of Dubai' },
  'dubai-marina':         { regionCode: 'AE-DU', city: 'Dubai Marina',        lat: 25.0800, lng: 55.1400, office: false, containedIn: 'Emirate of Dubai' },

  // ---- Sharjah ------------------------------------------------------------
  'sharjah-industrial-area': { regionCode: 'AE-SH', city: 'Sharjah Industrial Area', lat: 25.3200, lng: 55.4100, office: false, containedIn: 'Emirate of Sharjah' },
  'muwaileh':                { regionCode: 'AE-SH', city: 'Muwaileh',                lat: 25.2900, lng: 55.4800, office: false, containedIn: 'Emirate of Sharjah' },
  'khor-fakkan':             { regionCode: 'AE-SH', city: 'Khor Fakkan',             lat: 25.3400, lng: 56.3500, office: false, containedIn: 'Emirate of Sharjah' },
  'kalba':                   { regionCode: 'AE-SH', city: 'Kalba',                   lat: 25.0200, lng: 56.3500, office: false, containedIn: 'Emirate of Sharjah' },

  // ---- Ajman --------------------------------------------------------------
  'ajman-industrial-area': { regionCode: 'AE-AJ', city: 'Ajman Industrial Area', lat: 25.3900, lng: 55.4900, office: false, containedIn: 'Emirate of Ajman' },
  'al-jurf':               { regionCode: 'AE-AJ', city: 'Al Jurf',               lat: 25.4200, lng: 55.4700, office: false, containedIn: 'Emirate of Ajman' },

  // ---- Umm Al Quwain ------------------------------------------------------
  'falaj-al-mualla': { regionCode: 'AE-UQ', city: 'Falaj Al Mualla', lat: 25.3200, lng: 55.8900, office: false, containedIn: 'Emirate of Umm Al Quwain' },

  // ---- Ras Al Khaimah -----------------------------------------------------
  'al-nakheel':           { regionCode: 'AE-RK', city: 'Al Nakheel',           lat: 25.7900, lng: 55.9400, office: false, containedIn: 'Emirate of Ras Al Khaimah' },
  'al-jazirah-al-hamra':  { regionCode: 'AE-RK', city: 'Al Jazirah Al Hamra',  lat: 25.6800, lng: 55.7900, office: false, containedIn: 'Emirate of Ras Al Khaimah' },

  // ---- Fujairah -----------------------------------------------------------
  'dibba-al-fujairah': { regionCode: 'AE-FU', city: 'Dibba Al Fujairah', lat: 25.5900, lng: 56.2700, office: false, containedIn: 'Emirate of Fujairah' },
  'qidfa':             { regionCode: 'AE-FU', city: 'Qidfa',             lat: 25.2200, lng: 56.3500, office: false, containedIn: 'Emirate of Fujairah' },
  'masafi':            { regionCode: 'AE-FU', city: 'Masafi',            lat: 25.3000, lng: 56.1600, office: false, containedIn: 'Emirate of Fujairah' },
};

/* ------------------------------------------------------------------ head() --
   Emits the whole SEO block between sentinels. The sentinels are what make
   build/seo-core.js idempotent when it injects this into a hand-written page.

   Does NOT emit charset, viewport, fonts or the stylesheet — each page owns
   those, because they must come before/after this block in a specific order.

   Every URL it emits is absolute or root-absolute, so the same block is valid
   at any folder depth. There is deliberately no assetPrefix parameter. */

function head(o) {
  const canonical = abs(o.url);
  const desc = clamp(o.desc);
  const geo = o.geo || { regionCode: SITE.regionCode, city: SITE.city, lat: SITE.lat, lng: SITE.lng };
  const graph = (o.schemas || []).filter(Boolean);
  const ld = graph.length
    ? `\n<script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)}\n</script>`
    : '';

  return `<!-- SEO:START -->
<title>${enc(o.title)}</title>
<meta name="description" content="${enc(desc)}">
${o.keywords ? `<meta name="keywords" content="${enc(o.keywords)}">\n` : ''}<link rel="canonical" href="${canonical}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="author" content="${enc(SITE.legal)}">
<meta name="publisher" content="${enc(SITE.legal)}">
<!-- Geo targeting: ${enc(geo.city)}, United Arab Emirates -->
<meta name="geo.region" content="${geo.regionCode}">
<meta name="geo.placename" content="${enc(geo.city)}">
<meta name="geo.position" content="${geo.lat};${geo.lng}">
<meta name="ICBM" content="${geo.lat}, ${geo.lng}">
<link rel="alternate" hreflang="en-ae" href="${canonical}">
<link rel="alternate" hreflang="x-default" href="${canonical}">
<meta property="og:type" content="${o.type || 'website'}">
<meta property="og:site_name" content="${enc(SITE.name)}">
<meta property="og:locale" content="en_AE">
<meta property="og:title" content="${enc(o.title)}">
<meta property="og:description" content="${enc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${abs(SITE.ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${enc(SITE.name)} — invoicing, payments and expenses for UAE businesses">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${enc(o.title)}">
<meta name="twitter:description" content="${enc(desc)}">
<meta name="twitter:image" content="${abs(SITE.ogImage)}">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="${SITE.themeColor}">${ld}
<!-- SEO:END -->`;
}

/* ----------------------------------------------------------------- schemas --
   All schemas on a page go into ONE @graph. organizationSchema is the only
   node anywhere that carries a postal address; everything else references it
   by @id, so a location page can never imply a second office. */

function organizationSchema() {
  return {
    '@type': ['Organization', 'LocalBusiness'],
    '@id': ORG_ID,
    name: SITE.name,
    legalName: SITE.legal,
    url: SITE.origin + '/',
    logo: abs(SITE.logo),
    image: abs(SITE.ogImage),
    email: SITE.email,
    telephone: SITE.phone,
    description: 'Invoicing, online payments, expenses, time tracking and projects for UAE businesses. VAT-ready and built for FTA e-invoicing.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.street,
      postOfficeBoxNumber: SITE.poBox,
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      addressCountry: SITE.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: SITE.lat, longitude: SITE.lng },
    areaServed: [
      { '@type': 'Country', name: SITE.countryName },
      { '@type': 'City', name: SITE.city },
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      opens: '09:00',
      closes: '18:00',
    },
    contactPoint: [
      { '@type': 'ContactPoint', telephone: SITE.phone, contactType: 'sales', availableLanguage: ['en', 'ar'] },
      { '@type': 'ContactPoint', telephone: SITE.landline, contactType: 'customer service', availableLanguage: ['en', 'ar'] },
    ],
  };
}

/* The location-page workhorse. areaServed nests City -> AdministrativeArea ->
   Country when containedIn is given, else City -> Country. provider is an @id
   reference, NOT a second address-bearing node. */
function serviceAreaSchema({ city, url, name, desc, containedIn }) {
  const country = { '@type': 'Country', name: SITE.countryName };
  const areaServed = containedIn
    ? { '@type': 'City', name: city, containedInPlace: { '@type': 'AdministrativeArea', name: containedIn, containedInPlace: country } }
    : { '@type': 'City', name: city, containedInPlace: country };

  return {
    '@type': 'Service',
    name,
    description: clamp(desc, 300),
    url: abs(url),
    serviceType: 'Invoicing, VAT compliance and online payment software',
    provider: { '@id': ORG_ID },
    areaServed,
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `${SITE.origin}/contact`,
      servicePhone: SITE.phone,
      availableLanguage: ['en', 'ar'],
    },
  };
}

function faqSchema(pairs) {
  if (!pairs || !pairs.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: pairs.map(p => ({
      '@type': 'Question',
      name: p.q,
      acceptedAnswer: { '@type': 'Answer', text: p.a },
    })),
  };
}

function breadcrumbSchema(trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.url),
    })),
  };
}

function softwareAppSchema() {
  return {
    '@type': 'SoftwareApplication',
    name: SITE.product,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS, Android, Windows, macOS',
    url: SITE.origin + '/',
    publisher: { '@id': ORG_ID },
    description: 'Invoicing, online payments, expenses, time-tracking and project management for UAE businesses. VAT-ready and built for FTA e-invoicing.',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'AED',
      lowPrice: '0',
      highPrice: '1099',
      offerCount: '4',
    },
  };
}

function webSiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE.origin}/#website`,
    url: SITE.origin + '/',
    name: SITE.name,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en-AE',
  };
}

module.exports = {
  SITE, PLACES, ORG_ID,
  abs, enc, clamp, head,
  organizationSchema, serviceAreaSchema, faqSchema, breadcrumbSchema,
  softwareAppSchema, webSiteSchema,
};
