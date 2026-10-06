import jwt from 'jsonwebtoken';
import { env } from '../config/index.js';
import { HttpError } from './httpError.js';

function getJwtSecret() {
  if (!env.jwt.secret) {
    throw new Error('JWT_SECRET must be set in the environment');
  }
  return env.jwt.secret;
}

export function signAuthToken(user, { rememberMe = false, expiresIn } = {}) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    getJwtSecret(),
    {
      expiresIn: expiresIn || (rememberMe ? env.jwt.rememberExpiresIn : env.jwt.expiresIn),
    },
  );
}

export function verifyAuthToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    throw new HttpError(401, 'Invalid or missing token');
  }
}

export function signVendorReplyToken({ bookingId, category, vendorName }) {
  return jwt.sign(
    {
      purpose: 'vendor-reply',
      bookingId,
      category,
      vendorName,
    },
    getJwtSecret(),
    { expiresIn: '90d' },
  );
}

export function verifyVendorReplyToken(token) {
  let payload;
  try {
    payload = jwt.verify(String(token || ''), getJwtSecret());
  } catch {
    throw new HttpError(400, 'This vendor reply link is invalid or has expired');
  }

  if (payload?.purpose !== 'vendor-reply' || !payload.bookingId || !payload.category) {
    throw new HttpError(400, 'This vendor reply link is invalid or has expired');
  }

  return payload;
}
