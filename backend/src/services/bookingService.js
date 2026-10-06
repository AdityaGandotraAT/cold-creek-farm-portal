import { query } from '../config/database.js';
import { getClientById } from './clientService.js';
import { listVendors } from './vendorService.js';
import { sendBookingClientEmail, sendVendorReplyClientEmail, sendVendorSelectionEmail } from './emailService.js';
import { createAdminNotification, createClientNotification } from './notificationService.js';
import { getPortalSettings } from './settingsService.js';
import { HttpError } from '../utils/httpError.js';
import { env } from '../config/index.js';
import { signVendorReplyToken, verifyVendorReplyToken } from '../utils/token.js';
import {
  DEFAULT_VENUE,
  EVENT_TYPE_OPTIONS,
  bookingInputFromBody,
  emptyVendorSelections,
  rowToBooking,
  rowToVendorSelection,
} from '../utils/bookingMapper.js';
import { getVendorSelectionLock } from '../utils/vendorSelectionLock.js';
import { listActiveCategoryNames } from './vendorCategoryService.js';

const STATUS_OPTIONS = ['Confirmed', 'Pending'];
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const BOOKING_SELECT = `
  SELECT b.*,
         c.first_name AS client_first_name,
         c.last_name AS client_last_name,
         (
           SELECT COUNT(*)::int
           FROM booking_vendor_selections s
           WHERE s.booking_id = b.id
             AND s.selection_status IN ('Confirmed', 'Pending')
             AND s.vendor_name IS NOT NULL
             AND length(trim(s.vendor_name)) > 0
         ) AS selected_count
  FROM bookings b
  LEFT JOIN clients c ON c.id = b.client_id
`;

function normalizeTime(value) {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    return '';
  }
  return `${String(Number(match[1])).padStart(2, '0')}:${match[2]}`;
}

function timeToMinutes(value) {
  const normalized = normalizeTime(value);
  if (!normalized) {
    return null;
  }
  const [hour, minute] = normalized.split(':').map(Number);
  return hour * 60 + minute;
}

function normalizeOptionalText(value, maxLength) {
  const text = String(value || '').trim();
  if (!text) {
    return null;
  }
  if (text.length > maxLength) {
    throw new HttpError(400, 'Invalid booking data');
  }
  return text;
}

function normalizeClientId(value) {
  const text = String(value || '').trim();
  if (!text) {
    return null;
  }
  if (!UUID_PATTERN.test(text)) {
    throw new HttpError(400, 'Invalid booking data');
  }
  return text;
}

function isUniqueViolation(err) {
  return err.code === '23505';
}

function validateBookingInput(input) {
  if (!input.name?.trim()) {
    throw new HttpError(400, 'Invalid booking data');
  }
  if (!input.eventName?.trim()) {
    throw new HttpError(400, 'Invalid booking data');
  }
  if (!input.eventDate || !/^\d{4}-\d{2}-\d{2}$/.test(String(input.eventDate))) {
    throw new HttpError(400, 'Invalid booking data');
  }

  const start = normalizeTime(input.eventStartTime);
  const end = normalizeTime(input.eventEndTime);
  if (!start || !end || timeToMinutes(end) <= timeToMinutes(start)) {
    throw new HttpError(400, 'Invalid booking data');
  }

  const guests = Number(input.guests);
  if (!Number.isInteger(guests) || guests < 1) {
    throw new HttpError(400, 'Invalid booking data');
  }

  if (!STATUS_OPTIONS.includes(input.bookingStatus)) {
    throw new HttpError(400, 'Invalid booking data');
  }

  const eventType = String(input.eventType || '').trim();
  if (eventType && !EVENT_TYPE_OPTIONS.includes(eventType)) {
    throw new HttpError(400, 'Invalid booking data');
  }
}

async function nextReferenceNumber(eventDate) {
  const year = String(eventDate || '').slice(0, 4) || String(new Date().getFullYear());
  const prefix = `CCF-${year}-`;
  const { rows } = await query(
    `SELECT reference_number
     FROM bookings
     WHERE reference_number LIKE $1
     ORDER BY reference_number DESC
     LIMIT 1`,
    [`${prefix}%`],
  );

  let next = 1001;
  if (rows[0]?.reference_number) {
    const suffix = rows[0].reference_number.slice(prefix.length);
    const parsed = Number.parseInt(suffix, 10);
    if (!Number.isNaN(parsed)) {
      next = parsed + 1;
    }
  }

  return `${prefix}${next}`;
}

