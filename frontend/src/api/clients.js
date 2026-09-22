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

export async function fetchClients() {
  const response = await fetch('/api/clients', {
    headers: authHeaders(),
  });

  const data = await parseResponse(response);
  return data.clients;
}

export async function fetchClient(clientId) {
  const response = await fetch(`/api/clients/${clientId}`, {
    headers: authHeaders(),
  });

  const data = await parseResponse(response);
  return data.client;
}

export async function createClient(payload) {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function resendClientWelcomeEmail(clientId) {
  const response = await fetch(`/api/clients/${clientId}/resend-welcome`, {
    method: 'POST',
    headers: authHeaders(),
  });

  return parseResponse(response);
}

export async function updateClient(clientId, payload) {
  const response = await fetch(`/api/clients/${clientId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await parseResponse(response);
  return data.client;
}

export async function deleteClient(clientId) {
  const response = await fetch(`/api/clients/${clientId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  const data = await parseResponse(response);
  return data.client;
}
