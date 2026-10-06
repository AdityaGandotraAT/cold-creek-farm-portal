import { env } from '../config/index.js';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildPasswordResetEmail({ firstName, resetUrl, portalUrl = env.portalUrl }) {
  const name = String(firstName || '').trim() || 'there';
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(resetUrl);
  const loginUrl = `${String(portalUrl || '').replace(/\/$/, '')}/login`;
  const subject = 'Reset your Cold Creek Farm Portal password';

  const text = [
    `Dear ${name},`,
    '',
    'We received a request to reset the password for your Cold Creek Farm Portal account.',
    '',
    `Choose a new password: ${resetUrl}`,
    '',
    'This link expires in one hour and can be used once.',
    'If you did not ask for this, you can ignore this email. Your password will stay the same.',
    '',
    `Sign in: ${loginUrl}`,
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
                <h1 style="margin:8px 0 0;font-size:24px;font-weight:normal;">Reset your password</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">Dear ${safeName},</p>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">
                  We received a request to reset the password for your Cold Creek Farm Portal account.
                </p>
                <p style="margin:0 0 20px;">
                  <a href="${safeUrl}" style="display:inline-block;background:#3f5d45;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-size:15px;">Choose a new password</a>
                </p>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">This link expires in one hour and can be used once.</p>
                <p style="margin:0;font-size:15px;line-height:1.5;">If you did not ask for this, you can ignore this email. Your password will stay the same.</p>
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
