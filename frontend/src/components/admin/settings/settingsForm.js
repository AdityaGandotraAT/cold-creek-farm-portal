const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireTrimmed(errors, values, field, message) {
  if (!String(values[field] || '').trim()) {
    errors[field] = message;
  }
}

function requireEmail(errors, values, field, emptyMessage) {
  const value = String(values[field] || '').trim();
  if (!value) {
    errors[field] = emptyMessage;
  } else if (!EMAIL_PATTERN.test(value)) {
    errors[field] = 'Enter a valid email address.';
  }
}

export function validateVendorLockSettings(values) {
  const errors = {};
  const raw = String(values.lockDays ?? '').trim();

  if (!raw) {
    errors.lockDays = 'Enter the number of days.';
    return errors;
  }

  const days = Number(raw);
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    errors.lockDays = 'Enter a whole number from 1 to 365.';
  }

  return errors;
}

export function validateProfileSettings(values) {
  const errors = {};
  requireTrimmed(errors, values, 'adminName', 'Enter an admin name.');
  requireEmail(errors, values, 'profileEmail', 'Enter an email address.');
  return errors;
}

export function validatePasswordChange(values) {
  const errors = {};
  requireTrimmed(errors, values, 'currentPassword', 'Enter the current password.');
  requireTrimmed(errors, values, 'newPassword', 'Enter a new password.');
  requireTrimmed(errors, values, 'confirmPassword', 'Confirm the new password.');

  if (!errors.newPassword && values.newPassword.length < 8) {
    errors.newPassword = 'Use at least 8 characters.';
  }

  if (!errors.confirmPassword && values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = 'New password and confirmation must match.';
  }

  return errors;
}
