import crypto from 'node:crypto';
import { query } from '../config/database.js';
import { env } from '../config/index.js';
import { HttpError } from '../utils/httpError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAuthToken } from '../utils/token.js';
import { toPublicUser } from '../utils/toPublicUser.js';
import { getPortalSettings } from './settingsService.js';
import { sendPasswordResetEmail } from './emailService.js';
import { sessionTimeoutToJwt } from '../utils/settingsMapper.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USER_COLUMNS = `id, first_name, last_name, email, password_hash, role, status,
  must_change_password, phone, failed_login_attempts, locked_until, created_at, updated_at`;

export async function findUserByEmail(email) {
  const result = await query(
    `SELECT ${USER_COLUMNS}
     FROM users
     WHERE LOWER(email) = LOWER($1)
     LIMIT 1`,
    [email],
  );

  return result.rows[0] || null;
}

export async function findUserById(id) {
  const result = await query(
    `SELECT ${USER_COLUMNS}
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  return result.rows[0] || null;
}

export async function createUser({
  firstName,
  lastName,
  email,
  password,
  role,
  status = 'active',
  mustChangePassword = false,
  db = { query },
}) {
  const passwordHash = await hashPassword(password);
  const result = await db.query(
    `INSERT INTO users (
       first_name, last_name, email, password_hash, role, status, must_change_password
     )
     VALUES ($1, $2, LOWER($3), $4, $5, $6, $7)
     RETURNING id, first_name, last_name, email, role, status, must_change_password,
               created_at, updated_at`,
    [firstName, lastName, email, passwordHash, role, status, Boolean(mustChangePassword)],
  );

  return result.rows[0];
}

export async function login({ email, password, rememberMe = false }) {
  if (!email || !password) {
    throw new HttpError(400, 'Email and password are required');
  }

  const normalizedEmail = String(email).trim();
  const normalizedPassword = String(password);

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    throw new HttpError(400, 'Enter a valid email address');
  }

  if (!normalizedPassword) {
    throw new HttpError(400, 'Email and password are required');
  }

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const settings = await getPortalSettings();
  if (settings.loginSecurity && user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
    throw new HttpError(403, 'Account is temporarily locked. Try again in 15 minutes.');
  }

  const passwordMatches = await verifyPassword(normalizedPassword, user.password_hash);

  if (!passwordMatches) {
    if (settings.loginSecurity) {
      await recordFailedLogin(user);
    }
    throw new HttpError(401, 'Invalid email or password');
  }

  if (user.status !== 'active') {
    throw new HttpError(403, 'Account is inactive');
  }

  if (user.role === 'CLIENT') {
    if (settings.maintenanceMode) {
      throw new HttpError(503, 'The portal is under maintenance. Please try again later.');
    }
    if (!settings.clientPortalEnabled) {
      throw new HttpError(403, 'The client portal is currently disabled');
    }
  }

  await query(
    `UPDATE users
     SET failed_login_attempts = 0,
         locked_until = NULL
     WHERE id = $1`,
    [user.id],
  );

  const expiresIn = rememberMe ? env.jwt.rememberExpiresIn : sessionTimeoutToJwt(settings.sessionTimeout);
  const token = signAuthToken(user, { rememberMe: Boolean(rememberMe), expiresIn });

  return {
    token,
    user: toPublicUser(user),
    sessionTimeout: settings.sessionTimeout,
    rememberMe: Boolean(rememberMe),
  };
}

async function recordFailedLogin(user) {
  const attempts = Number(user.failed_login_attempts) || 0;
  const nextAttempts = attempts + 1;
  const lockedUntil = nextAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
  await query(
    `UPDATE users
     SET failed_login_attempts = $2,
         locked_until = $3
     WHERE id = $1`,
    [user.id, nextAttempts, lockedUntil],
  );
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  if (!currentPassword || !newPassword) {
    throw new HttpError(400, 'Current password and new password are required');
  }

  const current = String(currentPassword);
  const next = String(newPassword);

  if (next.length < 10) {
    throw new HttpError(400, 'New password must be at least 10 characters');
  }

  if (next === current) {
    throw new HttpError(400, 'New password must be different from the current password');
  }

  const user = await findUserById(userId);
  if (!user || user.status !== 'active') {
    throw new HttpError(401, 'Invalid or missing token');
  }

  const matches = await verifyPassword(current, user.password_hash);
  if (!matches) {
    throw new HttpError(400, 'Current password is incorrect');
  }

  const passwordHash = await hashPassword(next);
  const result = await query(
    `UPDATE users
     SET password_hash = $2,
         must_change_password = FALSE
     WHERE id = $1
     RETURNING ${USER_COLUMNS}`,
    [userId, passwordHash],
  );

  return toPublicUser(result.rows[0]);
}

