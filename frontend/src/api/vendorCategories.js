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

export async function fetchVendorCategories() {
  const response = await fetch('/api/vendor-categories', {
    headers: authHeaders(),
  });
  const data = await parseResponse(response);
  return data.categories;
}

export async function fetchVendorCategory(categoryId) {
  const response = await fetch(`/api/vendor-categories/${categoryId}`, {
    headers: authHeaders(),
  });
  const data = await parseResponse(response);
  return data.category;
}

export async function fetchVendorSelectionOverview() {
  const response = await fetch('/api/vendor-categories/overview', {
    headers: authHeaders(),
  });
  const data = await parseResponse(response);
  return data.categories;
}

export async function createVendorCategory(payload) {
  const response = await fetch('/api/vendor-categories', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseResponse(response);
  return data.category;
}

export async function updateVendorCategoryRequest(categoryId, payload) {
  const response = await fetch(`/api/vendor-categories/${categoryId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseResponse(response);
  return data.category;
}
