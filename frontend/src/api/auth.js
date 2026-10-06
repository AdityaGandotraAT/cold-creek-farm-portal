import { getSession } from '../auth/session.js';

export async function loginRequest({ email, password, rememberMe }) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, rememberMe }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Unable to sign in');
  }

  return data;
}

export async function forgotPasswordRequest({ email }) {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Unable to send the reset email');
  }

  return data;
}

export async function resetPasswordRequest({ token, newPassword }) {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Unable to reset the password');
  }

  return data;
}

export async function changePasswordRequest({ currentPassword, newPassword }) {
  const session = getSession();

  const response = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: session?.token ? `Bearer ${session.token}` : '',
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Unable to change password');
  }

  return data;
}