export async function updateAdminProfile(userId, input = {}) {
  const fullName = String(input.adminName || '').trim();
  const email = String(input.email || input.profileEmail || '').trim().toLowerCase();
  const phone = String(input.phone || input.profilePhone || '').trim();

  if (!fullName) {
    throw new HttpError(400, 'Enter an admin name');
  }
  if (!email || !EMAIL_PATTERN.test(email)) {
    throw new HttpError(400, 'Enter a valid email address');
  }

  const parts = fullName.split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');

  const existing = await findUserByEmail(email);
  if (existing && String(existing.id) !== String(userId)) {
    throw new HttpError(409, 'That email is already in use');
  }

  const result = await query(
    `UPDATE users
     SET first_name = $2,
         last_name = $3,
         email = $4,
         phone = $5
     WHERE id = $1
     RETURNING ${USER_COLUMNS}`,
    [userId, firstName, lastName, email, phone],
  );

  if (!result.rows[0]) {
    throw new HttpError(404, 'User not found');
  }

  return toPublicUser(result.rows[0]);
}

const RESET_MESSAGE = 'If an account exists for that email, a reset link is on its way.';
const RESET_WINDOW_MS = 60 * 60 * 1000;

function hashResetToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

export async function requestPasswordReset(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !EMAIL_PATTERN.test(normalizedEmail)) {
    throw new HttpError(400, 'Enter a valid email address');
  }

  const user = await findUserByEmail(normalizedEmail);
  if (!user || user.status !== 'active') {
    return { message: RESET_MESSAGE };
  }

  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + RESET_WINDOW_MS);
  await query(
    `UPDATE users
     SET password_reset_token_hash = $2,
         password_reset_expires_at = $3
     WHERE id = $1`,
    [user.id, hashResetToken(token), expiresAt],
  );

  const resetUrl = `${env.portalUrl}/reset-password?token=${encodeURIComponent(token)}`;

  try {
    await sendPasswordResetEmail({
      to: user.email,
      firstName: user.first_name,
      resetUrl,
    });
  } catch (err) {
    await query(
      `UPDATE users
       SET password_reset_token_hash = NULL,
           password_reset_expires_at = NULL
       WHERE id = $1`,
      [user.id],
    );
    throw err;
  }

  return { message: RESET_MESSAGE };
}

export async function resetPasswordWithToken({ token, newPassword }) {
  const rawToken = String(token || '').trim();
  const next = String(newPassword || '');

  if (!rawToken) {
    throw new HttpError(400, 'This reset link is invalid or has expired');
  }

  if (next.length < 10) {
    throw new HttpError(400, 'New password must be at least 10 characters');
  }

  const { rows } = await query(
    `SELECT id, password_hash
     FROM users
     WHERE password_reset_token_hash = $1
       AND password_reset_expires_at > NOW()
       AND status = 'active'
     LIMIT 1`,
    [hashResetToken(rawToken)],
  );

  const user = rows[0];
  if (!user) {
    throw new HttpError(400, 'This reset link is invalid or has expired');
  }

  const same = await verifyPassword(next, user.password_hash);
  if (same) {
    throw new HttpError(400, 'New password must be different from the current password');
  }

  const passwordHash = await hashPassword(next);
  const updated = await query(
    `UPDATE users
     SET password_hash = $2,
         must_change_password = FALSE,
         failed_login_attempts = 0,
         locked_until = NULL,
         password_reset_token_hash = NULL,
         password_reset_expires_at = NULL
     WHERE id = $1
       AND password_reset_token_hash = $3
     RETURNING id`,
    [user.id, passwordHash, hashResetToken(rawToken)],
  );

  if (!updated.rows[0]) {
    throw new HttpError(400, 'This reset link is invalid or has expired');
  }

  return { message: 'Password updated. Sign in with your new password.' };
}
