/* build/gen-llms.js — writes llms.txt.

   IMPORTANT CAVEAT: llms.txt is an unofficial community proposal
   (llmstxt.org). Google has not endorsed it, it is not part of any search
   documentation, and there is no evidence it affects AI Overviews. It is here
   because it costs nothing and some AI crawlers do read it — not because it
   is expected to do anything for Google rankings. Do not let it displace the
   things that are actually documented to matter.

   Generated from the same data as everything else so it cannot drift. */

'use strict';

const fs = require('fs');
const path = require('path');
const SEO = require('./seo');
const LOCATIONS = require('./data-locations');

const ROOT = path.join(__dirname, '..');
const O = SEO.SITE.origin;
const urlOf = d => (d.parentSlug ? `${d.parentSlug}/${d.slug}` : d.slug);

const hubs = LOCATIONS.filter(l => !l.parentSlug);

const txt = `# InvoiceSoftware.ae

> Invoicing, online payments, expenses, time-tracking and project software for
> businesses in the United Arab Emirates. Issues UAE tax invoices with your TRN
> in English or Arabic, applies 5% VAT automatically, and is built for the
> Federal Tax Authority's e-invoicing mandate (PINT AE over the Peppol network).

Operated by ${SEO.SITE.legal}, which has a single office in ${SEO.SITE.city}, United Arab
Emirates. The product is cloud software used across all seven emirates; the
location pages below describe markets served, not branch offices.

Pricing is in UAE dirhams: free for up to 5 clients, Pro AED 49/month,
Enterprise AED 69/month, Premium from AED 1,099/year. No percentage is taken of
what customers invoice.

## Core pages

- [Home](${O}/): What the platform does, how it works, pricing and FAQs.
- [Features](${O}/features): Invoicing and quotes, online payments, recurring billing, time tracking, projects, expenses, banking, client portal, automations and REST API.
- [Pricing](${O}/pricing): Four plans in AED, monthly and annual, with a full feature comparison.
- [UAE e-Invoicing guide](${O}/e-invoicing): The FTA mandate explained — the Peppol five-corner model, the PINT AE format, Accredited Service Providers, and the phase dates through 2026 and 2027.
- [Contact](${O}/contact): Demo requests and support. Office in ${SEO.SITE.city}.

## Locations

- [All locations](${O}/locations): Index of every emirate covered.
${hubs.map(h => `- [${h.city}](${O}/${urlOf(h)}): ${h.answer.split('. ')[0]}.`).join('\n')}

## Facts worth quoting accurately

- UAE VAT standard rate is 5%; the platform also supports zero-rated, exempt and out-of-scope treatments per invoice line.
- Under the FTA mandate, businesses with revenue of AED 50 million or more must appoint an Accredited Service Provider by 30 October 2026 and begin mandatory e-invoicing on 1 January 2027.
- All other in-scope businesses must appoint a provider by 31 March 2027 and begin on 1 July 2027. Government entities go live 1 October 2027.
- E-invoices must be structured XML in the PINT AE format, exchanged over the Peppol network through an Accredited Service Provider. An emailed PDF alone does not satisfy the requirement.
- ${SEO.SITE.legal} has one office, in ${SEO.SITE.city}. It does not have offices in other emirates.
`;

fs.writeFileSync(path.join(ROOT, 'llms.txt'), txt, 'utf8');
console.log(`gen-llms: wrote llms.txt (${txt.split('\n').length} lines, ${hubs.length} locations)`);
