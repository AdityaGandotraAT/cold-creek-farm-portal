import { query, withTransaction } from '../config/database.js';
import { createUser, findUserByEmail } from './authService.js';
import { sendWelcomeClientEmail } from './emailService.js';
import { getPortalSettings } from './settingsService.js';
import { HttpError } from '../utils/httpError.js';
import { clientInputFromBody, rowToClient } from '../utils/clientMapper.js';
import { hashPassword } from '../utils/password.js';
import { generateTemporaryPassword } from '../utils/temporaryPassword.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_FAILED_MESSAGE =
  'Client created, but the welcome email could not be sent. You can resend it from the client record.';

function validateClientInput(input) {
  const errors = [];

  if (!input.firstName?.trim()) {
    errors.push('firstName');
  }
  if (!input.lastName?.trim()) {
    errors.push('lastName');
  }
  if (!input.email?.trim()) {
    errors.push('email');
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.push('email');
  }
  if (!input.primaryPhone?.trim()) {
    errors.push('primaryPhone');
  }
  if (!input.address?.trim()) {
    errors.push('address');
  }
  if (!input.city?.trim()) {
    errors.push('city');
  }
  if (!input.state?.trim()) {
    errors.push('state');
  }
  if (!input.zipCode?.trim()) {
    errors.push('zipCode');
  }
  if (!input.country?.trim()) {
    errors.push('country');
  }

  if (errors.length > 0) {
    throw new HttpError(400, 'Invalid client data');
  }
}

async function nextReferenceNumber(db = { query }) {
  const year = new Date().getFullYear();
  const prefix = `CCF-${year}-`;
  const { rows } = await db.query(
    `SELECT reference_number
     FROM clients
     WHERE reference_number LIKE $1
     ORDER BY reference_number DESC
     LIMIT 1`,
    [`${prefix}%`],
  );

  let next = 1001;
  if (rows[0]?.reference_number) {
    const suffix = rows[0].reference_number.slice(prefix.length);
    const parsed = Number.parseInt(suffix, 10);
    if (!Number.isNaN(parsed)) {
      next = parsed + 1;
    }
  }

  return `${prefix}${next}`;
}

function insertValues(input) {
  return [
    input.firstName.trim(),
    input.lastName.trim(),
    input.email.trim().toLowerCase(),
    input.birthDate || null,
    input.primaryPhone.trim(),
    input.secondaryPhone?.trim() || null,
    input.address.trim(),
    input.city.trim(),
    input.state.trim(),
    input.zipCode.trim(),
    input.country.trim(),
    input.facebookUrl?.trim() || null,
    input.twitterUrl?.trim() || null,
    input.googlePlusUrl?.trim() || null,
  ];
}

function isUniqueViolation(err) {
  return err.code === '23505';
}

