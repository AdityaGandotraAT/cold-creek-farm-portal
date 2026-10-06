import { query } from '../config/database.js';
import { HttpError } from '../utils/httpError.js';
import { rowToNotification } from '../utils/notificationMapper.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const NOTIFICATION_SELECT = `
  SELECT id, audience, type, title, detail, related_name, booking_id, client_id, status, created_at
  FROM notifications
`;

export async function createAdminNotification({
  type,
  title,
  detail = '',
  relatedName = '',
  bookingId = null,
  clientId = null,
}) {
  const { rows } = await query(
    `INSERT INTO notifications (
       audience, type, title, detail, related_name, booking_id, client_id, status
     )
     VALUES ('ADMIN', $1, $2, $3, $4, $5, $6, 'Unread')
     RETURNING id, audience, type, title, detail, related_name, booking_id, client_id, status, created_at`,
    [
      String(type || '').trim(),
      String(title || '').trim(),
      String(detail || '').trim(),
      String(relatedName || '').trim(),
      bookingId || null,
      clientId || null,
    ],
  );

  return rowToNotification(rows[0]);
}

export async function listAdminNotifications({ status = '', type = '' } = {}) {
  const filters = [`audience = 'ADMIN'`];
  const values = [];

  if (status === 'Unread' || status === 'Read') {
    values.push(status);
    filters.push(`status = $${values.length}`);
  }

  if (type) {
    values.push(type);
    filters.push(`type = $${values.length}`);
  }

  const { rows } = await query(
    `${NOTIFICATION_SELECT}
     WHERE ${filters.join(' AND ')}
     ORDER BY created_at DESC`,
    values,
  );

  return rows.map(rowToNotification);
}

export async function countUnreadAdminNotifications() {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS unread_count
     FROM notifications
     WHERE audience = 'ADMIN'
       AND status = 'Unread'`,
  );

  return Number(rows[0]?.unread_count) || 0;
}

export async function markAdminNotificationRead(id) {
  if (!UUID_PATTERN.test(String(id || ''))) {
    throw new HttpError(400, 'Invalid notification');
  }

  const { rows } = await query(
    `UPDATE notifications
     SET status = 'Read'
     WHERE id = $1
       AND audience = 'ADMIN'
     RETURNING id, audience, type, title, detail, related_name, booking_id, client_id, status, created_at`,
    [id],
  );

  if (!rows[0]) {
    throw new HttpError(404, 'Notification not found');
  }

  return rowToNotification(rows[0]);
}

export async function markAllAdminNotificationsRead() {
  await query(
    `UPDATE notifications
     SET status = 'Read'
     WHERE audience = 'ADMIN'
       AND status = 'Unread'`,
  );

  return { unreadCount: 0 };
}

async function clientIdForUser(userId) {
  const { rows } = await query(
    `SELECT id
     FROM clients
     WHERE user_id = $1
     LIMIT 1`,
    [userId],
  );

  return rows[0] ? String(rows[0].id) : null;
}

