/* build/data-locations.js — one entry per location landing page.
   Content here is HAND-AUTHORED per place, not templated. That is deliberate:
   a set of near-identical "invoice software in <city>" pages reads as doorway
   pages and gets demoted. Every title, description, h1, intro, card set,
   district list and FAQ below is written for its own place.

   SOURCING RULE — free-zone names are taken from the UAE Ministry of Economy
   and Tourism's own free-zone registrar list (moet.gov.ae/en/company-registrars-
   in-free-zones). Licensing-authority names were cross-checked against the same
   ministry's company-registrar pages. Do NOT add a zone, district or authority
   name casually; if it is not verifiable, leave it out.

   Verified-and-REFUTED names go in `bannedNames`. build/verify-location.js
   fails the build if a banned string appears in the rendered page, which stops
   a fact that is true of one emirate leaking into another.

   STRUCTURE: parentSlug is the only structural field.
     absent  -> emirate hub, rendered to  <slug>.html            -> /<slug>
     present -> city page,   rendered to  <parentSlug>/<slug>.html -> /<parent>/<slug>

   HONESTY: there is exactly one office, in Abu Dhabi. No entry may describe a
   local office anywhere else. `office: true` in SEO.PLACES marks the only one.  */

'use strict';

/* Shared closing copy. Deliberately identical across pages — it is a product
   statement, not a local claim, and repeating it is honest. Everything that
   describes a *place* is unique per entry. */
const CTA_SUB = 'Create a free account and send your first VAT-compliant invoice in the next ten minutes. No credit card, no trial clock.';

/* The three cards every page carries, pointing at the money pages. The copy is
   product-level; each entry adds its own locally-specific cards on top. */
const CORE_CARDS = [
  {
    href: '/e-invoicing',
    title: 'Ready for FTA e-invoicing',
    copy: 'Structured PINT AE output and Peppol exchange through an Accredited Service Provider, so the mandate is a setting rather than a migration.',
  },
  {
    href: '/features',
    title: '5% VAT applied automatically',
    copy: 'Standard, zero-rated, exempt and out-of-scope treatments per line, your TRN on every tax invoice, and a VAT summary report that matches what your accountant files.',
  },
  {
    href: '/pricing',
    title: 'Priced in dirhams',
    copy: 'Free for up to five clients, then AED 49 a month. No percentage of what you invoice, and no gateway markup — you connect your own.',
  },
];

