import { query } from '../config/database.js';
import { HttpError } from '../utils/httpError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAuthToken } from '../utils/token.js';
import { toPublicUser } from '../utils/toPublicUser.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function findUserByEmail(email) {
  const result = await query(
    `SELECT id, first_name, last_name, email, password_hash, role, status, created_at, updated_at
     FROM users
     WHERE LOWER(email) = LOWER($1)
     LIMIT 1`,
    [email],
  );

  return result.rows[0] || null;
}

export async function findUserById(id) {
  const result = await query(
    `SELECT id, first_name, last_name, email, password_hash, role, status, created_at, updated_at
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
}) {
  const passwordHash = await hashPassword(password);
  const result = await query(
    `INSERT INTO users (first_name, last_name, email, password_hash, role, status)
     VALUES ($1, $2, LOWER($3), $4, $5, $6)
     RETURNING id, first_name, last_name, email, role, status, created_at, updated_at`,
    [firstName, lastName, email, passwordHash, role, status],
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
