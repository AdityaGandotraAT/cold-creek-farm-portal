import { getSession } from '../auth/session.js';

function authHeaders() {
  const session = getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: session?.token ? `Bearer ${session.token}` : '',
  };
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export async function fetchPublicSettings() {
  const response = await fetch('/api/settings/public');
  const data = await parseResponse(response);
  return data.settings;
}

export async function fetchSettings() {
  const response = await fetch('/api/settings', { headers: authHeaders() });
  const data = await parseResponse(response);
  return data.settings;
}

export async function saveSettingsRequest(payload) {
  const response = await fetch('/api/settings', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseResponse(response);
  return data.settings;
}

export async function saveProfileRequest(payload) {
  const response = await fetch('/api/settings/profile', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}
