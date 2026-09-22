import { env } from '../config/index.js';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildWelcomeClientEmail({
  firstName,
  lastName,
  username,
  temporaryPassword,
  portalUrl = env.portalUrl,
}) {
  const safeFirst = escapeHtml(firstName);
  const safeLast = escapeHtml(lastName);
  const safeUsername = escapeHtml(username);
  const safePassword = escapeHtml(temporaryPassword);
  const loginUrl = `${String(portalUrl || '').replace(/\/$/, '')}/login`;
  const safeLoginUrl = escapeHtml(loginUrl);

  const subject = 'Welcome to Cold Creek Farm Portal - Your Account Details';

  const text = [
    `Dear ${firstName} ${lastName},`,
    '',
    'Welcome to the Cold Creek Farm Portal!',
    '',
    'Your account has been successfully created by our administrator.',
    'You can access the portal using the credentials below.',
    '',
    `Portal: ${loginUrl}`,
    `Username: ${username}`,
    `Temporary Password: ${temporaryPassword}`,
    '',
    'For security reasons, you will be required to change your password after your first login.',
    '',
    'If you have any questions or need assistance, please contact the appropriate support team.',
    '',
    'Welcome to Cold Creek Farm!',
    '',
    'Regards,',
    'Cold Creek Farm Team',
  ].join('\n');

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
                <h1 style="margin:8px 0 0;font-size:24px;font-weight:normal;">Portal welcome</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">Dear ${safeFirst} ${safeLast},</p>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">Welcome to the Cold Creek Farm Portal!</p>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">
                  Your account has been successfully created by our administrator.
                  You can access the portal using the credentials below.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;background:#f8f6f1;border:1px solid #e5dfd3;border-radius:8px;">
                  <tr>
                    <td style="padding:16px 18px;font-size:15px;line-height:1.6;">
                      <p style="margin:0 0 8px;"><strong>Portal:</strong><br /><a href="${safeLoginUrl}" style="color:#3f5d45;">${safeLoginUrl}</a></p>
                      <p style="margin:0 0 8px;"><strong>Username:</strong><br />${safeUsername}</p>
                      <p style="margin:0;"><strong>Temporary Password:</strong><br />${safePassword}</p>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">
                  For security reasons, you will be required to change your password after your first login.
                </p>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">
                  If you have any questions or need assistance, please contact the appropriate support team.
                </p>
                <p style="margin:0;font-size:16px;line-height:1.5;">
                  Welcome to Cold Creek Farm!<br /><br />
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

  return { subject, text, html, loginUrl };
}
