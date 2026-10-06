import { query } from '../config/database.js';
import { HttpError } from '../utils/httpError.js';
import { configureVendorSelectionLockDays } from '../utils/vendorSelectionLock.js';
import {
  defaultPortalSettings,
  rowToPortalSettings,
  SESSION_TIMEOUT_OPTIONS,
} from '../utils/settingsMapper.js';

let cached = null;
let cachedAt = 0;
const CACHE_MS = 3000;

function applyLockDays(settings) {
  configureVendorSelectionLockDays(settings.vendorLockDays);
  return settings;
}

export async function getPortalSettings({ fresh = false } = {}) {
  if (!fresh && cached && Date.now() - cachedAt < CACHE_MS) {
    return cached;
  }

  const { rows } = await query(
    `SELECT id, vendor_lock_days, email_notifications, client_notifications, vendor_notifications,
            session_timeout, login_security, client_portal_enabled, welcome_email_enabled,
            maintenance_mode, updated_at
     FROM portal_settings
     WHERE id = 1
     LIMIT 1`,
  );

  if (!rows[0]) {
    await query(`INSERT INTO portal_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING`);
    cached = applyLockDays(defaultPortalSettings());
    cachedAt = Date.now();
    return cached;
  }

  cached = applyLockDays(rowToPortalSettings(rows[0]));
  cachedAt = Date.now();
  return cached;
}

export function clearPortalSettingsCache() {
  cached = null;
  cachedAt = 0;
}

export async function updatePortalSettings(input = {}) {
  const current = await getPortalSettings({ fresh: true });
  const next = {
    ...current,
    ...input,
  };

  const lockDays = Number.parseInt(String(next.vendorLockDays), 10);
  if (!Number.isInteger(lockDays) || lockDays < 1 || lockDays > 365) {
    throw new HttpError(400, 'Lock days must be a whole number from 1 to 365');
  }

  if (!SESSION_TIMEOUT_OPTIONS.includes(next.sessionTimeout)) {
    throw new HttpError(400, 'Select a valid session timeout');
  }

  const { rows } = await query(
    `INSERT INTO portal_settings (
       id, vendor_lock_days, email_notifications, client_notifications, vendor_notifications,
       session_timeout, login_security, client_portal_enabled, welcome_email_enabled, maintenance_mode
     )
     VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (id) DO UPDATE SET
       vendor_lock_days = EXCLUDED.vendor_lock_days,
       email_notifications = EXCLUDED.email_notifications,
       client_notifications = EXCLUDED.client_notifications,
       vendor_notifications = EXCLUDED.vendor_notifications,
       session_timeout = EXCLUDED.session_timeout,
       login_security = EXCLUDED.login_security,
       client_portal_enabled = EXCLUDED.client_portal_enabled,
       welcome_email_enabled = EXCLUDED.welcome_email_enabled,
       maintenance_mode = EXCLUDED.maintenance_mode
     RETURNING id, vendor_lock_days, email_notifications, client_notifications, vendor_notifications,
               session_timeout, login_security, client_portal_enabled, welcome_email_enabled,
               maintenance_mode, updated_at`,
    [
      lockDays,
      Boolean(next.emailNotifications),
      Boolean(next.clientNotifications),
      Boolean(next.vendorNotifications),
      next.sessionTimeout,
      Boolean(next.loginSecurity),
      Boolean(next.clientPortalEnabled),
      Boolean(next.welcomeEmailEnabled),
      Boolean(next.maintenanceMode),
    ],
  );

  cached = applyLockDays(rowToPortalSettings(rows[0]));
  cachedAt = Date.now();
  return cached;
}
