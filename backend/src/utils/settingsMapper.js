export const SESSION_TIMEOUT_OPTIONS = ['15 minutes', '30 minutes', '1 hour', '4 hours'];

export function rowToPortalSettings(row) {
  if (!row) {
    return defaultPortalSettings();
  }

  return {
    vendorLockDays: Number(row.vendor_lock_days) || 90,
    emailNotifications: row.email_notifications !== false,
    clientNotifications: row.client_notifications !== false,
    vendorNotifications: Boolean(row.vendor_notifications),
    sessionTimeout: SESSION_TIMEOUT_OPTIONS.includes(row.session_timeout)
      ? row.session_timeout
      : '30 minutes',
    loginSecurity: row.login_security !== false,
    clientPortalEnabled: row.client_portal_enabled !== false,
    welcomeEmailEnabled: row.welcome_email_enabled !== false,
    maintenanceMode: Boolean(row.maintenance_mode),
    updatedAt: row.updated_at,
  };
}

export function defaultPortalSettings() {
  return {
    vendorLockDays: 90,
    emailNotifications: true,
    clientNotifications: true,
    vendorNotifications: false,
    sessionTimeout: '30 minutes',
    loginSecurity: true,
    clientPortalEnabled: true,
    welcomeEmailEnabled: true,
    maintenanceMode: false,
  };
}

export function publicPortalSettings(settings) {
  return {
    maintenanceMode: Boolean(settings.maintenanceMode),
    clientPortalEnabled: settings.clientPortalEnabled !== false,
  };
}

export function sessionTimeoutToJwt(label) {
  if (label === '15 minutes') {
    return '15m';
  }
  if (label === '1 hour') {
    return '1h';
  }
  if (label === '4 hours') {
    return '4h';
  }
  return '30m';
}

export function sessionTimeoutToMs(label) {
  if (label === '15 minutes') {
    return 15 * 60 * 1000;
  }
  if (label === '1 hour') {
    return 60 * 60 * 1000;
  }
  if (label === '4 hours') {
    return 4 * 60 * 60 * 1000;
  }
  return 30 * 60 * 1000;
}