const LOCATIONS = [

  /* ===================================================== ABU DHABI (office) */
  {
    slug: 'abu-dhabi',
    city: 'Abu Dhabi',
    title: 'Invoice Software in Abu Dhabi | VAT & FTA e-Invoicing',
    description: 'VAT-compliant invoicing software for Abu Dhabi businesses — ADGM, KEZAD, Masdar City and mainland ADDED licences. Built for FTA e-invoicing. Our office is in Abu Dhabi.',
    keywords: 'invoice software Abu Dhabi, invoicing software Abu Dhabi, VAT invoice software Abu Dhabi, e-invoicing Abu Dhabi, billing software Abu Dhabi, accounting software Abu Dhabi, FTA e-invoicing, ADGM invoicing, KEZAD invoicing',
    h1: 'Invoice software for Abu Dhabi businesses',
    sub: 'VAT-ready invoicing, online payments and expense tracking — built for the UAE and supported from our own office in Abu Dhabi.',
    introHead: 'The emirate where we actually sit',
    intro: [
      'Abu Dhabi is the largest of the seven emirates by area and the seat of federal government, which shapes how its businesses invoice. A great deal of commercial activity here runs through government and semi-government contracting, where purchase-order references, structured line items and clean tax-invoice formatting are not presentational niceties — they are the difference between an invoice that gets paid on schedule and one that is returned.',
      'The emirate also spans three very different commercial geographies: Abu Dhabi city itself, the inland city of Al Ain, and the Al Dhafra region to the west with its energy and industrial clusters. A consultancy billing monthly retainers in the city, a contractor invoicing against milestones in Mussafah, and a services firm working in Ruwais all need the same compliance underneath and quite different billing rhythms on top.',
      'Businesses here license either on the mainland through the Abu Dhabi Department of Economic Development, or inside a free zone — Abu Dhabi Global Market for financial and professional firms, KEZAD for industrial and logistics operations, Masdar City, twofour54 for media, or the Abu Dhabi Airports Free Zone. The licence route changes your paperwork and your client mix; it does not change the fact that a UAE tax invoice needs your TRN, the correct VAT treatment per line, and a format the Federal Tax Authority recognises.',
    ],
    cards: [
      {
        href: '/features',
        title: 'Built for milestone and retainer billing',
        copy: 'Progress invoices against a project, recurring schedules for retainers, and purchase-order references carried onto the invoice — the three patterns Abu Dhabi contracting actually runs on.',
      },
      {
        href: '/features#templates',
        title: 'Bilingual tax invoices',
        copy: 'English and Arabic layouts with your TRN, the client TRN and the fields a UAE tax invoice requires, so an invoice is not bounced back for formatting.',
      },
    ],
    areasHead: 'Serving businesses across the emirate',
    areas: ['Abu Dhabi city', 'Al Ain', 'Al Dhafra', 'Mussafah', 'Khalifa City', 'Madinat Zayed', 'Ruwais', 'Yas Island', 'Masdar City', 'KEZAD', 'ADGM / Al Maryah Island', 'twofour54'],
    areasNote: 'Our office is at A2Z Business Center in the TCA district of Abu Dhabi city. The platform itself is cloud software, so wherever you are in the emirate you work in the same system — but Abu Dhabi is the one place you can actually come and sit with us.',
    faqs: [
      { q: 'Do you have an office in Abu Dhabi?', a: 'Yes. Abu Dhabi is our only office — 103/12, A2Z Business Center, Khaleefa Complex B, TCA, Abu Dhabi. You are welcome to visit, and support runs Sunday to Thursday, 9am to 6pm GST.' },
      { q: 'Does it produce a valid UAE tax invoice?', a: 'Yes. Invoices carry your TRN, the client details, per-line VAT treatment and the fields a UAE tax invoice requires, in English or Arabic. 5% standard-rated VAT is applied automatically, and you can set zero-rated, exempt or out-of-scope per product or per line.' },
      { q: 'Does it work for ADGM and free-zone companies as well as mainland?', a: 'Yes. The licence route changes your client mix and some of your reporting, not the invoice format. You set your own TRN, currency and VAT defaults per company, and you can run up to ten companies from one login if you hold more than one licence.' },
      { q: 'Can I invoice government and semi-government clients?', a: 'Yes. You can carry a purchase-order or contract reference onto the invoice, break work into structured line items, and issue progress invoices against a project rather than one lump sum — which is usually what a government payment cycle expects.' },
      { q: 'What happens when FTA e-invoicing becomes mandatory?', a: 'Structured PINT AE output and Peppol exchange through an Accredited Service Provider are part of the Enterprise plan. When your phase goes live you connect your provider in settings and keep invoicing as you do now. Our e-invoicing guide sets out the published phase dates.' },
      { q: 'How much does it cost?', a: 'Free for up to five clients with unlimited invoices. Pro is AED 49 a month, Enterprise AED 69 a month, both with two months free if you pay annually. We never take a percentage of what you invoice.' },
    ],
    ctaHead: 'Start invoicing from Abu Dhabi today',
    ctaSub: CTA_SUB,
    bannedNames: ['Abu Dhabi Free Zone', 'ADGM Free Zone', 'Abu Dhabi Department of Economy and Tourism'],
  },

  /* ============================================================== DUBAI */
  {
    slug: 'dubai',
    city: 'Dubai',
    title: 'Invoice Software in Dubai | VAT Billing & e-Invoicing',
    description: 'VAT-compliant invoicing software for Dubai businesses — DMCC, JAFZA, DIFC, Dubai Silicon Oasis and mainland DET licences. Multi-currency, FTA e-invoicing ready.',
    keywords: 'invoice software Dubai, invoicing software Dubai, VAT invoice software Dubai, billing software Dubai, e-invoicing Dubai, accounting software Dubai, DMCC invoicing, JAFZA invoicing, DIFC invoicing, free zone invoice software',
    h1: 'Invoice software for Dubai businesses',
    sub: 'VAT-ready invoicing, multi-currency billing and online payments — for mainland and free-zone companies across Dubai.',
    introHead: 'More free zones than anywhere else in the country',
    intro: [
      'Dubai has the densest concentration of free zones in the UAE, and that single fact drives most of what makes invoicing here different. A company in the Dubai Multi Commodities Centre, Jebel Ali Free Zone, the Dubai International Financial Centre, Dubai Silicon Oasis, Dubai Airport Free Zone or any of the Dubai Development Authority zones is licensed by its own authority, often bills in a currency other than the dirham, and frequently invoices clients who are not in the UAE at all.',
      'That means two things in practice. First, multi-currency is not a nice-to-have: you need to invoice in dollars or euros, be paid in them, and still see a dirham figure in your reports and your VAT summary. Second, VAT treatment stops being automatic — exports of services, designated-zone transactions and supplies to overseas clients are not all standard-rated, and getting that wrong on a high volume of invoices compounds quickly.',
      'The emirate is also where the UAE\'s re-export and professional-services trade concentrates, so invoice volume per company tends to be high and payment terms long. Mainland businesses license through the Dubai Department of Economy and Tourism. Whichever route you took, the mechanics you need are the same: fast invoice creation, automatic reminders so you are not chasing by hand, and a clean audit trail when the paperwork is reviewed.',
    ],
    cards: [
      {
        href: '/features',
        title: 'Multi-currency with live FX',
        copy: 'Invoice in USD, EUR, GBP or anything else, take payment in it, and still get dirham figures in your reports. Set a currency per client and forget about it.',
      },
      {
        href: '/features#payments',
        title: 'Gateways that settle locally',
        copy: 'Connect Telr, PayTabs or Network International for AED settlement, or Stripe and PayPal for overseas clients. You keep your own gateway account and its rates.',
      },
    ],
    areasHead: 'Serving businesses across Dubai',
    areas: ['Business Bay', 'Deira', 'Bur Dubai', 'DIFC', 'DMCC / JLT', 'Jebel Ali', 'Al Quoz', 'Dubai Silicon Oasis', 'Dubai Marina', 'Dubai South', 'Dubai Internet City', 'Dubai Media City', 'Dubai Airport Free Zone', 'Al Barsha'],
    areasNote: 'We do not keep an office in Dubai. The platform is cloud software used by businesses across the emirate, and our single office is in Abu Dhabi — about ninety minutes down the E11. Support runs Sunday to Thursday on UAE hours, by email and phone.',
    faqs: [
      { q: 'Do you have an office in Dubai?', a: 'No. Brocode Solutions works from one office in Abu Dhabi, and the platform is cloud software you use from anywhere in the UAE. Support is by email and phone, Sunday to Thursday, 9am to 6pm GST.' },
      { q: 'Does it work for free-zone companies like DMCC, JAFZA or DIFC?', a: 'Yes. You set your own TRN, default currency and VAT treatments per company, so the licence route does not change how the software behaves. If you hold licences in more than one zone, you can run up to ten companies from a single login.' },
      { q: 'Can I invoice overseas clients in their own currency?', a: 'Yes. Set a currency per client, invoice in it, and live exchange rates convert back to AED for your reports. Payment gateways settle in whatever currencies your own account supports.' },
      { q: 'How do I handle zero-rated exports of services?', a: 'VAT treatment is set per product or per invoice line, so you can mark a supply zero-rated, exempt or out of scope rather than having 5% applied to everything. The VAT summary report then groups each treatment separately.' },
      { q: 'Can it chase late payers for me?', a: 'Yes, on Pro and above. You can configure up to three reminders before and after the due date with your own wording, and clients pay from a link on the invoice itself rather than asking you for bank details.' },
      { q: 'What about FTA e-invoicing?', a: 'PINT AE structured output and Peppol exchange through an Accredited Service Provider come with the Enterprise plan. Our e-invoicing guide explains the published phase dates and which one is likely to apply to you.' },
    ],
    ctaHead: 'Start invoicing in Dubai today',
    ctaSub: CTA_SUB,
    bannedNames: ['Dubai Department of Economic Development', 'Dubai Free Zone Authority', 'DMCC Free Zone Authority'],
  },

  /* ============================================================ SHARJAH */
  {
    slug: 'sharjah',
    city: 'Sharjah',
    title: 'Invoice Software in Sharjah | VAT Billing for SMEs',
    description: 'VAT-compliant invoicing software for Sharjah businesses — SAIF Zone, Hamriyah Free Zone, Shams and mainland SEDD licences. Built for manufacturers and trading firms.',
    keywords: 'invoice software Sharjah, invoicing software Sharjah, VAT invoice software Sharjah, billing software Sharjah, e-invoicing Sharjah, SAIF Zone invoicing, Hamriyah Free Zone invoicing, Shams invoicing, manufacturing invoice software UAE',
    h1: 'Invoice software for Sharjah businesses',
    sub: 'VAT-ready invoicing with products, inventory and purchase orders — for the emirate where much of the UAE actually manufactures.',
    introHead: 'An industrial base, and a billing pattern to match',
    intro: [
      'Sharjah carries a disproportionate share of the UAE\'s manufacturing and light industry, and that changes what an invoice looks like. Where a Dubai consultancy might bill one line for a monthly retainer, a Sharjah manufacturer is more likely to be invoicing a dozen line items with part numbers, units and quantities, against a purchase order, with stock moving out of a warehouse as it goes.',
      'So the useful features here are the unglamorous ones: a product catalogue with fixed prices and tax treatments, stock counts that decrement as you invoice, purchase orders and vendor records on the buying side, and credit notes for the returns that physical goods inevitably generate. Getting a quantity or a unit price wrong across a long invoice is a far more common problem than getting the VAT rate wrong.',
      'The emirate licenses on the mainland through the Sharjah Economic Development Department, and hosts several free zones with distinct tenant profiles — Sharjah International Airport Free Zone and Hamriyah Free Zone for industry and logistics, Sharjah Publishing City, Sharjah Research Technology and Innovation Park, and Shams for media and creative businesses. Sharjah is also the one emirate with territory on both coasts: Khor Fakkan, Kalba and Dibba Al Hisn sit on the Gulf of Oman, well away from the western industrial belt.',
    ],
    cards: [
      {
        href: '/features',
        title: 'Products, units and inventory',
        copy: 'A catalogue of products and services with prices, units and tax treatments, and stock counts that decrement as you invoice. Long goods invoices stop being retyped.',
      },
      {
        href: '/features',
        title: 'Purchase orders and vendors',
        copy: 'Track what you buy as well as what you sell — vendor records, purchase orders and bills, with recoverable input VAT kept separate from your output VAT.',
      },
    ],
    areasHead: 'Serving businesses across Sharjah',
    areas: ['Sharjah city', 'Industrial Area', 'Muwaileh', 'Al Nahda', 'Al Majaz', 'SAIF Zone', 'Hamriyah Free Zone', 'Al Dhaid', 'Khor Fakkan', 'Kalba', 'Dibba Al Hisn'],
    areasNote: 'We do not have an office in Sharjah. The platform is cloud software used across the emirate, including the east-coast exclaves, and our one office is in Abu Dhabi. Support is by email and phone on UAE hours.',
    faqs: [
      { q: 'Do you have an office in Sharjah?', a: 'No. Brocode Solutions works from a single office in Abu Dhabi. The platform is cloud software, so you use it from anywhere in Sharjah, and support runs Sunday to Thursday, 9am to 6pm GST.' },
      { q: 'Can it handle long invoices with part numbers and quantities?', a: 'Yes. Keep a catalogue of products and services with prices, units and tax rates, then pull lines in rather than retyping them. Stock counts decrement as you invoice, so your inventory stays in step with your billing.' },
      { q: 'Does it do purchase orders and supplier bills?', a: 'Yes. You can record vendors, raise purchase orders and track bills, with recoverable input VAT tracked separately so your VAT position reflects both sides rather than just sales.' },
      { q: 'What about returns and credit notes?', a: 'Credit notes are supported, and link back to the original invoice so the audit trail holds together. Partial credits and partial payments are both handled.' },
      { q: 'Does it work for SAIF Zone and Hamriyah Free Zone companies?', a: 'Yes. You set your own TRN, currency and VAT defaults per company, so a free-zone licence works the same way as a mainland SEDD licence. Multiple licences can run as separate companies under one login.' },
      { q: 'Is there an Arabic invoice layout?', a: 'Yes. Invoice templates come in English and Arabic, and the Arabic layouts are right-to-left aware rather than simply translated, which matters when a client asks for an Arabic tax invoice.' },
    ],
    ctaHead: 'Start invoicing in Sharjah today',
    ctaSub: CTA_SUB,
    bannedNames: ['Sharjah Department of Economic Development', 'Sharjah Free Zone Authority', 'Sharjah Media Free Zone'],
  },

  /* ============================================================== AJMAN */
  {
    slug: 'ajman',
    city: 'Ajman',
    title: 'Invoice Software in Ajman | VAT Billing & Free Zone',
    description: 'VAT-compliant invoicing software for Ajman businesses — Ajman Free Zone, Ajman Media City and mainland licences. Simple, affordable billing for small manufacturers and traders.',
    keywords: 'invoice software Ajman, invoicing software Ajman, VAT invoice software Ajman, billing software Ajman, e-invoicing Ajman, Ajman Free Zone invoicing, Ajman Media City invoicing, small business invoice software UAE',
    h1: 'Invoice software for Ajman businesses',
    sub: 'VAT-ready invoicing that does not need an accountant to operate — built for the small and mid-sized businesses Ajman runs on.',
    introHead: 'Small emirate, high business density',
    intro: [
      'Ajman is the smallest of the seven emirates by area, and it packs a great deal of commercial activity into that space. The business population skews towards small and medium manufacturers, traders and family companies — building materials, furniture, textiles, food processing and light engineering — often operating with a very small back office and no dedicated finance team.',
      'That profile sets the brief precisely. Invoicing software here has to be something an owner or a single administrator can run without training, and it has to be cheap enough that it is obviously worth it against doing the job in a spreadsheet. Features that need configuring by a consultant are worse than useless; features that remove a weekly hour of retyping are the whole value.',
      'Companies license either on the mainland through the Ajman Department of Economic Development, or in Ajman Free Zone, which has long competed on cost and speed of setup, or Ajman Media City. The free zone\'s appeal to first-time and small businesses means a lot of companies here are issuing their first properly formatted tax invoices, and getting the TRN, the VAT treatment and the invoice numbering right from the start saves unpicking it later.',
    ],
    cards: [
      {
        href: '/pricing',
        title: 'Free until you outgrow it',
        copy: 'Five clients and unlimited invoices at no cost, with online payments and recurring billing included. Pro is AED 49 a month when you need more, and there is no percentage on what you invoice.',
      },
      {
        href: '/features',
        title: 'Nothing to configure',
        copy: 'Add your company details and TRN, upload a logo, and send a correctly formatted tax invoice in about ten minutes. No implementation project, no consultant.',
      },
    ],
    areasHead: 'Serving businesses across Ajman',
    areas: ['Ajman city', 'Ajman Free Zone', 'Industrial Area', 'Al Jurf', 'Al Nuaimiya', 'Al Rashidiya', 'Masfout', 'Manama'],
    areasNote: 'We have no office in Ajman. The platform is cloud software used by businesses across the emirate, and our single office is in Abu Dhabi. Support is by email and phone, Sunday to Thursday.',
    faqs: [
      { q: 'Do you have an office in Ajman?', a: 'No. Brocode Solutions works from one office in Abu Dhabi city. The platform is cloud software you use from anywhere, and support runs Sunday to Thursday, 9am to 6pm GST by email and phone.' },
      { q: 'Is it really free to start?', a: 'Yes. The free plan covers five clients with unlimited invoices, online payments, recurring billing, projects and expenses, with no time limit and no card required. You only pay if you outgrow the client limit or want Pro features.' },
      { q: 'I have never issued a formal tax invoice. Will this get it right?', a: 'That is most of what it does. Enter your company details and TRN once, and every invoice carries them along with the client details, per-line VAT and sequential numbering in the form a UAE tax invoice requires.' },
      { q: 'Does it work for an Ajman Free Zone licence?', a: 'Yes. You set your own TRN, currency and VAT defaults, so a free-zone licence and a mainland licence behave the same way. If you hold more than one, each can run as a separate company under one login.' },
      { q: 'Can I use it on my phone?', a: 'Yes. There are iOS and Android apps as well as the web app and desktop builds, so you can invoice, photograph a receipt or check who has paid without going back to a computer.' },
      { q: 'What if I want to leave?', a: 'Export everything to CSV, JSON or PDF whenever you like. There is no lock-in contract on any plan, and paid plans carry a 30-day money-back promise.' },
    ],
    ctaHead: 'Start invoicing in Ajman today',
    ctaSub: CTA_SUB,
    bannedNames: ['Ajman Department of Economy and Tourism', 'Ajman Free Trade Zone', 'Ajman University'],
  },

  /* ====================================================== UMM AL QUWAIN */
  {
    slug: 'umm-al-quwain',
    city: 'Umm Al Quwain',
    title: 'Invoice Software in Umm Al Quwain | VAT Billing',
    description: 'VAT-compliant invoicing software for Umm Al Quwain businesses — UAQ Free Trade Zone and mainland licences. Free to start, priced in dirhams, FTA e-invoicing ready.',
    keywords: 'invoice software Umm Al Quwain, invoicing software UAQ, VAT invoice software Umm Al Quwain, billing software UAQ, UAQ Free Trade Zone invoicing, e-invoicing Umm Al Quwain, small business billing UAE',
    h1: 'Invoice software for Umm Al Quwain businesses',
    sub: 'VAT-ready invoicing and online payments for the emirate\'s traders, workshops and service businesses — free to start.',
    introHead: 'The quietest emirate to do business in',
    intro: [
      'Umm Al Quwain is the least populous of the seven emirates, and its commercial life reflects that: fishing and seafood trade, light manufacturing and workshops, agriculture inland around Falaj Al Mualla, and a steady base of small service businesses. Company sizes are modest and finance functions are usually one person, often the owner.',
      'For a business like that, the deciding factor in invoicing software is almost never the feature list — it is whether the thing can be set up in an afternoon and costs little enough to be an obvious yes. A platform that requires a configuration project will simply lose to a spreadsheet, and a spreadsheet is what most of the emirate\'s smaller businesses are still invoicing from.',
      'Companies license on the mainland through the emirate\'s Department of Economic Development, or in the Umm Al Quwain Free Trade Zone, which markets itself on low-cost setup and has drawn a good number of first-time and single-owner businesses. Those are exactly the companies for whom getting the tax-invoice format right from the first invoice matters most, because there is nobody else to catch the mistake.',
    ],
    cards: [
      {
        href: '/pricing',
        title: 'AED 0 to start, forever',
        copy: 'Five clients, unlimited invoices, online payments and recurring billing at no cost and with no card. The free plan is a real plan, not a trial.',
      },
      {
        href: '/features',
        title: 'Set up in an afternoon',
        copy: 'Company details, TRN, logo, done. Import an existing client list from CSV and you are issuing correctly formatted tax invoices the same day.',
      },
    ],
    areasHead: 'Serving businesses across Umm Al Quwain',
    areas: ['Umm Al Quwain city', 'UAQ Free Trade Zone', 'Falaj Al Mualla', 'Al Salamah', 'Al Raas', 'Al Humrah'],
    areasNote: 'We have no office in Umm Al Quwain. The platform is cloud software, and our single office is in Abu Dhabi. Support is by email and phone, Sunday to Thursday, on UAE hours.',
    faqs: [
      { q: 'Do you have an office in Umm Al Quwain?', a: 'No. Brocode Solutions works from one office in Abu Dhabi. The platform is cloud software used from anywhere in the UAE, and support runs Sunday to Thursday, 9am to 6pm GST.' },
      { q: 'How long does setup take?', a: 'About ten minutes to a first invoice. Add your company name, address and TRN, upload a logo, pick a template, and send. Connecting a payment gateway takes a few more minutes if you want clients to pay online.' },
      { q: 'Can I move my clients across from a spreadsheet?', a: 'Yes. Clients, products, invoices and expenses all import from CSV, so you can bring an existing list over rather than retyping it.' },
      { q: 'Does it work for a UAQ Free Trade Zone licence?', a: 'Yes. You set your own TRN, currency and VAT defaults per company, so free-zone and mainland licences behave identically.' },
      { q: 'What does it cost once I outgrow the free plan?', a: 'Pro is AED 49 a month or AED 490 a year, which is two months free. Enterprise is AED 69 a month. All prices are in dirhams and exclusive of VAT, and we never take a cut of what you invoice.' },
      { q: 'Will it handle FTA e-invoicing when that applies to me?', a: 'Yes, on the Enterprise plan, which includes PINT AE structured output and Peppol exchange through an Accredited Service Provider. Most smaller businesses fall into the later mandate phase — our e-invoicing guide has the published dates.' },
    ],
    ctaHead: 'Start invoicing in Umm Al Quwain today',
    ctaSub: CTA_SUB,
    bannedNames: ['Umm Al Quwain Free Zone', 'Umm Al Quwain Department of Economy and Tourism'],
  },

  /* ===================================================== RAS AL KHAIMAH */
  {
    slug: 'ras-al-khaimah',
    city: 'Ras Al Khaimah',
    title: 'Invoice Software in Ras Al Khaimah | RAKEZ VAT Billing',
    description: 'VAT-compliant invoicing software for Ras Al Khaimah businesses — RAKEZ, RAK Maritime City and mainland licences. Built for manufacturers, quarrying and trading firms.',
    keywords: 'invoice software Ras Al Khaimah, invoicing software RAK, VAT invoice software Ras Al Khaimah, billing software RAK, RAKEZ invoicing, RAK Maritime City invoicing, e-invoicing Ras Al Khaimah, manufacturing billing software UAE',
    h1: 'Invoice software for Ras Al Khaimah businesses',
    sub: 'VAT-ready invoicing with products, stock and purchase orders — for the northern emirate\'s industrial and trading base.',
    introHead: 'Industry at the top of the country',
    intro: [
      'Ras Al Khaimah is the northernmost emirate, where the coastal plain runs into the Hajar mountains, and its economy is unusually industrial for its size. Ceramics, cement, quarrying and building materials are long-established here, alongside manufacturing, maritime trade and a growing tourism sector around the mountains and the coast.',
      'Heavy and mid-weight industry bills in a particular way: by quantity and unit, against purchase orders, with deliveries and returns that have to reconcile against what was invoiced. The software that helps is the software that keeps a product catalogue honest, tracks stock as it moves, records what you bought as well as what you sold, and produces a credit note without breaking the audit trail.',
      'The emirate has consolidated much of its free-zone activity into RAKEZ, which hosts industrial, commercial and service licences on one footing, with RAK Maritime City serving port and marine businesses. Mainland companies license through the emirate\'s Department of Economic Development. Across all three routes the tax-invoice requirements are the same, and so is the value of not assembling them by hand.',
    ],
    cards: [
      {
        href: '/features',
        title: 'Quantity and unit billing',
        copy: 'A product catalogue with units, prices and tax treatments, so a long materials invoice is assembled from saved lines rather than retyped and re-checked.',
      },
      {
        href: '/features',
        title: 'Both sides of the ledger',
        copy: 'Vendors, purchase orders and bills alongside your sales invoices, with recoverable input VAT tracked separately and bank transactions imported automatically.',
      },
    ],
    areasHead: 'Serving businesses across Ras Al Khaimah',
    areas: ['Ras Al Khaimah city', 'RAKEZ', 'RAK Maritime City', 'Al Nakheel', 'Al Jazirah Al Hamra', 'Al Hamra', 'Al Rams', 'Khatt', 'Digdaga'],
    areasNote: 'We have no office in Ras Al Khaimah. The platform is cloud software used by businesses throughout the emirate, and our single office is in Abu Dhabi. Support is by email and phone on UAE hours.',
    faqs: [
      { q: 'Do you have an office in Ras Al Khaimah?', a: 'No. Brocode Solutions works from one office in Abu Dhabi. The platform is cloud software used from anywhere in the UAE, with support Sunday to Thursday, 9am to 6pm GST.' },
      { q: 'Does it work for a RAKEZ licence?', a: 'Yes. You set your own TRN, default currency and VAT treatments per company, so a RAKEZ licence behaves the same as a mainland one. If you hold several licences, each can be a separate company under one login.' },
      { q: 'Can it handle materials invoices with units and quantities?', a: 'Yes. Products and services are stored with units, prices and tax rates, and stock counts decrement as you invoice — so quantities on the invoice and quantities in the warehouse stay in step.' },
      { q: 'Does it track what we buy as well as what we sell?', a: 'Yes. Vendors, purchase orders and bills are all supported, input VAT is tracked separately from output VAT, and bank and card transactions can be imported and matched automatically.' },
      { q: 'What about deliveries that come back?', a: 'Credit notes link to the original invoice, and partial credits are supported, so returns are recorded without breaking the numbering or the audit trail.' },
      { q: 'Are we in the first or second e-invoicing phase?', a: 'It depends on your annual revenue rather than your emirate — the AED 50 million threshold separates the two published phases. Our e-invoicing guide sets out both sets of dates, and we would rather you confirmed your own position with the FTA or your tax adviser.' },
    ],
    ctaHead: 'Start invoicing in Ras Al Khaimah today',
    ctaSub: CTA_SUB,
    bannedNames: ['RAK Free Trade Zone', 'Ras Al Khaimah Free Zone Authority', 'RAK Investment Authority'],
  },

  /* =========================================================== FUJAIRAH */
  {
    slug: 'fujairah',
    city: 'Fujairah',
    title: 'Invoice Software in Fujairah | VAT & Shipping Billing',
    description: 'VAT-compliant invoicing software for Fujairah businesses — Fujairah Free Zone, Creative City and mainland licences. Multi-currency billing for shipping and trading firms.',
    keywords: 'invoice software Fujairah, invoicing software Fujairah, VAT invoice software Fujairah, billing software Fujairah, Fujairah Free Zone invoicing, Fujairah Creative City invoicing, e-invoicing Fujairah, shipping invoice software UAE',
    h1: 'Invoice software for Fujairah businesses',
    sub: 'VAT-ready, multi-currency invoicing for the UAE\'s east-coast port economy — shipping services, trading and professional firms.',
    introHead: 'The only emirate on the Gulf of Oman',
    intro: [
      'Fujairah is the one emirate with its entire coastline on the Gulf of Oman rather than the Arabian Gulf, outside the Strait of Hormuz. That geography is the whole story of its economy: the Port of Fujairah is one of the world\'s major bunkering hubs, and a dense cluster of ship-servicing, bunker trading, logistics and marine-services companies has grown around it.',
      'Businesses serving that trade invoice internationally by default. Clients are shipping lines, traders and agents who are rarely UAE-resident, billing is frequently in US dollars, and the VAT position is often not simple standard-rated supply. Getting currency, conversion and VAT treatment right on every invoice matters more here than almost anywhere else in the country, and so does being able to show the working afterwards.',
      'Away from the port, the emirate has a mountain and east-coast hinterland — Dibba Al Fujairah to the north, Qidfa and Masafi inland — with construction, quarrying, agriculture and tourism businesses that bill much more locally. Companies license on the mainland or in Fujairah Free Zone and Fujairah Creative City, the latter aimed at media and consultancy work.',
    ],
    cards: [
      {
        href: '/features',
        title: 'Invoice in dollars, report in dirhams',
        copy: 'Set a currency per client, invoice and take payment in it, and let live FX convert back to AED for your reports and VAT summary.',
      },
      {
        href: '/features',
        title: 'VAT treatment per line',
        copy: 'Standard, zero-rated, exempt and out-of-scope set per product or per line, with each treatment grouped separately in the VAT summary — not 5% applied to everything.',
      },
    ],
    areasHead: 'Serving businesses across Fujairah',
    areas: ['Fujairah city', 'Port of Fujairah', 'Fujairah Free Zone', 'Fujairah Creative City', 'Dibba Al Fujairah', 'Qidfa', 'Masafi', 'Mirbah'],
    areasNote: 'We have no office in Fujairah. The platform is cloud software used by businesses on the east coast and inland, and our single office is in Abu Dhabi. Support is by email and phone, Sunday to Thursday.',
    faqs: [
      { q: 'Do you have an office in Fujairah?', a: 'No. Brocode Solutions works from a single office in Abu Dhabi, and the platform is cloud software you use from anywhere. Support runs Sunday to Thursday, 9am to 6pm GST, by email and phone.' },
      { q: 'Can I invoice international shipping clients in US dollars?', a: 'Yes. Set the currency per client, invoice and collect in it, and live exchange rates convert back to dirhams for your reporting. Your gateway settles in whatever currencies your own account supports.' },
      { q: 'How do I handle supplies that are not standard-rated?', a: 'VAT treatment is set per product or per invoice line, so zero-rated, exempt and out-of-scope supplies are recorded as such rather than taxed at 5%. The VAT summary report then separates each treatment.' },
      { q: 'Does it work for a Fujairah Free Zone or Creative City licence?', a: 'Yes. You set your own TRN, currency and VAT defaults per company, so the licence route does not change how invoicing behaves. Multiple licences can run as separate companies under one login.' },
      { q: 'Can clients pay without a bank transfer?', a: 'Yes. Every invoice can carry a secure payment link, and you connect your own gateway — Stripe or PayPal for overseas clients, Telr, PayTabs or Network International for AED settlement. The invoice marks itself paid when the gateway confirms.' },
      { q: 'What about FTA e-invoicing for international billing?', a: 'The mandate as published centres on B2B and B2G transactions in the UAE. PINT AE output and Peppol exchange are included on the Enterprise plan; for how it applies to cross-border shipping work specifically, check your position with the FTA or your tax adviser.' },
    ],
    ctaHead: 'Start invoicing in Fujairah today',
    ctaSub: CTA_SUB,
    bannedNames: ['Fujairah Department of Economic Development', 'Fujairah Media Free Zone', 'Fujairah Oil Zone'],
  },

];

module.exports = LOCATIONS;
