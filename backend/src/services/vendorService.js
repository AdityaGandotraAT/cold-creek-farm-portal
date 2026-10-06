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

export async function listVendors({ activeOnly = false, includeAll = false } = {}) {
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
