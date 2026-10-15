# InvoiceSoftware.ae

Marketing site for **www.invoicesoftware.ae** — a UAE-localised invoicing, payments and
expenses platform. Feature set and pricing structure are modelled on
[invoiceninja.com](https://invoiceninja.com), then adapted for the UAE: AED pricing,
5% VAT, and FTA e-invoicing (Peppol / PINT AE) as the local differentiator.

Static HTML, CSS and vanilla JS. No build step, no dependencies, no framework.

---

## Files

```
index.html          Home — hero, bento features, steps, dashboard, e-invoicing teaser,
                    testimonials, full pricing, FAQ, CTA
features.html       Deep feature pages by category + templates, apps, security
pricing.html        Four plans, monthly/annual toggle, full comparison table, billing FAQ
e-invoicing.html    UAE FTA mandate guide — five-corner model, timeline, readiness checklist
contact.html        Demo request form, contact cards, quick answers

assets/css/styles.css   Design system + all components (single file, sectioned)
assets/js/main.js       Interaction & animation engine (single file, no dependencies)
assets/img/favicon.svg  Gradient mark

robots.txt          Allows all, points at the sitemap
sitemap.xml         All five pages
```

## Run locally

Any static server will do. With Node installed:

```bash
npx serve .          # then open http://localhost:3000
```

Or Python: `python -m http.server 5173`.

Opening `index.html` directly from disk works too, though `file://` blocks nothing here
since there are no fetches.

## Deploy

Hosted on **Cloudflare Pages**, project `invoicesoftware`, in the Brocode Solutions
account — the same arrangement as `rfidsolutions.ae`. The repository root is the publish
directory; there is nothing to build.

```bash
npx wrangler pages deploy . --project-name invoicesoftware --branch main
```

Hosts: `www.invoicesoftware.ae` (canonical), `invoicesoftware.ae`, and
`invoicesoftware.pages.dev`.

**Clean URLs are mandatory, not cosmetic.** Cloudflare Pages 308-redirects `/foo.html`
to `/foo`. Every internal link, canonical, `og:url` and sitemap `<loc>` is therefore
written extensionless (`/features`, not `/features.html`), while the files keep their
`.html` names on disk — Pages maps `/features` to `features.html` itself. If you add a
page or hand-edit a link, use the extensionless form, or that link takes a redirect hop
and the page starts declaring a canonical that is not the URL serving it.

Asset references are root-absolute (`/assets/...`) so they resolve identically from `/`
and from `/features`.

The canonical host appears in each page's `<link rel="canonical">` and `og:url`, in
`robots.txt`, and in `sitemap.xml`. Changing hosts means changing all four.

Repo metadata (`README.md`, `.gitignore`, `.gitattributes`) is uploaded and publicly
served — `.assetsignore` does **not** work on a classic Pages project, only on Workers
Assets. Don't put anything in this repo you would not publish.

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
| **Office address** | `contact.html` | "Business Bay, Dubai" is a stand-in. Email and phone are real (`hello@brocodesolutions.com`, `+971 50 761 2213`). |
| **Support hours** | `contact.html`, next to the phone | "Sun–Thu, 9am–6pm GST", "Under 4 hours", "English & Arabic" were assumed — confirm or change. |
| **Form handler** | `contact.html` | The form is wired to a local success simulation in `initForm()`. Point it at Netlify Forms, a Cloudflare Pages Function, Formspree or your CRM. |
| **Pricing** | `pricing.html`, `index.html` | AED 0 / 49 / 69 / 1,099 derived from Invoice Ninja's USD tiers. Confirm against your actual commercials. |
| **`og:image`** | all pages | `assets/img/og.png` is referenced but not included — add a 1200×630 social card. |
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
