# InvoiceSoftware.ae

Marketing site for **www.invoicesoftware.ae** — a UAE-localised invoicing, payments and
expenses platform. Feature set and pricing structure are modelled on
[invoiceninja.com](https://invoiceninja.com), then adapted for the UAE: AED pricing,
5% VAT, and FTA e-invoicing (Peppol / PINT AE) as the local differentiator.

Static HTML, CSS and vanilla JS. No build step, no dependencies, no framework.

---

## Files

```
index.html          Home
features.html       Feature deep-dives + manual-vs-automated race
pricing.html        Four AED plans, monthly/annual toggle, comparison table
e-invoicing.html    UAE FTA mandate guide (PINT AE, Peppol, phase timeline)
contact.html        Demo request form and contact details
locations.html      GENERATED — crawlable index of every location page
404.html            GENERATED — real 404, noindex
<emirate>.html      GENERATED — one landing page per emirate

build/              The generator pipeline (NOT published — see Deploy)
assets/css/styles.css   Design system + all components, single file
assets/js/main.js       Interaction & animation engine, no dependencies
assets/img/og.png       1200x630 social card (generated, committed)

robots.txt          GENERATED
sitemap.xml         GENERATED
```

Hand-written pages are safe to edit **except** their `<head>` SEO block
(delimited by `<!-- SEO:START -->` / `<!-- SEO:END -->`) and their nav and
footer — those three regions are overwritten on the next build.

## Build pipeline

Plain CommonJS, no bundler, no dependencies, no `package.json`. Rendered HTML is
committed. **Run in this order** — later scripts operate on what earlier ones emit:

```bash
node build/gen-location.js       # one page per entry in data-locations.js
node build/gen-locations-page.js # locations.html, the crawlable index
node build/gen-404.js            # 404.html
node build/sync-chrome.js        # re-syncs nav + footer into the core pages
node build/seo-core.js           # injects the SEO head block into the core pages
node build/sitemap.js            # sitemap.xml + robots.txt
node build/clean-urls.js         # MUST BE LAST
```

Then the two read-only gates, both of which exit non-zero on failure:

```bash
node build/verify-location.js    # per-page: links, schema, FAQ depth, address honesty
node build/seo-audit.js          # site-wide: 18 checks, duplicates, h1 count, JSON-LD
```

The pipeline is **idempotent** — running it twice changes nothing — so any diff
after a rebuild is a real change rather than noise.

`build/seo.js` is the single source of truth for company facts (`SITE`), geo
targets (`PLACES`), the whole `<head>` block (`head()`) and every schema.org
node. Change `SITE.origin` and rebuild to re-point every canonical, `og:url`,
hreflang, schema `@id` and sitemap `<loc>` at a new host.

`build/gen-og-image.py` regenerates the social card. It needs Pillow and is not
part of the Node pipeline; run it by hand when the card design changes.

### Adding a location

Add an entry to `build/data-locations.js` and a matching `PLACES` entry in
`build/seo.js`, then rebuild. `parentSlug` is the only structural field:

- absent → emirate hub, rendered to `<slug>.html`, served at `/<slug>`
- present → city page, rendered to `<parent>/<slug>.html`, served at `/<parent>/<slug>`

Both URL shapes were verified against a real Pages deployment: `/dubai` serves
`dubai.html` with no redirect, `/dubai/` 308s to `/dubai`, and
`/dubai/business-bay` serves `dubai/business-bay.html`.

**Write the copy by hand.** A set of near-identical "invoice software in
\<city\>" pages reads as doorway pages and gets demoted — the whole point of the
per-entry title, description, intro, cards, districts and FAQs is that they are
genuinely different. `seo-audit.js` makes a duplicate title, description or
canonical a hard error for exactly this reason.

### Two rules the verifier enforces

**One office, in Abu Dhabi.** A location page expresses its city as schema
`areaServed`, never as a postal address — only the `Organization` node carries
an address, and everything else references it by `@id`.
`verify-location.js` fails the build two ways: structurally, if the
Organization locality is not Abu Dhabi, and by raw-text scan, if any
`addressLocality` names the target city. The first FAQ on every non-Abu-Dhabi
page must also answer whether there is a local office.

**Verified names only.** Free-zone names come from the UAE Ministry of Economy
and Tourism's own registrar list. Names that were checked and refuted go in the
entry's `bannedNames`, and the build fails if one appears in the rendered page —
which is what stops a fact true of one emirate leaking into another. Fujairah's
licensing authority is deliberately not named anywhere: sources conflict.

## Run locally

Any static server will do. With Node installed:

```bash
npx serve .          # then open http://localhost:3000
```

Or Python: `python -m http.server 5173`.

Opening `index.html` directly from disk works too, though `file://` blocks nothing here
since there are no fetches.

## Deploy

Hosted on **Cloudflare Pages**, project `invoicesoftware`, in the Brocode
Solutions account — the same arrangement as `rfidsolutions.ae`.

```bash
node build/deploy.js                 # stages public files only, then deploys
node build/deploy.js --branch test   # preview deployment
```

**Do not run `wrangler pages deploy .` directly.** The repo root is the publish
directory, so that uploads `build/` too — verified: `/build/seo.js` was live and
returning real JavaScript. `deploy.js` stages only the public files (20, not 29)
and excludes `build/`, `README.md` and the dotfiles.

Hosts: `www.invoicesoftware.ae` (canonical), `invoicesoftware.ae`, and
`invoicesoftware.pages.dev`.

**Clean URLs are mandatory, not cosmetic.** Cloudflare Pages 308-redirects
`/foo.html` to `/foo`. Every internal link, canonical, `og:url` and sitemap
`<loc>` is therefore extensionless, while files keep their `.html` names on disk.
`clean-urls.js` enforces this and must run last.

**404.html must exist.** Without it Pages answers every unmatched path with the
homepage and an HTTP 200 — a soft 404 that invites Google to index unlimited
junk URLs as duplicates. Verified before the fix: `/no-such-page`,
`/dubai/fake-city` and `/abc/def/ghi` all returned 200 with the homepage.

Asset references are root-absolute (`/assets/...`) so they resolve identically
from `/`, `/dubai` and `/dubai/business-bay`.

### Apex to www

Both apex and `www` are attached to the Pages project, so both serve the site. They are
consolidated onto `www` by the absolute canonical each page carries, not by a redirect.
A `_redirects` file cannot do host-level redirects on Pages — a cross-hostname source
line is silently inert. A real apex→www 301 needs a zone-level Redirect Rule:

- In the `invoicesoftware.ae` zone: **Rules → Redirect Rules → Create rule**
- If: `http.host eq "invoicesoftware.ae"`
- Then: Dynamic redirect, `concat("https://www.invoicesoftware.ae", http.request.uri.path)`,
  status 301, preserve query string

---

## Replace before launch

These are deliberate placeholders, not oversights:

| What | Where | Notes |
|---|---|---|
| **Testimonials** | `index.html`, "What people say" | Attributed to "Sample Customer". Swap in real, attributable quotes — the section is marked with an HTML comment. |
| **~~Office address~~** | — | Done: Mezzanine Floor, Room No. 03, Building # 146, Wadi Al Kisayfah St., Al Zahiyah, Abu Dhabi — in `SITE.street`, so it propagates everywhere on rebuild. |
| **PO Box 51710** | `build/seo.js` `SITE.poBox` | **Unconfirmed.** Carried over from the previous address and not re-supplied with the new one. Confirm it still applies, or delete the `poBox` line — it appears in the LocalBusiness schema on every page. |
| **Support hours** | `contact.html`, next to the phone | "Sun–Thu, 9am–6pm GST", "Under 4 hours", "English & Arabic" were assumed — confirm or change. |
| **`APPS_SCRIPT_URL`** | Pages project env var | **The one thing blocking the contact form.** Everything else is built and deployed. Deploy `build/apps-script/Code.gs` as a Google Apps Script web app and set its `/exec` URL (and `FORWARD_SECRET`) on the Pages project — see "Contact form" below. |
| **Pricing** | `pricing.html`, `index.html` | AED 0 / 49 / 69 / 1,099 derived from Invoice Ninja's USD tiers. Confirm against your actual commercials. |
| **Sign-in / signup links** | nav and CTAs | Currently point at `contact.html`. Repoint at the real app once it exists. |
| **Brocode Solutions URL** | footer bottom bar, all pages | The credit links to `https://brocodesolutions.com`, inferred from the account email domain. Correct it if the site lives elsewhere. |
| **Feature claims** | throughout | Written as product copy for a platform that behaves like Invoice Ninja. Verify each claim matches what you actually ship. |

The **e-invoicing dates are real** — sourced from published FTA / Ministry of Finance
guidance (pilot 1 Jul 2026; Phase 1 ASP by 30 Oct 2026, live 1 Jan 2027; Phase 2 ASP by
31 Mar 2027, live 1 Jul 2027; government entities live 1 Oct 2027). They can change, and
the page carries a "general information, not tax advice" disclaimer. Re-check against the
FTA before each publish.

---

## Design system

All tokens live at the top of `styles.css` under `:root`, with the dark palette under
`:root[data-theme="dark"]`. Change the brand by editing four values:

```css
--brand-1: #6d5efc;   /* indigo-violet  */
--brand-2: #a855f7;   /* purple         */
--brand-3: #22d3ee;   /* cyan           */
--gold:    #f5c451;   /* accent         */
```

**Theme.** Light and dark are both first-class. Each page has a tiny inline `<head>`
script that reads `localStorage["is-theme"]` (falling back to `prefers-color-scheme`) and
stamps `data-theme` before first paint, so there is no flash. The nav toggle flips it.

**Type.** Plus Jakarta Sans for everything, with Instrument Serif italic for the accent
phrases in headlines. Both from Google Fonts.

**Layout.** `.container` / `.container--wide` / `.container--narrow`, `.section`,
`.grid-2|3|4`, and a 6-column `.bento` with `.span-2|3|4|6`.

## Animation

Everything is CSS transitions and keyframes; `main.js` only adds classes and sets custom
properties. `prefers-reduced-motion: reduce` short-circuits all of it and shows the final
state.

| Effect | Hook |
|---|---|
| Scroll reveals (up / left / right / scale / blur) | `.reveal` + `.reveal--*` |
| Staggered groups | `[data-reveal-group="90"]` on the wrapper |
| Word-by-word headline entrance | `data-split` on the heading |
| Sequenced checklist ticks with SVG path draw | `.check-list` (auto `--i` per item) |
| Cursor-tracking spotlight on cards | `.card--spot` |
| Magnetic buttons | `data-magnetic` |
| Animated counters | `data-count` (+ `data-prefix` / `data-suffix` / `data-decimals`) |
| Growing bar chart | `.chart` inside a `.showcase` |
| Step timeline with progress line | `.steps` |
| Vertical compliance timeline | `.timeline` |
| Price morph on billing switch | `data-monthly` / `data-annual` |
| Hero invoice building itself | `.line-item` |
| Billing machine printing a receipt | `.printer` (see below) |
| Manual vs automated workflow race | `.vs-lane` (see below) |
| Hero mouse parallax | `.hero__visual` |
| Logo marquee (pauses on hover) | `.marquee` |
| Accordion | `.accordion` / `.acc-item` |
| Scroll progress bar, nav blur-on-scroll | `.progress-bar`, `.nav` |

Adding a word rotator: put `.rotator > .rotator__list > span` in a headline and
`initRotator()` cycles it.

### Billing machine

The receipt printer in the hero is pure CSS — no JS, no images. One 9-second master
cycle (`--cycle` on `.printer`) drives four synchronised keyframe animations, so their
percentages have to stay in step if you retime it:

| Keyframes | What it does | Active window |
|---|---|---|
| `paper-feed` | Grows `.printer__paper` from 0 to `--receipt-h`, revealing the receipt top-down | 3% → 50% |
| `print-head` | Fades in the cyan print-head bar behind the slot | 3% → 54% |
| `printer-shudder` | Sub-pixel stepper-motor vibration on the chassis | 3% → 52% |
| `receipt-tear` | Drops the finished receipt away, then resets while the slot is empty | 76% → 83% |

`led-blink` runs on its own 1.15s loop so the machine reads as powered on throughout.

Two details worth knowing before editing it:

- The torn bottom edge is a **two-layer mask** on `.printer__paper` — a solid block for
  the body plus a repeating inline-SVG triangle strip pinned to the bottom. Because the
  container's height is animated, the teeth ride down with the paper automatically.
- The paper's drop shadow lives on the `.printer__feed` wrapper, not on the masked
  element. Filters are applied *before* masks, so a shadow on `.printer__paper` itself
  would be clipped away by its own torn edge.

To retime, change `--cycle`. To change the receipt length, change `--receipt-h` —
`.receipt` uses `min-height` so it can never end up shorter than the paper container.

### Manual vs automated race (`#compare` on the features page)

Two lanes run the same job on one shared 14-second `--cycle`. The only thing that differs
is `--gap`, the delay between consecutive steps:

```css
.vs-lane--manual { --gap: .72s; }   /* 11 steps -> ~8.2s to finish */
.vs-lane--auto   { --gap: .36s; }   /*  4 steps -> ~1.5s to finish */
```

Each step's delay is `calc(var(--i) * var(--gap))`, and `--i` is assigned by
`initStagger()` from the `data-stagger` attribute on the `<ol>`. So **to add or remove a
step, just edit the markup** — nothing is hard-coded, and the cascade retimes itself.

Two things to keep in sync by hand:

- The `.vs-lane__count` badge ("11 steps") is written in the markup, not derived. If you
  change the step list, change the badge.
- The progress bars use two separate keyframe sets (`vs-fill-slow` / `vs-fill-fast`)
  because keyframe percentages can't be parameterised by a custom property. If you change
  a lane's `--gap`, nudge the matching bar keyframe so the bar finishes when the last step
  does.

The red `.vs-flag` badges (rounding error, forgotten attachment, overdue) inherit their
step's `--i`, so they fire in step with whichever row they sit on.

The section is deliberately labelled as an **illustrative** workflow comparison — it
counts the steps drawn on screen rather than claiming a measured time saving. If you want
to put real numbers on it, run a timing study first.

## Contact form

`POST /api/contact`, a Cloudflare Pages Function in `functions/api/contact.js`.
Same-origin, so there is no CORS involved at all.

Pipeline: honeypot → field validation → server-side Turnstile verification →
delivery. `_routes.json` confines Function invocation to `/api/*`, so all 14
HTML pages are still served as pure static assets with no Function in the crawl
path.

**Why not the shared `forms.brocode.ae` endpoint** that `erpsoftwares.ae` uses:
it lives in a different Cloudflare account, so its CORS allowlist cannot be
extended from this one (a preflight from this origin returns
`access-control-allow-origin: https://www.erpsoftwares.ae`), and its schema
requires ERP-specific fields — `industry`, `hasERP`, `companySize` — that do not
fit an invoicing enquiry.

### Environment (Pages project → Settings → Environment variables)

| Variable | Type | Status |
|---|---|---|
| `TURNSTILE_SECRET` | secret | set — pairs with sitekey `0x4AAAAAAFq5L88oa_-HeOob` in `contact.html` |
| `CONTACT_TO` | plain | set — `hello@brocodesolutions.com` |
| `APPS_SCRIPT_URL` | plain | **not set — the form cannot deliver until it is** |
| `FORWARD_SECRET` | secret | optional but recommended; must match `SHARED_SECRET` in the Apps Script |

The Workers runtime has no SMTP, so delivery is an HTTPS hop to a Google Apps
Script web app that sends the mail. `build/apps-script/Code.gs` is that script,
with setup steps in its header comment.

With `APPS_SCRIPT_URL` unset the endpoint returns a 500 rather than a false
success — a contact form that silently drops enquiries is worse than one that is
visibly broken.

### Verified behaviour

```
GET  /api/contact                    -> 405  Method not allowed
POST {}                              -> 400  Missing required field: name
POST {name}                          -> 400  Missing required field: email
POST {name, email:"nope"}            -> 400  Missing required field: email
POST {name, email}                   -> 403  Verification required
POST {..., cf_turnstile_token:"fake"} -> 403  Verification failed
POST {..., nickname:"spam"}          -> 200  honeypot, silently discarded
POST {name: 200 chars}               -> 400  Field too long: name
```

## Mobile

Audited and fixed at 320 / 375 / 393 / 412px. Breakpoints are 1080, 960, 720, 600, 520 and
400px, plus two capability queries that matter more than width:

- `@media (pointer: coarse)` — form fields go to **16px**, because iOS Safari force-zooms
  the page when a focused input is smaller and never zooms back out. Same block lifts the
  theme toggle, burger, social icons and small buttons to **44px** touch targets.
- `@media (hover: none)` — cancels every `:hover` transform. On a touch screen the hover
  state latches after a tap, leaving cards floating above the page until you tap elsewhere.

Other things worth knowing:

- **The header cannot fit a brand, theme toggle, CTA and burger across a phone.** Below
  600px the "Start free" button is hidden (it is the first item in the burger menu) and the
  gap tightens. The wordmark can also shrink with an ellipsis as a last-resort safety net.
- **`body { overflow-x: hidden }` is a safety net, not the fix.** The hero's floating chips
  and the printer use negative offsets and are clipped by `overflow: hidden` on `.hero`
  and `.page-hero`. If you add anything with a negative offset outside those, clip it too.
- **Aurora blobs drop from 90px to 58px blur under 720px** and shrink. Three large,
  permanently animating blurs are a real cost on a phone GPU.
- **The comparison table scrolls sideways** (`min-width: 680px` inside `overflow-x: auto`)
  with a `.table-hint` line that only appears under 720px.
- Heading clamps floor at 2.25rem / 1.8rem rather than 2.6 / 2.0. Desktop is unchanged —
  only the small end of the clamp moves.

`scratchpad/mobile-audit.js` parses the stylesheet into `(media, selector, declarations)`,
resolves properties the way a browser would at a given viewport and pointer type, and
measures the fixed-width cost of rows that cannot shrink. Re-run it after layout changes.

## Browser support

Modern evergreen browsers. Uses `IntersectionObserver`, CSS custom properties,
`grid-template-rows: 0fr → 1fr` for the accordion, `backdrop-filter`, and `:scope`.
Degrades to a static but complete page if JS fails.

## Accessibility

Skip link, focus-visible rings, `aria-expanded` on the accordion and burger,
`aria-pressed` on the billing toggle, labelled form fields, decorative SVGs marked
`aria-hidden`, a visually-hidden table caption, and full reduced-motion support.
