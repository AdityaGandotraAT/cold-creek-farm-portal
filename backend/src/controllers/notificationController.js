import {
  countUnreadAdminNotifications,
  listAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
} from '../services/notificationService.js';

export async function getNotifications(req, res, next) {
  try {
    const notifications = await listAdminNotifications({
      status: String(req.query.status || '').trim(),
      type: String(req.query.type || '').trim(),
    });
    const unreadCount = await countUnreadAdminNotifications();
    res.status(200).json({ status: 'ok', notifications, unreadCount });
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCount(_req, res, next) {
  try {
    const unreadCount = await countUnreadAdminNotifications();
    res.status(200).json({ status: 'ok', unreadCount });
  } catch (err) {
    next(err);
  }
}

export async function patchNotificationRead(req, res, next) {
  try {
    const notification = await markAdminNotificationRead(req.params.notificationId);
    const unreadCount = await countUnreadAdminNotifications();
    res.status(200).json({ status: 'ok', notification, unreadCount });
  } catch (err) {
    next(err);
  }
}

export async function postMarkAllRead(_req, res, next) {
  try {
    await markAllAdminNotificationsRead();
    res.status(200).json({ status: 'ok', unreadCount: 0 });
  } catch (err) {
    next(err);
  }
}