async function assertClientExists(clientId) {
  if (!clientId) {
    return;
  }

  const { rows } = await query('SELECT id FROM clients WHERE id = $1', [clientId]);
  if (!rows[0]) {
    throw new HttpError(400, 'Invalid booking data');
  }
}

async function releaseOtherBookingsForClient(clientId, excludeBookingId = null) {
  if (!clientId) {
    return;
  }

  await query(
    `UPDATE bookings
     SET client_id = NULL
     WHERE client_id = $1
       AND ($2::uuid IS NULL OR id <> $2)`,
    [clientId, excludeBookingId],
  );
}

function mapBookingRow(row) {
  return rowToBooking(row, row.selected_count);
}

export async function listBookings() {
  const { rows } = await query(`${BOOKING_SELECT} ORDER BY b.event_date ASC, b.created_at DESC`);
  return rows.map(mapBookingRow);
}

export async function getBookingById(id) {
  const { rows } = await query(`${BOOKING_SELECT} WHERE b.id = $1`, [id]);
  if (!rows[0]) {
    return null;
  }
  return mapBookingRow(rows[0]);
}

export async function getBookingForUser(userId) {
  const { rows } = await query(
    `${BOOKING_SELECT}
     WHERE c.user_id = $1
     LIMIT 1`,
    [userId],
  );

  if (!rows[0]) {
    return null;
  }

  return mapBookingRow(rows[0]);
}

export async function getBookingVendorSelections(bookingId) {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new HttpError(404, 'Booking not found');
  }

  const { rows } = await query(
    `SELECT category, vendor_name, selection_status
     FROM booking_vendor_selections
     WHERE booking_id = $1`,
    [bookingId],
  );

  const byCategory = new Map(rows.map((row) => [row.category, rowToVendorSelection(row)]));
  const categories = await listActiveCategoryNames();
  const names = [...categories];
  for (const row of rows) {
    if (row.category && !names.includes(row.category)) {
      names.push(row.category);
    }
  }

  return names.map((category) => {
    return (
      byCategory.get(category) || {
        category,
        vendor: null,
        status: 'Not Selected',
      }
    );
  });
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function getClientVendorWorkspace(userId) {
  const booking = await getBookingForUser(userId);
  const vendors = await listVendors({ activeOnly: true });

  if (!booking) {
    return {
      booking: null,
      selections: emptyVendorSelections(await listActiveCategoryNames()),
      lock: getVendorSelectionLock(null),
      vendors,
    };
  }

  const selections = await getBookingVendorSelections(booking.id);
  return {
    booking,
    selections,
    lock: getVendorSelectionLock(booking.eventDate),
    vendors,
  };
}

