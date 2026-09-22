import { query } from '../config/database.js';
import { HttpError } from '../utils/httpError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAuthToken } from '../utils/token.js';
import { toPublicUser } from '../utils/toPublicUser.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USER_COLUMNS = `id, first_name, last_name, email, password_hash, role, status,
  must_change_password, created_at, updated_at`;

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

  const passwordMatches = await verifyPassword(normalizedPassword, user.password_hash);

  if (!passwordMatches) {
    throw new HttpError(401, 'Invalid email or password');
  }

  if (user.status !== 'active') {
    throw new HttpError(403, 'Account is inactive');
  }

  const token = signAuthToken(user, { rememberMe: Boolean(rememberMe) });

  return {
    token,
    user: toPublicUser(user),
  };
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
