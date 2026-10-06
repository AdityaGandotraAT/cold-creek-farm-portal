import {
  fetchMyNotifications,
  fetchMyUnreadNotificationCount,
  markAllMyNotificationsRead,
  markMyNotificationRead,
} from '../api/clientPortal.js';

let notifications = [];
let unreadCount = 0;
let loading = false;
let error = '';
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getClientNotifications() {
  return notifications;
}

export function getClientNotificationsUnreadCount() {
  return unreadCount;
}

export function getClientNotificationsLoading() {
  return loading;
}

export function getClientNotificationsError() {
  return error;
}

export function subscribeClientNotifications(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function loadClientNotifications() {
  loading = true;
  error = '';
  emit();

  try {
    const data = await fetchMyNotifications();
    notifications = data.notifications || [];
    unreadCount = Number(data.unreadCount) || 0;
  } catch (err) {
    error = err.message || 'Unable to load notifications';
    notifications = [];
  } finally {
    loading = false;
    emit();
  }

  return notifications;
}

export async function refreshClientUnreadCount() {
  try {
    unreadCount = await fetchMyUnreadNotificationCount();
    emit();
  } catch {
    unreadCount = 0;
    emit();
  }

  return unreadCount;
}

export async function markClientNotificationRead(id) {
  const data = await markMyNotificationRead(id);
  notifications = notifications.map((item) =>
    item.id === id ? data.notification : item,
  );
  unreadCount = Number(data.unreadCount) || 0;
  emit();
  return data.notification;
}

export async function markAllClientNotificationsRead() {
  const data = await markAllMyNotificationsRead();
  notifications = notifications.map((item) => ({ ...item, status: 'Read' }));
  unreadCount = Number(data.unreadCount) || 0;
  emit();
}