export async function saveClientVendorSelection(userId, input) {
  const booking = await getBookingForUser(userId);
  if (!booking) {
    throw new HttpError(404, 'No booking is assigned to this account');
  }

  const lock = getVendorSelectionLock(booking.eventDate);
  if (lock.locked) {
    throw new HttpError(400, 'Vendor selections are locked for this event');
  }

  const category = String(input.category || '').trim();
  const allowedCategories = await listActiveCategoryNames();
  if (!allowedCategories.includes(category)) {
    throw new HttpError(400, 'Invalid vendor category');
  }

  const vendorName = String(input.vendorName || '').trim();
  if (vendorName.length > 200) {
    throw new HttpError(400, 'Invalid vendor selection');
  }

  const vendorEmail = String(input.vendorEmail || '').trim().toLowerCase();
  if (vendorEmail && !EMAIL_PATTERN.test(vendorEmail)) {
    throw new HttpError(400, 'Invalid vendor email');
  }

  await ensureDefaultSelectionRows(booking.id);

  const current = (await getBookingVendorSelections(booking.id)).find(
    (item) => item.category === category,
  );
  const unchanged =
    String(current?.vendor || '').trim() === vendorName &&
    (vendorName
      ? current?.status === 'Pending' || current?.status === 'Confirmed'
      : current?.status === 'Not Selected');

  if (!unchanged) {
    await query(
      `UPDATE booking_vendor_selections
       SET vendor_name = $3,
           selection_status = $4
       WHERE booking_id = $1
         AND category = $2`,
      [booking.id, category, vendorName || null, vendorName ? 'Pending' : 'Not Selected'],
    );
  }

  let emailSent = false;
  if (vendorName && !unchanged) {
    const client = booking.clientId ? await getClientById(booking.clientId) : null;
    const clientName = client
      ? `${client.firstName} ${client.lastName}`.trim()
      : booking.name;

    try {
      await createAdminNotification({
        type: 'Vendor pending reply',
        title: `${clientName} selected ${vendorName}`,
        detail: `${clientName} chose ${vendorName} for ${category} on ${booking.eventName} (${booking.referenceNumber}). Waiting for the vendor to accept or mark unavailable.`,
        relatedName: vendorName,
        bookingId: booking.id,
        clientId: booking.clientId,
      });
    } catch (err) {
      console.error('Admin notification failed:', err.message);
    }
    try {
      await createClientNotification({
        type: 'Vendor pending reply',
        title: `Waiting for ${vendorName} to confirm ${category}`,
        detail: `${vendorName} · ${category} · ${booking.eventName}. You will see an update here when the vendor accepts or is not available.`,
        relatedName: vendorName,
        bookingId: booking.id,
        clientId: booking.clientId,
      });
    } catch (err) {
      console.error('Client notification failed:', err.message);
    }
    const settings = await getPortalSettings();
    const notifyVendors = env.notifyVendors || settings.vendorNotifications;
    const testInbox = env.vendorTestEmail;
    const isTestVendor = Boolean(testInbox && vendorEmail && vendorEmail === testInbox);
    const sendToVendor = (notifyVendors || isTestVendor) && Boolean(vendorEmail);
    const to = sendToVendor
      ? vendorEmail
      : settings.emailNotifications
        ? env.smtp.ownerEmail
        : '';
    let acceptUrl = '';
    let unavailableUrl = '';
    if (sendToVendor) {
      const replyToken = signVendorReplyToken({
        bookingId: booking.id,
        category,
        vendorName,
      });
      const replyBase = `${env.portalUrl}/vendor-reply`;
      acceptUrl = `${replyBase}?token=${encodeURIComponent(replyToken)}&decision=accept`;
      unavailableUrl = `${replyBase}?token=${encodeURIComponent(replyToken)}&decision=unavailable`;
    }
    if (to) {
      try {
        await sendVendorSelectionEmail({
          to,
          category,
          vendorName,
          booking,
          clientName,
          internalOnly: !sendToVendor,
          acceptUrl,
          unavailableUrl,
        });
        emailSent = true;
      } catch (err) {
        console.error('Vendor selection email failed:', err.message);
      }
    }
  }

  const refreshed = await getBookingById(booking.id);
  return {
    booking: refreshed,
    selections: await getBookingVendorSelections(booking.id),
    lock: getVendorSelectionLock(booking.eventDate),
    vendors: await listVendors({ activeOnly: true }),
    emailSent,
  };
}

async function ensureDefaultSelectionRows(bookingId) {
  const categories = await listActiveCategoryNames();
  for (const category of categories) {
    await query(
      `INSERT INTO booking_vendor_selections (booking_id, category, vendor_name, selection_status)
       VALUES ($1, $2, NULL, 'Not Selected')
       ON CONFLICT (booking_id, category) DO NOTHING`,
      [bookingId, category],
    );
  }
}

function bookingWriteValues(input, extras = []) {
  return [
    ...extras,
    input.name.trim(),
    input.eventName.trim(),
    normalizeOptionalText(input.eventType, 80),
    input.eventDate,
    normalizeTime(input.eventStartTime),
    normalizeTime(input.eventEndTime),
    DEFAULT_VENUE,
    Number(input.guests),
    input.bookingStatus,
    normalizeOptionalText(input.notes, 2000),
    normalizeClientId(input.clientId),
  ];
}

