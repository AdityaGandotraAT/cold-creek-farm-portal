import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsReadRequest,
  markNotificationReadRequest,
} from '../api/notifications.js';

let notifications = [];
let unreadCount = 0;
let loading = false;
let error = '';
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getNotifications() {
  return notifications;
}

export function getNotificationsUnreadCount() {
  return unreadCount;
}

export function getNotificationsLoading() {
  return loading;
}

export function getNotificationsError() {
  return error;
}

export function subscribeNotifications(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function loadNotifications() {
  loading = true;
  error = '';
  emit();

  try {
    const data = await fetchNotifications();
    notifications = data.notifications || [];
    unreadCount = Number(data.unreadCount) || 0;
  } catch (err) {
    error = err.message || 'Unable to load notifications';
    notifications = [];
    unreadCount = 0;
  } finally {
    loading = false;
    emit();
  }

  return notifications;
}

export async function refreshUnreadNotificationCount() {
  try {
    unreadCount = await fetchUnreadNotificationCount();
    emit();
  } catch {
    unreadCount = 0;
    emit();
  }

  return unreadCount;
}

export async function markNotificationRead(id) {
  const data = await markNotificationReadRequest(id);
  const updated = data.notification;
  notifications = notifications.map((item) => (item.id === id ? updated : item));
  unreadCount = Number(data.unreadCount) || 0;
  emit();
  return updated;
}

export async function markAllNotificationsRead() {
  await markAllNotificationsReadRequest();
  notifications = notifications.map((item) =>
    item.status === 'Read' ? item : { ...item, status: 'Read' },
  );
  unreadCount = 0;
  emit();
}
