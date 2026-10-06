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

export async function fetchVendors() {
  const response = await fetch('/api/vendors', {
    headers: authHeaders(),
  });
  const data = await parseResponse(response);
  return data.vendors;
}

export async function fetchVendor(vendorId) {
  const response = await fetch(`/api/vendors/${vendorId}`, {
    headers: authHeaders(),
  });
  const data = await parseResponse(response);
  return data.vendor;
}

export async function createVendor(payload) {
  const response = await fetch('/api/vendors', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseResponse(response);
  return data.vendor;
}

export async function updateVendorRequest(vendorId, payload) {
  const response = await fetch(`/api/vendors/${vendorId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseResponse(response);
  return data.vendor;
}

export async function deleteVendorRequest(vendorId) {
  const response = await fetch(`/api/vendors/${vendorId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await parseResponse(response);
  return data.vendor;
}
