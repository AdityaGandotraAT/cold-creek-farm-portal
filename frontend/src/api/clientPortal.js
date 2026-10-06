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

export async function fetchMyBooking() {
  const response = await fetch('/api/client/booking', {
    headers: authHeaders(),
  });
  const data = await parseResponse(response);
  return data.booking || null;
}

export async function fetchMyVendorSelections() {
  const response = await fetch('/api/client/vendor-selections', {
    headers: authHeaders(),
  });
  return parseResponse(response);
}

export async function fetchMyAccount() {
  const response = await fetch('/api/client/account', {
    headers: authHeaders(),
  });
  const data = await parseResponse(response);
  return data.profile;
}

export async function fetchMyNotifications() {
  const response = await fetch('/api/client/notifications', {
    headers: authHeaders(),
  });
  return parseResponse(response);
}

export async function fetchMyUnreadNotificationCount() {
  const response = await fetch('/api/client/notifications/unread-count', {
    headers: authHeaders(),
  });
  const data = await parseResponse(response);
  return Number(data.unreadCount) || 0;
}

export async function markMyNotificationRead(id) {
  const response = await fetch(`/api/client/notifications/${id}/read`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return parseResponse(response);
}

export async function markAllMyNotificationsRead() {
  const response = await fetch('/api/client/notifications/mark-all-read', {
    method: 'POST',
    headers: authHeaders(),
  });
  return parseResponse(response);
}

export async function saveMyVendorSelection(payload) {
  const response = await fetch('/api/client/vendor-selections', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}
