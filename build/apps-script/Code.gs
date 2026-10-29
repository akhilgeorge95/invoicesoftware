/**
 * Google Apps Script web app — email delivery for the InvoiceSoftware.ae
 * contact form.
 *
 * Why this exists: the Cloudflare Workers runtime has no SMTP, so a Pages
 * Function cannot send mail directly. It forwards the enquiry here over HTTPS
 * and this sends the email from your own Google account. Same approach the
 * rfidsolutions.ae site uses.
 *
 * ── SETUP ────────────────────────────────────────────────────────────────
 * 1. Go to https://script.google.com  →  New project. Name it
 *    "InvoiceSoftware.ae contact form".
 * 2. Delete the placeholder code and paste this whole file in.
 * 3. Edit SHARED_SECRET below — make up a long random string.
 * 4. Deploy → New deployment → type "Web app".
 *       Execute as:        Me
 *       Who has access:    Anyone                 <-- required; the Worker is
 *                                                     anonymous to Google
 * 5. Authorise it when prompted (it needs permission to send mail as you).
 * 6. Copy the Web app URL. It ends in /exec.
 * 7. Send Claude the /exec URL and the SHARED_SECRET and they go on the Pages
 *    project as APPS_SCRIPT_URL and FORWARD_SECRET.
 *
 * "Anyone" access means anybody who learns the URL can POST to it, which is
 * why SHARED_SECRET exists: requests without it are rejected, so a leaked URL
 * cannot be used to send mail through your account.
 */

var SHARED_SECRET = 'CHANGE-ME-to-a-long-random-string';
var FALLBACK_TO   = 'hello@brocodesolutions.com';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (SHARED_SECRET && data.secret !== SHARED_SECRET) {
      return json({ success: false, error: 'Unauthorised' });
    }

    var to = data.to || FALLBACK_TO;
    var name = data.name || '(no name)';
    var subject = 'Website enquiry — ' + name + (data.company ? ' (' + data.company + ')' : '');

    var rows = [
      ['Name',      data.name],
      ['Email',     data.email],
      ['Company',   data.company],
      ['Phone',     data.phone],
      ['Topic',     data.topic],
      ['Team size', data.size],
      ['Message',   data.message],
      ['—',         ''],
      ['Site',      data.site],
      ['Submitted', data.submittedAt],
      ['Country',   data.country],
      ['Browser',   data.userAgent]
    ];

    var text = rows
      .filter(function (r) { return r[1]; })
      .map(function (r) { return r[0] + ': ' + r[1]; })
      .join('\n');

    var html = '<table style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:14px">' +
      rows.filter(function (r) { return r[1]; }).map(function (r) {
        return '<tr>' +
          '<td style="padding:6px 14px 6px 0;color:#666;vertical-align:top;white-space:nowrap">' + esc(r[0]) + '</td>' +
          '<td style="padding:6px 0">' + esc(r[1]).replace(/\n/g, '<br>') + '</td>' +
          '</tr>';
      }).join('') + '</table>';

    MailApp.sendEmail({
      to: to,
      subject: subject,
      body: text,
      htmlBody: html,
      // Lets you hit Reply in your inbox and answer the enquirer directly.
      replyTo: data.email || undefined,
      name: 'InvoiceSoftware.ae'
    });

    return json({ success: true });
  } catch (err) {
    return json({ success: false, error: String(err) });
  }
}

/* A GET is useful for checking the deployment is live without sending mail. */
function doGet() {
  return json({ ok: true, service: 'invoicesoftware.ae contact form' });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
