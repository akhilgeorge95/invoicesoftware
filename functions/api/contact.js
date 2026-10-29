/* functions/api/contact.js — Cloudflare Pages Function on POST /api/contact.
 *
 * Same-origin by design. The sibling site erpsoftwares.ae posts cross-origin to
 * a shared endpoint at forms.brocode.ae, which cannot be reused here: it lives
 * in a different Cloudflare account (so its CORS allowlist cannot be extended
 * from this one), and its schema requires ERP-specific fields — `industry`,
 * `hasERP`, `companySize` — that do not fit an invoicing enquiry. Running our
 * own endpoint on our own origin removes the CORS problem entirely and lets the
 * form ask the questions that actually matter here.
 *
 * Pipeline: honeypot -> field validation -> Turnstile verification -> delivery.
 *
 * Environment (set on the Pages project):
 *   TURNSTILE_SECRET  required, secret.  Paired with the public sitekey in the form.
 *   CONTACT_TO        required, plain.   Where enquiries are emailed.
 *   APPS_SCRIPT_URL   required, plain.   Google Apps Script web app, ending /exec.
 *                                        SMTP is unavailable on the Workers
 *                                        runtime, so delivery is an HTTPS hop —
 *                                        the same approach rfidsolutions.ae uses.
 *   FORWARD_SECRET    optional, secret.  Shared secret the Apps Script checks, so
 *                                        a leaked /exec URL cannot be spammed.
 */

const FIELDS = {
  name:    { label: 'your name',    required: true,  max: 120 },
  email:   { label: 'your email',   required: true,  max: 160 },
  company: { label: 'your company', required: false, max: 160 },
  phone:   { label: 'your phone',   required: false, max: 40 },
  topic:   { label: 'a topic',      required: false, max: 80 },
  size:    { label: 'team size',    required: false, max: 40 },
  message: { label: 'a message',    required: false, max: 4000 },
};

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });

/* Deliberately permissive: the only thing this needs to catch is a value that
   obviously could not be delivered. Real validation is the confirmation email
   bouncing, not a clever regex rejecting a legitimate address. */
const looksLikeEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

async function handlePost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch (e) {
    return json(400, { success: false, error: 'Expected a JSON body' });
  }

  /* 1. Honeypot. A real person never fills a field they cannot see, so a value
        here means a bot. Answer 200 so it has nothing to learn from retrying. */
  if (typeof data.nickname === 'string' && data.nickname.trim() !== '') {
    return json(200, { success: true });
  }

  /* 2. Field validation. */
  const clean = {};
  for (const [key, spec] of Object.entries(FIELDS)) {
    const raw = typeof data[key] === 'string' ? data[key].trim() : '';
    if (spec.required && !raw) {
      return json(400, { success: false, error: `Missing required field: ${key}` });
    }
    if (raw.length > spec.max) {
      return json(400, { success: false, error: `Field too long: ${key}` });
    }
    clean[key] = raw;
  }
  if (!looksLikeEmail(clean.email)) {
    return json(400, { success: false, error: 'Missing required field: email' });
  }

  /* 3. Turnstile. Verified server-side — the browser token proves nothing until
        Cloudflare confirms it, and confirming it here is the whole point. */
  if (!env.TURNSTILE_SECRET) {
    return json(500, { success: false, error: 'Server not configured: TURNSTILE_SECRET' });
  }
  const token = typeof data.cf_turnstile_token === 'string' ? data.cf_turnstile_token : '';
  if (!token) {
    return json(403, { success: false, error: 'Verification required' });
  }

  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET);
  form.append('response', token);
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) form.append('remoteip', ip);

  let verdict;
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });
    verdict = await r.json();
  } catch (e) {
    return json(502, { success: false, error: 'Could not reach the verification service' });
  }
  if (!verdict.success) {
    return json(403, { success: false, error: 'Verification failed' });
  }

  /* 4. Delivery. */
  if (!env.APPS_SCRIPT_URL) {
    // Fail loudly rather than pretending to succeed: a contact form that
    // silently drops enquiries is worse than one that is visibly broken.
    return json(500, { success: false, error: 'Server not configured: APPS_SCRIPT_URL' });
  }

  const payload = {
    ...clean,
    to: env.CONTACT_TO || 'hello@brocodesolutions.com',
    site: 'invoicesoftware.ae',
    submittedAt: new Date().toISOString(),
    country: request.headers.get('CF-IPCountry') || '',
    userAgent: request.headers.get('User-Agent') || '',
    ...(env.FORWARD_SECRET ? { secret: env.FORWARD_SECRET } : {}),
  };

  try {
    const r = await fetch(env.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',          // Apps Script /exec 302s to its result page
    });
    if (!r.ok) {
      return json(502, { success: false, error: 'Delivery failed' });
    }
  } catch (e) {
    return json(502, { success: false, error: 'Delivery failed' });
  }

  return json(200, { success: true });
}

/* Single entry point. A method-specific export plus a catch-all would be
   ambiguous, so this branches explicitly: anything other than POST gets a 405
   rather than falling through to the static handler and its 404 page. */
export async function onRequest(context) {
  if (context.request.method === 'POST') return handlePost(context);
  return json(405, { success: false, error: 'Method not allowed' });
}