async function backfillClientNotifications(clientId) {
  await query(
    `INSERT INTO notifications (
       audience, type, title, detail, related_name, booking_id, client_id, status
     )
     SELECT
       'CLIENT',
       'Booking assigned',
       'Your event is ready',
       trim(both ' ' FROM coalesce(b.event_name, b.name, 'Your event')
         || ' · '
         || coalesce(to_char(b.event_date, 'FMMonth FMDD, YYYY'), '')
         || ' · '
         || b.reference_number),
       coalesce(b.event_name, b.name, ''),
       b.id,
       b.client_id,
       'Read'
     FROM bookings b
     WHERE b.client_id = $1
       AND NOT EXISTS (
         SELECT 1
         FROM notifications n
         WHERE n.audience = 'CLIENT'
           AND n.client_id = b.client_id
           AND n.booking_id = b.id
           AND n.type IN ('Booking assigned', 'Booking updated')
       )`,
    [clientId],
  );

  await query(
    `INSERT INTO notifications (
       audience, type, title, detail, related_name, booking_id, client_id, status
     )
     SELECT
       'CLIENT',
       CASE s.selection_status::text
         WHEN 'Confirmed' THEN 'Vendor confirmed'
         WHEN 'Unavailable' THEN 'Vendor unavailable'
         ELSE 'Vendor pending reply'
       END,
       CASE s.selection_status::text
         WHEN 'Confirmed' THEN s.vendor_name || ' accepted ' || s.category
         WHEN 'Unavailable' THEN s.vendor_name || ' is not available for ' || s.category
         ELSE 'Waiting for ' || s.vendor_name || ' to confirm ' || s.category
       END,
       s.vendor_name
         || ' · '
         || s.category
         || ' · '
         || coalesce(b.event_name, b.name, 'your event'),
       s.vendor_name,
       s.booking_id,
       b.client_id,
       'Read'
     FROM booking_vendor_selections s
     JOIN bookings b ON b.id = s.booking_id
     WHERE b.client_id = $1
       AND s.vendor_name IS NOT NULL
       AND length(trim(s.vendor_name)) > 0
       AND s.selection_status::text IN ('Confirmed', 'Unavailable', 'Pending')
       AND NOT EXISTS (
         SELECT 1
         FROM notifications n
         WHERE n.audience = 'CLIENT'
           AND n.client_id = b.client_id
           AND n.booking_id = s.booking_id
           AND n.related_name = s.vendor_name
           AND n.detail LIKE '%' || s.category || '%'
           AND n.type = CASE s.selection_status::text
             WHEN 'Confirmed' THEN 'Vendor confirmed'
             WHEN 'Unavailable' THEN 'Vendor unavailable'
             ELSE 'Vendor pending reply'
           END
       )`,
    [clientId],
  );
}

export async function createClientNotification({
  type,
  title,
  detail = '',
  relatedName = '',
  bookingId = null,
  clientId = null,
}) {
  if (!clientId) {
    return null;
  }

  const { rows } = await query(
    `INSERT INTO notifications (
       audience, type, title, detail, related_name, booking_id, client_id, status
     )
     VALUES ('CLIENT', $1, $2, $3, $4, $5, $6, 'Unread')
     RETURNING id, audience, type, title, detail, related_name, booking_id, client_id, status, created_at`,
    [
      String(type || '').trim(),
      String(title || '').trim(),
      String(detail || '').trim(),
      String(relatedName || '').trim(),
      bookingId || null,
      clientId,
    ],
  );

  return rowToNotification(rows[0]);
}

export async function listClientNotificationsForUser(userId) {
  const clientId = await clientIdForUser(userId);
  if (!clientId) {
    return [];
  }

  await backfillClientNotifications(clientId);

  const { rows } = await query(
    `${NOTIFICATION_SELECT}
     WHERE audience = 'CLIENT'
       AND client_id = $1
     ORDER BY created_at DESC`,
    [clientId],
  );

  return rows.map(rowToNotification);
}

export async function countUnreadClientNotificationsForUser(userId) {
  const clientId = await clientIdForUser(userId);
  if (!clientId) {
    return 0;
  }

  const { rows } = await query(
    `SELECT COUNT(*)::int AS unread_count
     FROM notifications
     WHERE audience = 'CLIENT'
       AND client_id = $1
       AND status = 'Unread'`,
    [clientId],
  );

  return Number(rows[0]?.unread_count) || 0;
}

export async function markClientNotificationReadForUser(userId, id) {
  const clientId = await clientIdForUser(userId);
  if (!clientId || !UUID_PATTERN.test(String(id || ''))) {
    throw new HttpError(404, 'Notification not found');
  }

  const { rows } = await query(
    `UPDATE notifications
     SET status = 'Read'
     WHERE id = $1
       AND audience = 'CLIENT'
       AND client_id = $2
     RETURNING id, audience, type, title, detail, related_name, booking_id, client_id, status, created_at`,
    [id, clientId],
  );

  if (!rows[0]) {
    throw new HttpError(404, 'Notification not found');
  }

  return rowToNotification(rows[0]);
}

export async function markAllClientNotificationsReadForUser(userId) {
  const clientId = await clientIdForUser(userId);
  if (!clientId) {
    return { unreadCount: 0 };
  }

  await query(
    `UPDATE notifications
     SET status = 'Read'
     WHERE audience = 'CLIENT'
       AND client_id = $1
       AND status = 'Unread'`,
    [clientId],
  );

  return { unreadCount: 0 };
}
