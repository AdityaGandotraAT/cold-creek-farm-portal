import dns from 'node:dns/promises';
import net from 'node:net';
import nodemailer from 'nodemailer';
import { env } from '../config/index.js';
import { HttpError } from '../utils/httpError.js';
import { buildWelcomeClientEmail } from '../emails/welcomeClientEmail.js';
import { buildBookingClientEmail } from '../emails/bookingClientEmail.js';
import { buildVendorSelectionEmail } from '../emails/vendorSelectionEmail.js';
import { buildVendorReplyClientEmail } from '../emails/vendorReplyClientEmail.js';
import { buildPasswordResetEmail } from '../emails/passwordResetEmail.js';
import { getPortalSettings } from './settingsService.js';

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

async function ipv4Host(hostname) {
  if (!hostname || net.isIP(hostname)) {
    return hostname;
  }

  try {
    const addresses = await dns.resolve4(hostname);
    if (addresses[0]) {
      return addresses[0];
    }
  } catch {
    // Fall through to a single-family lookup.
  }

  const lookedUp = await dns.lookup(hostname, { family: 4 });
  return lookedUp.address;
}

function resetTransporter() {
  cachedTransporter = null;
}

async function createTransporter() {
  if (transporterOverride) {
    return transporterOverride;
  }

  if (cachedTransporter) {
    return cachedTransporter;
  }

  assertSmtpConfigured();

  const hostname = env.smtp.host;
  const secure = env.smtp.secure || env.smtp.port === 465;
  const options = {
    host: await ipv4Host(hostname),
    port: env.smtp.port,
    secure,
    requireTLS: !secure,
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 15000,
    tls: {
      minVersion: 'TLSv1.2',
      servername: hostname,
    },
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

export function getEmailStatus() {
  return {
    configured: smtpConfigured(),
    host: env.smtp.host || null,
    port: env.smtp.port,
    from: env.smtp.from || null,
    user: env.smtp.user || null,
    hasPassword: Boolean(env.smtp.password),
    provider: usesResend() ? 'resend' : /gmail/i.test(env.smtp.host || '') ? 'gmail' : 'smtp',
  };
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

  let copyOwner = shouldCopyOwnerOnEmail();
  try {
    const settings = await getPortalSettings();
    copyOwner = copyOwner && settings.emailNotifications;
  } catch {
    // Keep the default owner-copy behavior if settings cannot be read.
  }

  const bcc = copyOwner ? ownerBcc(payload.to) : undefined;
  if (bcc) {
    payload.bcc = bcc;
  }

  if (copyOwner && env.smtp.replyTo) {
    payload.replyTo = env.smtp.replyTo;
  }

  const send = async (mail) => {
    console.log('Sending email', {
      provider: usesResend() ? 'resend' : env.smtp.host,
      from: mail.from,
      to: mail.to,
    });
    if (transporterOverride) {
      return transporterOverride.sendMail(mail);
    }
    if (usesResend()) {
      return sendViaResendApi(mail);
    }
    const transporter = await createTransporter();
    return transporter.sendMail(mail);
  };

  try {
    return await send(payload);
  } catch (err) {
    const connectionFailed = ['ESOCKET', 'ECONNECTION', 'ETIMEDOUT', 'ENETUNREACH', 'EHOSTUNREACH'].includes(
      String(err?.code || ''),
    );
    if (connectionFailed && !transporterOverride && !usesResend()) {
      resetTransporter();
      try {
        return await send(payload);
      } catch (retryErr) {
        logSendError(retryErr);
        throw mapSendError(retryErr);
      }
    }
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
  internalOnly = false,
  acceptUrl = '',
  unavailableUrl = '',
}) {
  const email = buildVendorSelectionEmail({
    category,
    vendorName,
    booking,
    clientName,
    portalUrl: env.portalUrl,
    internalOnly,
    acceptUrl,
    unavailableUrl,
  });

  await sendMail({
    to,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  return email;
}

export async function sendPasswordResetEmail({ to, firstName, resetUrl }) {
  const email = buildPasswordResetEmail({
    firstName,
    resetUrl,
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

export async function sendVendorReplyClientEmail({
  to,
  kind,
  firstName,
  lastName,
  vendorName,
  category,
  booking,
}) {
  const email = buildVendorReplyClientEmail({
    kind,
    firstName,
    lastName,
    vendorName,
    category,
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