async function notifyAssignedClient(booking, previousClientId = null) {
  if (!booking?.clientId) {
    return { emailSent: false, message: 'Booking saved' };
  }

  const kind = previousClientId === booking.clientId ? 'updated' : 'assigned';
  const client = await getClientById(booking.clientId);

  try {
    await createClientNotification({
      type: kind === 'updated' ? 'Booking updated' : 'Booking assigned',
      title: kind === 'updated' ? 'Your event details were updated' : 'Your event is ready',
      detail: `${booking.eventName} · ${booking.referenceNumber}. Open My Booking for the date, time, and venue.`,
      relatedName: booking.eventName,
      bookingId: booking.id,
      clientId: booking.clientId,
    });
  } catch (err) {
    console.error('Client notification failed:', err.message);
  }

  const settings = await getPortalSettings();
  if (!settings.clientNotifications || !client?.email) {
    return { emailSent: false, message: 'Booking saved' };
  }

  try {
    await sendBookingClientEmail({
      kind,
      to: client.email,
      firstName: client.firstName,
      lastName: client.lastName,
      booking,
    });
    return {
      emailSent: true,
      message:
        kind === 'updated'
          ? 'Booking saved and the client was emailed the updated details'
          : 'Booking saved and the client was emailed their event details',
    };
  } catch (err) {
    console.error('Booking client email failed:', err.message);
    return {
      emailSent: false,
      message: err.message
        ? `Booking saved, but the client email could not be sent. ${err.message}`
        : 'Booking saved, but the client email could not be sent. You can save again after SMTP is configured.',
    };
  }
}

export async function createBooking(body) {
  const input = bookingInputFromBody(body);
  validateBookingInput(input);
  const clientId = normalizeClientId(input.clientId);
  await assertClientExists(clientId);
  await releaseOtherBookingsForClient(clientId);

  const referenceNumber = await nextReferenceNumber(input.eventDate);

  try {
    const { rows } = await query(
      `INSERT INTO bookings (
         reference_number,
         name,
         event_name,
         event_type,
         event_date,
         event_start_time,
         event_end_time,
         venue,
         guests,
         booking_status,
         notes,
         client_id
       )
       VALUES ($1, $2, $3, $4, $5, $6::time, $7::time, $8, $9, $10, $11, $12)
       RETURNING id`,
      bookingWriteValues(input, [referenceNumber]),
    );

    await ensureDefaultSelectionRows(rows[0].id);
    const booking = await getBookingById(rows[0].id);
    const notice = await notifyAssignedClient(booking);
    return { booking, ...notice };
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new HttpError(409, 'This client already has a booking');
    }
    throw err;
  }
}

export async function updateBooking(id, body) {
  const existing = await getBookingById(id);
  if (!existing) {
    throw new HttpError(404, 'Booking not found');
  }

  const previousClientId = existing.clientId;
  const input = bookingInputFromBody(body);
  validateBookingInput(input);
  const clientId = normalizeClientId(input.clientId);
  await assertClientExists(clientId);
  await releaseOtherBookingsForClient(clientId, id);

  try {
    await query(
      `UPDATE bookings
       SET name = $2,
           event_name = $3,
           event_type = $4,
           event_date = $5,
           event_start_time = $6::time,
           event_end_time = $7::time,
           venue = $8,
           guests = $9,
           booking_status = $10,
           notes = $11,
           client_id = $12
       WHERE id = $1`,
      bookingWriteValues(input, [id]),
    );
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new HttpError(409, 'This client already has a booking');
    }
    throw err;
  }

  await ensureDefaultSelectionRows(id);
  const booking = await getBookingById(id);
  const notice = await notifyAssignedClient(booking, previousClientId);
  return { booking, ...notice };
}

export async function deleteBooking(id) {
  const existing = await getBookingById(id);
  if (!existing) {
    throw new HttpError(404, 'Booking not found');
  }

  await query('DELETE FROM bookings WHERE id = $1', [id]);
  return existing;
}

function vendorReplyAlreadyDone(status) {
  return status === 'Confirmed' || status === 'Unavailable';
}

