import { query } from '../config/database.js';
import { getClientById } from './clientService.js';
import { sendBookingClientEmail, sendVendorSelectionEmail } from './emailService.js';
import { HttpError } from '../utils/httpError.js';
import { env } from '../config/index.js';
import {
  DEFAULT_VENUE,
  EVENT_TYPE_OPTIONS,
  REQUIRED_VENDOR_CATEGORIES,
  bookingInputFromBody,
  emptyVendorSelections,
  rowToBooking,
  rowToVendorSelection,
} from '../utils/bookingMapper.js';
import { getVendorSelectionLock } from '../utils/vendorSelectionLock.js';

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
             AND s.selection_status <> 'Not Selected'
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

  return REQUIRED_VENDOR_CATEGORIES.map((category) => {
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
  if (!booking) {
    return {
      booking: null,
      selections: emptyVendorSelections(),
      lock: getVendorSelectionLock(null),
    };
  }

  const selections = await getBookingVendorSelections(booking.id);
  return {
    booking,
    selections,
    lock: getVendorSelectionLock(booking.eventDate),
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
  if (!REQUIRED_VENDOR_CATEGORIES.includes(category)) {
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
    (vendorName ? current?.status !== 'Not Selected' : current?.status === 'Not Selected');

  if (!unchanged) {
    await query(
      `UPDATE booking_vendor_selections
       SET vendor_name = $3,
           selection_status = $4
       WHERE booking_id = $1
         AND category = $2`,
      [booking.id, category, vendorName || null, vendorName ? 'Confirmed' : 'Not Selected'],
    );
  }

  let emailSent = false;
  if (vendorName && !unchanged) {
    const client = booking.clientId ? await getClientById(booking.clientId) : null;
    const to = vendorEmail || env.smtp.ownerEmail;
    if (to) {
      try {
        await sendVendorSelectionEmail({
          to,
          category,
          vendorName,
          booking,
          clientName: client ? `${client.firstName} ${client.lastName}`.trim() : booking.name,
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
    emailSent,
  };
}

async function ensureDefaultSelectionRows(bookingId) {
  for (const category of REQUIRED_VENDOR_CATEGORIES) {
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

  const client = await getClientById(booking.clientId);
  if (!client?.email) {
    return { emailSent: false, message: 'Booking saved' };
  }

  const kind = previousClientId === booking.clientId ? 'updated' : 'assigned';

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
      message:
        'Booking saved, but the client email could not be sent. You can save again after SMTP is configured.',
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

export { emptyVendorSelections };
