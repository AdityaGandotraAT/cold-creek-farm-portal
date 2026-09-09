import jwt from 'jsonwebtoken';
import { env } from '../config/index.js';
import { HttpError } from './httpError.js';

function getJwtSecret() {
  if (!env.jwt.secret) {
    throw new Error('JWT_SECRET must be set in the environment');
  }
  return env.jwt.secret;
}

export function signAuthToken(user, { rememberMe = false } = {}) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    getJwtSecret(),
    {
      expiresIn: rememberMe ? env.jwt.rememberExpiresIn : env.jwt.expiresIn,
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
