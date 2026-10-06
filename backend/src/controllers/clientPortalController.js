import { getClientByUserId } from '../services/clientService.js';
import {
  getBookingForUser,
  getClientVendorWorkspace,
  saveClientVendorSelection,
} from '../services/bookingService.js';
import {
  countUnreadClientNotificationsForUser,
  listClientNotificationsForUser,
  markAllClientNotificationsReadForUser,
  markClientNotificationReadForUser,
} from '../services/notificationService.js';

export async function getMyBooking(req, res, next) {
  try {
    const booking = await getBookingForUser(req.user.id);
    res.status(200).json({ status: 'ok', booking });
  } catch (err) {
    next(err);
  }
}

export async function getMyVendorSelections(req, res, next) {
  try {
    const result = await getClientVendorWorkspace(req.user.id);
    res.status(200).json({ status: 'ok', ...result });
  } catch (err) {
    next(err);
  }
}

export async function getMyAccount(req, res, next) {
  try {
    const client = await getClientByUserId(req.user.id);
    const profile = client
      ? {
          name: client.name,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          primaryPhone: client.primaryPhone || '',
          secondaryPhone: client.secondaryPhone || '',
          address: client.address || '',
          city: client.city || '',
          state: client.state || '',
          zipCode: client.zipCode || '',
          country: client.country || '',
          referenceNumber: client.referenceNumber || '',
        }
      : {
          name: [req.user.first_name, req.user.last_name].filter(Boolean).join(' '),
          firstName: req.user.first_name || '',
          lastName: req.user.last_name || '',
          email: req.user.email || '',
          primaryPhone: req.user.phone || '',
          secondaryPhone: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          referenceNumber: '',
        };

    res.status(200).json({ status: 'ok', profile });
  } catch (err) {
    next(err);
  }
}

export async function getMyNotifications(req, res, next) {
  try {
    const notifications = await listClientNotificationsForUser(req.user.id);
    const unreadCount = await countUnreadClientNotificationsForUser(req.user.id);
    res.status(200).json({ status: 'ok', notifications, unreadCount });
  } catch (err) {
    next(err);
  }
}

export async function getMyNotificationUnreadCount(req, res, next) {
  try {
    const unreadCount = await countUnreadClientNotificationsForUser(req.user.id);
    res.status(200).json({ status: 'ok', unreadCount });
  } catch (err) {
    next(err);
  }
}

export async function patchMyNotificationRead(req, res, next) {
  try {
    const notification = await markClientNotificationReadForUser(
      req.user.id,
      req.params.notificationId,
    );
    const unreadCount = await countUnreadClientNotificationsForUser(req.user.id);
    res.status(200).json({ status: 'ok', notification, unreadCount });
  } catch (err) {
    next(err);
  }
}

export async function postMyNotificationsRead(req, res, next) {
  try {
    const result = await markAllClientNotificationsReadForUser(req.user.id);
    res.status(200).json({ status: 'ok', unreadCount: result.unreadCount });
  } catch (err) {
    next(err);
  }
}

export async function putMyVendorSelection(req, res, next) {
  try {
    const result = await saveClientVendorSelection(req.user.id, req.body || {});
    res.status(200).json({
      status: 'ok',
      message: result.emailSent ? 'Vendor selected and notification sent' : 'Vendor selection saved',
      ...result,
    });
  } catch (err) {
    next(err);
  }
}
