import { seedNotifications } from './notificationsMock.js';

let notifications = seedNotifications.map((item) => ({ ...item }));
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getNotifications() {
  return notifications;
}

export function subscribeNotifications(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function markNotificationRead(id) {
  notifications = notifications.map((item) =>
    item.id === id ? { ...item, status: 'Read' } : item,
  );
  emit();
}

export function markAllNotificationsRead() {
  notifications = notifications.map((item) =>
    item.status === 'Read' ? item : { ...item, status: 'Read' },
  );
  emit();
}
