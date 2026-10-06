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

export async function fetchNotifications(params = {}) {
  const query = new URLSearchParams();
  if (params.status) {
    query.set('status', params.status);
  }
  if (params.type) {
    query.set('type', params.type);
  }
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const response = await fetch(`/api/notifications${suffix}`, {
    headers: authHeaders(),
  });
  return parseResponse(response);
}

export async function fetchUnreadNotificationCount() {
  const response = await fetch('/api/notifications/unread-count', {
    headers: authHeaders(),
  });
  const data = await parseResponse(response);
  return Number(data.unreadCount) || 0;
}

export async function markNotificationReadRequest(id) {
  const response = await fetch(`/api/notifications/${id}/read`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return parseResponse(response);
}

export async function markAllNotificationsReadRequest() {
  const response = await fetch('/api/notifications/mark-all-read', {
    method: 'POST',
    headers: authHeaders(),
  });
  return parseResponse(response);
}