async function assertEmailAvailable(email, { excludeClientId = null, db = { query } } = {}) {
  const normalized = String(email).trim().toLowerCase();

  const existingUser = await findUserByEmail(normalized);
  if (existingUser) {
    if (!excludeClientId) {
      throw new HttpError(409, 'A client with this email already exists');
    }

    const { rows } = await db.query(
      `SELECT id FROM clients WHERE user_id = $1 LIMIT 1`,
      [existingUser.id],
    );
    if (!rows[0] || String(rows[0].id) !== String(excludeClientId)) {
      throw new HttpError(409, 'A client with this email already exists');
    }
  }

  const { rows: clientRows } = await db.query(
    `SELECT id FROM clients WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [normalized],
  );

  if (clientRows[0] && String(clientRows[0].id) !== String(excludeClientId || '')) {
    throw new HttpError(409, 'A client with this email already exists');
  }
}

export async function listClients() {
  const { rows } = await query(
    `SELECT *
     FROM clients
     ORDER BY created_at DESC`,
  );

  return rows.map(rowToClient);
}

export async function getClientById(id) {
  const { rows } = await query('SELECT * FROM clients WHERE id = $1', [id]);
  return rowToClient(rows[0]);
}

export async function getClientByUserId(userId) {
  const { rows } = await query(
    'SELECT * FROM clients WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
    [userId],
  );
  return rowToClient(rows[0]);
}

export async function createClient(body) {
  const input = clientInputFromBody(body);
  validateClientInput(input);

  const email = input.email.trim().toLowerCase();
  await assertEmailAvailable(email);

  let temporaryPassword;
  try {
    temporaryPassword = generateTemporaryPassword();
  } catch {
    throw new HttpError(500, 'Unable to generate a temporary password');
  }

  if (!temporaryPassword) {
    throw new HttpError(500, 'Unable to generate a temporary password');
  }

  let created;
  try {
    created = await withTransaction(async (db) => {
      const user = await createUser({
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email,
        password: temporaryPassword,
        role: 'CLIENT',
        status: 'active',
        mustChangePassword: true,
        db,
      });

      const referenceNumber = await nextReferenceNumber(db);
      const { rows } = await db.query(
        `INSERT INTO clients (
           reference_number,
           first_name,
           last_name,
           email,
           birth_date,
           primary_phone,
           secondary_phone,
           address,
           city,
           state,
           zip_code,
           country,
           facebook_url,
           twitter_url,
           google_plus_url,
           user_id
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         RETURNING *`,
        [referenceNumber, ...insertValues(input), user.id],
      );

      return rowToClient(rows[0]);
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new HttpError(409, 'A client with this email already exists');
    }
    throw err;
  }

  try {
    const settings = await getPortalSettings();
    if (!settings.welcomeEmailEnabled || !settings.clientNotifications) {
      return {
        client: created,
        emailSent: false,
        temporaryPassword,
        message: 'Client created. Welcome email is turned off in Settings.',
      };
    }

    await sendWelcomeClientEmail({
      to: email,
      firstName: created.firstName,
      lastName: created.lastName,
      username: email,
      temporaryPassword,
    });

    await query(
      `UPDATE clients
       SET welcome_email_sent_at = NOW()
       WHERE id = $1`,
      [created.id],
    );

    const refreshed = await getClientById(created.id);
    return {
      client: refreshed,
      emailSent: true,
      message: 'Client created and welcome email sent',
    };
  } catch (err) {
    console.error('Welcome email failed after client create:', err.message);
    return {
      client: created,
      emailSent: false,
      temporaryPassword,
      message: err.message ? `${EMAIL_FAILED_MESSAGE} ${err.message}` : EMAIL_FAILED_MESSAGE,
    };
  }
}

export async function resendClientWelcomeEmail(clientId) {
  const existing = await getClientById(clientId);
  if (!existing) {
    throw new HttpError(404, 'Client not found');
  }

  if (!existing.userId) {
    throw new HttpError(400, 'This client does not have a portal login account');
  }

  const settings = await getPortalSettings();
  if (!settings.welcomeEmailEnabled || !settings.clientNotifications) {
    throw new HttpError(400, 'Welcome emails are turned off in Settings');
  }

  let temporaryPassword;
  try {
    temporaryPassword = generateTemporaryPassword();
  } catch {
    throw new HttpError(500, 'Unable to generate a temporary password');
  }

  const passwordHash = await hashPassword(temporaryPassword);

  await query(
    `UPDATE users
     SET password_hash = $2,
         must_change_password = TRUE,
         first_name = $3,
         last_name = $4,
         email = LOWER($5)
     WHERE id = $1`,
    [existing.userId, passwordHash, existing.firstName, existing.lastName, existing.email],
  );

  try {
    await sendWelcomeClientEmail({
      to: existing.email,
      firstName: existing.firstName,
      lastName: existing.lastName,
      username: existing.email,
      temporaryPassword,
    });
  } catch (err) {
    console.error('Welcome email failed after resend:', err.message);
    return {
      client: existing,
      emailSent: false,
      temporaryPassword,
      message: err.message ? `${EMAIL_FAILED_MESSAGE} ${err.message}` : EMAIL_FAILED_MESSAGE,
    };
  }

  const { rows } = await query(
    `UPDATE clients
     SET welcome_email_sent_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [clientId],
  );

  return {
    client: rowToClient(rows[0]),
    emailSent: true,
    message: 'Welcome email resent',
  };
}

export async function updateClient(id, body) {
  const existing = await getClientById(id);
  if (!existing) {
    throw new HttpError(404, 'Client not found');
  }

  const input = clientInputFromBody(body);
  validateClientInput(input);
  await assertEmailAvailable(input.email, { excludeClientId: id });

  try {
    const rows = await withTransaction(async (db) => {
      const updated = await db.query(
        `UPDATE clients
         SET first_name = $2,
             last_name = $3,
             email = $4,
             birth_date = $5,
             primary_phone = $6,
             secondary_phone = $7,
             address = $8,
             city = $9,
             state = $10,
             zip_code = $11,
             country = $12,
             facebook_url = $13,
             twitter_url = $14,
             google_plus_url = $15
         WHERE id = $1
         RETURNING *`,
        [id, ...insertValues(input)],
      );

      if (existing.userId) {
        await db.query(
          `UPDATE users
           SET first_name = $2,
               last_name = $3,
               email = LOWER($4)
           WHERE id = $1`,
          [existing.userId, input.firstName.trim(), input.lastName.trim(), input.email.trim()],
        );
      }

      return updated.rows;
    });

    return rowToClient(rows[0]);
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new HttpError(409, 'A client with this email already exists');
    }
    throw err;
  }
}

export async function deleteClient(id) {
  const existing = await getClientById(id);
  if (!existing) {
    throw new HttpError(404, 'Client not found');
  }

  await withTransaction(async (db) => {
    await db.query('DELETE FROM clients WHERE id = $1', [id]);

    if (existing.userId) {
      await db.query(
        `DELETE FROM users
         WHERE id = $1
           AND role = 'CLIENT'`,
        [existing.userId],
      );
    }
  });

  return existing;
}
