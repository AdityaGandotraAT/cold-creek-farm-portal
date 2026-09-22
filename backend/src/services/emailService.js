import nodemailer from 'nodemailer';
import { env } from '../config/index.js';
import { HttpError } from '../utils/httpError.js';
import { buildWelcomeClientEmail } from '../emails/welcomeClientEmail.js';
import { buildBookingClientEmail } from '../emails/bookingClientEmail.js';
import { buildVendorSelectionEmail } from '../emails/vendorSelectionEmail.js';

let transporterOverride = null;
let cachedTransporter = null;

function smtpConfigured() {
  return Boolean(env.smtp.host && env.smtp.from);
}

export function assertSmtpConfigured() {
  if (!smtpConfigured()) {
    throw new HttpError(
      503,
      'Email service is not configured. Set SMTP_HOST and SMTP_FROM in the server environment.',
    );
  }
}

function createTransporter() {
  if (transporterOverride) {
    return transporterOverride;
  }

  if (cachedTransporter) {
    return cachedTransporter;
  }

  assertSmtpConfigured();

  const options = {
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
  };

  if (env.smtp.user) {
    options.auth = {
      user: env.smtp.user,
      pass: env.smtp.password,
    };
  }

  cachedTransporter = nodemailer.createTransport(options);
  return cachedTransporter;
}

export function __setMailTransporterForTests(transporter) {
  transporterOverride = transporter;
  cachedTransporter = null;
}

export function __resetMailTransporterForTests() {
  transporterOverride = null;
  cachedTransporter = null;
}

function logSendError(err) {
  const detail = err?.response || err?.message || 'unknown error';
  console.error('Email send failed:', err?.code || 'SMTP', detail);
}

function mapSendError(err) {
  const code = String(err?.code || '');
  const responseCode = Number(err?.responseCode) || 0;
  const message = String(err?.response || err?.message || '');

  if (
    code === 'EAUTH' ||
    responseCode === 535 ||
    /invalid login|authentication failed/i.test(message)
  ) {
    return new HttpError(503, 'Unable to send email because SMTP authentication failed');
  }

  if (
    code === 'ESOCKET' ||
    code === 'ECONNECTION' ||
    code === 'ETIMEDOUT' ||
    code === 'ENOTFOUND' ||
    /connection/i.test(message)
  ) {
    return new HttpError(503, 'Unable to send email because the SMTP connection failed');
  }

  if (/domain is not verified/i.test(message) || /example\.com domain is not verified/i.test(message)) {
    return new HttpError(
      503,
      'Resend rejected the sender address. Use onboarding@resend.dev until a domain is verified.',
    );
  }

  if (/only send testing emails to your own email/i.test(message)) {
    return new HttpError(
      503,
      'Resend is in test mode, so welcome emails can only go to aditya@agreedtechnologies.com. Gmail and other client addresses will not receive mail until coldcreekfarm.com is verified in Resend.',
    );
  }

  return new HttpError(503, 'Unable to send the email');
}

function formattedFrom() {
  const raw = String(env.smtp.from || '').trim() || 'beth.t@example.com';
  const bracket = raw.match(/<([^>]+)>/);
  const address = (bracket ? bracket[1] : raw).trim();

  // Resend testing rejects display names and unverified domains.
  if (/@resend\.dev$/i.test(address)) {
    return address;
  }

  if (raw.includes('<')) {
    return raw;
  }

  return `Cold Creek Farm <${address}>`;
}

function usingResendTestSender() {
  return /@resend\.dev/i.test(formattedFrom());
}

export function shouldCopyOwnerOnEmail() {
  return Boolean(env.smtp.ownerEmail) && !usingResendTestSender() && !/@resend\.dev/i.test(env.smtp.from || '');
}

function ownerBcc(to) {
  if (!shouldCopyOwnerOnEmail()) {
    return undefined;
  }

  const owner = env.smtp.ownerEmail;
  const recipients = Array.isArray(to) ? to : [to];
  const alreadyIncluded = recipients.some(
    (address) => String(address || '').trim().toLowerCase() === owner,
  );

  return alreadyIncluded ? undefined : owner;
}

function usesResend() {
  return /resend\.com/i.test(env.smtp.host);
}

function asAddressList(value) {
  if (!value) {
    return undefined;
  }

  return (Array.isArray(value) ? value : [value]).map((item) => String(item).trim()).filter(Boolean);
}

async function sendViaResendApi(payload) {
  const body = {
    from: formattedFrom(),
    to: asAddressList(payload.to),
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  };

  const cc = asAddressList(payload.cc);
  const bcc = asAddressList(payload.bcc);
  const replyTo = asAddressList(payload.replyTo);

  if (cc?.length) {
    body.cc = cc;
  }
  if (bcc?.length) {
    body.bcc = bcc;
  }
  if (replyTo?.length) {
    body.reply_to = replyTo.length === 1 ? replyTo[0] : replyTo;
  }

  console.log('Sending email', { from: body.from, to: body.to });

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.smtp.password}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('Resend rejected', {
      status: response.status,
      message: data.message,
      name: data.name,
    });
    const err = new Error(data.message || 'Resend rejected the email');
    err.code = 'EMESSAGE';
    err.response = data.message || `Resend HTTP ${response.status}`;
    throw err;
  }

  return { messageId: data.id };
}

export async function sendMail({ to, subject, text, html, cc }) {
  const payload = {
    from: formattedFrom(),
    to,
    subject,
    text,
    html,
    ...(cc ? { cc } : {}),
  };

  const bcc = ownerBcc(payload.to);
  if (bcc) {
    payload.bcc = bcc;
  }

  if (shouldCopyOwnerOnEmail() && env.smtp.replyTo) {
    payload.replyTo = env.smtp.replyTo;
  }

  const send = (mail) => {
    if (transporterOverride) {
      return transporterOverride.sendMail(mail);
    }
    if (usesResend()) {
      return sendViaResendApi(mail);
    }
    return createTransporter().sendMail(mail);
  };

  try {
    return await send(payload);
  } catch (err) {
    const canRetryWithoutOwnerCopy = Boolean(payload.bcc || payload.replyTo);
    if (canRetryWithoutOwnerCopy && String(err?.code || '') === 'EMESSAGE') {
      console.warn('Retrying email without owner copy after SMTP rejection');
      delete payload.bcc;
      delete payload.replyTo;
      try {
        return await send(payload);
      } catch (retryErr) {
        logSendError(retryErr);
        throw mapSendError(retryErr);
      }
    }

    logSendError(err);
    throw mapSendError(err);
  }
}

export async function sendWelcomeClientEmail({
  to,
  firstName,
  lastName,
  username,
  temporaryPassword,
}) {
  const email = buildWelcomeClientEmail({
    firstName,
    lastName,
    username,
    temporaryPassword,
    portalUrl: env.portalUrl,
  });

  await sendMail({
    to,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  return email;
}

export async function sendBookingClientEmail({ kind, to, firstName, lastName, booking }) {
  const email = buildBookingClientEmail({
    kind,
    firstName,
    lastName,
    booking,
    portalUrl: env.portalUrl,
  });

  await sendMail({
    to,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  return email;
}

export async function sendVendorSelectionEmail({
  to,
  category,
  vendorName,
  booking,
  clientName,
}) {
  const email = buildVendorSelectionEmail({
    category,
    vendorName,
    booking,
    clientName,
    portalUrl: env.portalUrl,
  });

  await sendMail({
    to,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  return email;
}
