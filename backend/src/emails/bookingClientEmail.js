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

function formatClock(time) {
  const match = String(time || '').match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    return String(time || '');
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(1970, 0, 1, hour, minute)));
}

export function buildBookingClientEmail({
  kind = 'assigned',
  firstName,
  lastName,
  booking,
  portalUrl = env.portalUrl,
}) {
  const bookingUrl = `${String(portalUrl || '').replace(/\/$/, '')}/client/booking`;
  const isUpdate = kind === 'updated';
  const subject = isUpdate
    ? `Cold Creek Farm — ${booking.eventName} details were updated`
    : `Cold Creek Farm — Your booking for ${booking.eventName}`;
  const intro = isUpdate
    ? 'Your Cold Creek Farm booking details were updated. Here is the current information.'
    : 'Your Cold Creek Farm booking is ready to review in the client portal.';
  const eventDate = formatEventDate(booking.eventDate);
  const eventTime = `${formatClock(booking.eventStartTime)} - ${formatClock(booking.eventEndTime)}`;

  const text = [
    `Dear ${firstName} ${lastName},`,
    '',
    intro,
    '',
    `Event: ${booking.eventName}`,
    `Reference: ${booking.referenceNumber}`,
    `Date: ${eventDate}`,
    `Time: ${eventTime}`,
    `Venue: ${booking.venue}`,
    `Guests: ${booking.guests}`,
    `Status: ${booking.bookingStatus}`,
    booking.notes ? `Notes: ${booking.notes}` : null,
    '',
    `View your booking: ${bookingUrl}`,
    '',
    'If something looks incorrect, contact Cold Creek Farm and we will update it for you.',
    '',
    'Regards,',
    'Cold Creek Farm Team',
  ]
    .filter((line) => line !== null)
    .join('\n');

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
                <h1 style="margin:8px 0 0;font-size:24px;font-weight:normal;">${isUpdate ? 'Booking updated' : 'Your booking'}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">Dear ${escapeHtml(firstName)} ${escapeHtml(lastName)},</p>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">${escapeHtml(intro)}</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;background:#f8f6f1;border:1px solid #e5dfd3;border-radius:8px;">
                  <tr>
                    <td style="padding:16px 18px;font-size:15px;line-height:1.6;">
                      <p style="margin:0 0 8px;"><strong>Event:</strong><br />${escapeHtml(booking.eventName)}</p>
                      <p style="margin:0 0 8px;"><strong>Reference:</strong><br />${escapeHtml(booking.referenceNumber)}</p>
                      <p style="margin:0 0 8px;"><strong>Date:</strong><br />${escapeHtml(eventDate)}</p>
                      <p style="margin:0 0 8px;"><strong>Time:</strong><br />${escapeHtml(eventTime)}</p>
                      <p style="margin:0 0 8px;"><strong>Venue:</strong><br />${escapeHtml(booking.venue)}</p>
                      <p style="margin:0 0 8px;"><strong>Guests:</strong><br />${escapeHtml(booking.guests)}</p>
                      <p style="margin:0;"><strong>Status:</strong><br />${escapeHtml(booking.bookingStatus)}</p>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">
                  <a href="${escapeHtml(bookingUrl)}" style="color:#3f5d45;">View my booking</a>
                </p>
                <p style="margin:0;font-size:16px;line-height:1.5;">
                  If something looks incorrect, contact Cold Creek Farm and we will update it for you.<br /><br />
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

  return { subject, text, html, bookingUrl };
}
