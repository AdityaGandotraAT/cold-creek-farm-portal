import { env } from '../config/index.js';
import { query } from '../config/database.js';
import { HttpError } from '../utils/httpError.js';
import { rowToVendor, vendorInputFromBody } from '../utils/vendorMapper.js';
import { getPortalSettings } from './settingsService.js';
import { listCategoryNames } from './vendorCategoryService.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VENDOR_COLUMNS = `id, name, category, phone, email, website, status, created_at, updated_at`;

async function validateVendorInput(input) {
  if (!input.name) {
    throw new HttpError(400, 'Enter the vendor name.');
  }
  if (!input.category) {
    throw new HttpError(400, 'Select a vendor category.');
  }
  const categories = await listCategoryNames({ includeInactive: true });
  if (!categories.includes(input.category)) {
    throw new HttpError(400, 'Select a vendor category.');
  }
  if (input.email && !EMAIL_PATTERN.test(input.email)) {
    throw new HttpError(400, 'Enter a valid email address.');
  }
  if (input.website && !/^https?:\/\//i.test(input.website)) {
    throw new HttpError(400, 'Enter a valid website.');
  }
}

function vendorBookingKey(name, category) {
  return `${String(name || '').trim().toLowerCase()}\n${String(category || '').trim().toLowerCase()}`;
}

function mapVendorBookingRow(row) {
  return {
    id: row.id,
    referenceNumber: row.reference_number,
    eventName: row.event_name,
    clientName: row.client_name || row.booking_name,
    eventDate: row.event_date,
    category: row.category,
    selectionStatus: row.selection_status,
  };
}

const VENDOR_BOOKING_SELECT = `
  SELECT b.id,
         b.reference_number,
         b.event_name,
         b.name AS booking_name,
         to_char(b.event_date, 'YYYY-MM-DD') AS event_date,
         s.vendor_name,
         s.category,
         s.selection_status,
         NULLIF(trim(concat_ws(' ', c.first_name, c.last_name)), '') AS client_name
  FROM booking_vendor_selections s
  JOIN bookings b ON b.id = s.booking_id
  LEFT JOIN clients c ON c.id = b.client_id
  WHERE s.selection_status IN ('Confirmed', 'Pending', 'Unavailable')
`;

async function bookingsByVendor() {
  const result = await query(
    `${VENDOR_BOOKING_SELECT}
     ORDER BY b.event_date ASC, b.event_name ASC`,
  );
  const grouped = new Map();

  for (const row of result.rows) {
    const key = vendorBookingKey(row.vendor_name, row.category);
    const current = grouped.get(key) || [];
    current.push(mapVendorBookingRow(row));
    grouped.set(key, current);
  }

  return grouped;
}

export async function listVendors({
  activeOnly = false,
  includeAll = false,
  includeBookings = false,
} = {}) {
  const result = await query(
    `SELECT ${VENDOR_COLUMNS}
     FROM vendors
     WHERE ($1::boolean IS FALSE OR status = 'Active')
     ORDER BY category ASC, name ASC`,
    [Boolean(activeOnly)],
  );

  let vendors = result.rows.map(rowToVendor);
  const testInbox = env.vendorTestEmail;

  const settings = await getPortalSettings();
  if (!includeAll && !env.notifyVendors && !settings.vendorNotifications && testInbox) {
    vendors = vendors.filter(
      (vendor) => String(vendor.email || '').trim().toLowerCase() === testInbox,
    );
  }

  if (includeBookings) {
    const grouped = await bookingsByVendor();
    vendors = vendors.map((vendor) => ({
      ...vendor,
      bookings: grouped.get(vendorBookingKey(vendor.name, vendor.category)) || [],
    }));
  }

  return vendors;
}

export async function getVendorById(id) {
  const result = await query(
    `SELECT ${VENDOR_COLUMNS}
     FROM vendors
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  return rowToVendor(result.rows[0]);
}

export async function listVendorBookings(id) {
  const vendor = await getVendorById(id);
  if (!vendor) {
    return null;
  }

  const result = await query(
    `${VENDOR_BOOKING_SELECT}
       AND lower(trim(s.vendor_name)) = lower(trim($1))
       AND lower(trim(s.category)) = lower(trim($2))
     ORDER BY b.event_date ASC, b.event_name ASC`,
    [vendor.name, vendor.category],
  );

  const bookings = result.rows.map(mapVendorBookingRow);

  return { count: bookings.length, bookings };
}

export async function createVendor(body) {
  const input = vendorInputFromBody(body);
  await validateVendorInput(input);

  try {
    const result = await query(
      `INSERT INTO vendors (name, category, phone, email, website, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${VENDOR_COLUMNS}`,
      [input.name, input.category, input.phone, input.email, input.website, input.status],
    );

    return rowToVendor(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      throw new HttpError(409, 'A vendor with this name already exists in that category.');
    }
    throw err;
  }
}

export async function updateVendor(id, body) {
  const existing = await getVendorById(id);
  if (!existing) {
    throw new HttpError(404, 'Vendor not found');
  }

  const input = vendorInputFromBody(body);
  await validateVendorInput(input);

  try {
    const result = await query(
      `UPDATE vendors
       SET name = $2,
           category = $3,
           phone = $4,
           email = $5,
           website = $6,
           status = $7
       WHERE id = $1
       RETURNING ${VENDOR_COLUMNS}`,
      [id, input.name, input.category, input.phone, input.email, input.website, input.status],
    );

    return rowToVendor(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      throw new HttpError(409, 'A vendor with this name already exists in that category.');
    }
    throw err;
  }
}

export async function deleteVendor(id) {
  const existing = await getVendorById(id);
  if (!existing) {
    throw new HttpError(404, 'Vendor not found');
  }

  await query('DELETE FROM vendors WHERE id = $1', [id]);
  return existing;
}

export async function listPreferredCategories() {
  return listCategoryNames({ includeInactive: false });
}
