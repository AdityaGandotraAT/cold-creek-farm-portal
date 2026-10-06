import { env } from '../config/index.js';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatEventDate(isoDate) {
  const datePart = String(isoDate || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return String(isoDate || '');
  }
  const [year, month, day] = datePart.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

export function buildVendorSelectionEmail({
  category,
  vendorName,
  booking,
  clientName,
  portalUrl = env.portalUrl,
  internalOnly = false,
  acceptUrl = '',
  unavailableUrl = '',
}) {
  const eventDate = formatEventDate(booking.eventDate);
  const couple = clientName || booking.name;
  const subject = internalOnly
    ? `[Internal] Cold Creek Farm — ${couple} selected ${vendorName} (${category})`
    : `Cold Creek Farm — Please confirm availability for ${couple}`;
  const intro = internalOnly
    ? 'Internal notice only. The preferred vendor was not emailed because the portal is not live yet.'
    : 'A Cold Creek Farm client selected you for their event. Please confirm whether you are available on this date.';
  const hasActions = Boolean(acceptUrl && unavailableUrl);

  const text = [
    intro,
    '',
    `Client: ${couple}`,
    `Event: ${booking.eventName}`,
    `Date: ${eventDate}`,
    `Venue: ${booking.venue}`,
    `Category: ${category}`,
    `Vendor: ${vendorName}`,
    `Reference: ${booking.referenceNumber}`,
    hasActions ? '' : null,
    hasActions ? `Accept: ${acceptUrl}` : null,
    hasActions ? `Not available: ${unavailableUrl}` : null,
    '',
    'Regards,',
    'Cold Creek Farm Team',
  ]
    .filter((line) => line !== null)
    .join('\n');

  const actionHtml = hasActions
    ? `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;">Please choose one option:</p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 16px;">
                  <tr>
                    <td style="padding:0 8px 0 0;">
                      <a href="${escapeHtml(acceptUrl)}" style="display:inline-block;background:#3f5d45;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-family:Georgia,'Times New Roman',serif;font-size:15px;">Accept</a>
                    </td>
                    <td style="padding:0;">
                      <a href="${escapeHtml(unavailableUrl)}" style="display:inline-block;background:#7a2e2e;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-family:Georgia,'Times New Roman',serif;font-size:15px;">Not available</a>
                    </td>
                  </tr>
                </table>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f1ea;font-family:Georgia,'Times New Roman',serif;color:#2c2a26;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f1ea;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #ddd4c4;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 12px;background:#3f5d45;color:#ffffff;">
                <p style="margin:0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">Cold Creek Farm</p>
                <h1 style="margin:8px 0 0;font-size:24px;font-weight:normal;">Please confirm availability</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">${escapeHtml(intro)}</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 16px;background:#f8f6f1;border:1px solid #e5dfd3;border-radius:8px;">
                  <tr>
                    <td style="padding:16px 18px;font-size:15px;line-height:1.6;">
                      <p style="margin:0 0 8px;"><strong>Client:</strong><br />${escapeHtml(couple)}</p>
                      <p style="margin:0 0 8px;"><strong>Event:</strong><br />${escapeHtml(booking.eventName)}</p>
                      <p style="margin:0 0 8px;"><strong>Date:</strong><br />${escapeHtml(eventDate)}</p>
                      <p style="margin:0 0 8px;"><strong>Category:</strong><br />${escapeHtml(category)}</p>
                      <p style="margin:0;"><strong>Vendor:</strong><br />${escapeHtml(vendorName)}</p>
                    </td>
                  </tr>
                </table>
                ${actionHtml}
                <p style="margin:16px 0 0;font-size:16px;line-height:1.5;">
                  Regards,<br />
                  Cold Creek Farm Team
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}