export async function previewVendorReply(token) {
  const payload = verifyVendorReplyToken(token);
  const booking = await getBookingById(payload.bookingId);
  if (!booking) {
    throw new HttpError(404, 'This vendor reply is no longer valid');
  }

  const selection = (await getBookingVendorSelections(booking.id)).find(
    (item) => item.category === payload.category,
  );
  if (!selection || selection.vendor !== payload.vendorName) {
    throw new HttpError(400, 'This vendor reply is no longer valid');
  }

  return {
    vendorName: payload.vendorName,
    category: payload.category,
    eventName: booking.eventName,
    eventDate: booking.eventDate,
    venue: booking.venue,
    referenceNumber: booking.referenceNumber,
    status: selection.status,
    alreadyResponded: vendorReplyAlreadyDone(selection.status),
  };
}

export async function respondToVendorReply(token, decision) {
  const normalized = String(decision || '').trim().toLowerCase();
  if (normalized !== 'accept' && normalized !== 'unavailable') {
    throw new HttpError(400, 'Choose Accept or Not available');
  }

  const payload = verifyVendorReplyToken(token);
  const booking = await getBookingById(payload.bookingId);
  if (!booking) {
    throw new HttpError(404, 'This vendor reply is no longer valid');
  }

  const selection = (await getBookingVendorSelections(booking.id)).find(
    (item) => item.category === payload.category,
  );
  if (!selection || selection.vendor !== payload.vendorName) {
    throw new HttpError(400, 'This vendor reply is no longer valid');
  }

  if (vendorReplyAlreadyDone(selection.status)) {
    return {
      alreadyResponded: true,
      status: selection.status,
      vendorName: selection.vendor,
      category: selection.category,
      eventName: booking.eventName,
      eventDate: booking.eventDate,
    };
  }

  const nextStatus = normalized === 'accept' ? 'Confirmed' : 'Unavailable';
  await query(
    `UPDATE booking_vendor_selections
     SET selection_status = $3
     WHERE booking_id = $1
       AND category = $2`,
    [booking.id, payload.category, nextStatus],
  );

  const client = booking.clientId ? await getClientById(booking.clientId) : null;
  const clientName = client ? `${client.firstName} ${client.lastName}`.trim() : booking.name;
  const accepted = nextStatus === 'Confirmed';

  try {
    await createAdminNotification({
      type: accepted ? 'Vendor confirmed' : 'Vendor unavailable',
      title: accepted
        ? `${payload.vendorName} accepted ${payload.category}`
        : `${payload.vendorName} is not available for ${payload.category}`,
      detail: accepted
        ? `${payload.vendorName} accepted ${payload.category} for ${clientName} on ${booking.eventName}.`
        : `${payload.vendorName} is not available on this date for ${payload.category}. ${clientName} should choose another vendor.`,
      relatedName: payload.vendorName,
      bookingId: booking.id,
      clientId: booking.clientId,
    });
  } catch (err) {
    console.error('Admin notification failed:', err.message);
  }

  try {
    await createClientNotification({
      type: accepted ? 'Vendor confirmed' : 'Vendor unavailable',
      title: accepted
        ? `${payload.vendorName} accepted ${payload.category}`
        : `${payload.vendorName} is not available for ${payload.category}`,
      detail: accepted
        ? `${payload.vendorName} · ${payload.category} · ${booking.eventName}. This vendor is confirmed for your event.`
        : `${payload.vendorName} · ${payload.category} · ${booking.eventName}. Choose another vendor in Vendor Selections.`,
      relatedName: payload.vendorName,
      bookingId: booking.id,
      clientId: booking.clientId,
    });
  } catch (err) {
    console.error('Client notification failed:', err.message);
  }

  let emailSent = false;
  const settings = await getPortalSettings();
  if (client?.email && settings.clientNotifications) {
    try {
      await sendVendorReplyClientEmail({
        to: client.email,
        kind: accepted ? 'accepted' : 'unavailable',
        firstName: client.firstName,
        lastName: client.lastName,
        vendorName: payload.vendorName,
        category: payload.category,
        booking,
      });
      emailSent = true;
    } catch (err) {
      console.error('Vendor reply client email failed:', err.message);
    }
  }

  return {
    alreadyResponded: false,
    status: nextStatus,
    vendorName: payload.vendorName,
    category: payload.category,
    eventName: booking.eventName,
    eventDate: booking.eventDate,
    emailSent,
  };
}

export { emptyVendorSelections };
