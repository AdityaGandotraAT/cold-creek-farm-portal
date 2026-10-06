import { query, withTransaction } from '../config/database.js';
import { HttpError } from '../utils/httpError.js';
import {
  PREFERRED_VENDOR_CATEGORIES,
  REQUIRED_VENDOR_CATEGORIES,
} from '../utils/bookingMapper.js';
import {
  categoryInputFromBody,
  rowToSelectionOverview,
  rowToVendorCategory,
} from '../utils/vendorCategoryMapper.js';

const CATEGORY_COLUMNS = `id, name, status, required, sort_order, created_at, updated_at`;

export async function listVendorCategories() {
  const result = await query(
    `SELECT ${CATEGORY_COLUMNS}
     FROM vendor_categories
     ORDER BY required DESC, sort_order ASC, name ASC`,
  );

  return result.rows.map(rowToVendorCategory);
}

export async function listActiveCategoryNames() {
  const result = await query(
    `SELECT name
     FROM vendor_categories
     WHERE status = 'Active'
     ORDER BY sort_order ASC, name ASC`,
  );

  if (result.rows.length === 0) {
    return [...PREFERRED_VENDOR_CATEGORIES];
  }

  return result.rows.map((row) => row.name);
}

export async function listCategoryNames({ includeInactive = false } = {}) {
  const result = await query(
    `SELECT name
     FROM vendor_categories
     WHERE ($1::boolean IS TRUE OR status = 'Active')
     ORDER BY sort_order ASC, name ASC`,
    [Boolean(includeInactive)],
  );

  if (result.rows.length === 0) {
    return [...PREFERRED_VENDOR_CATEGORIES];
  }

  return result.rows.map((row) => row.name);
}

export async function getVendorCategoryById(id) {
  const result = await query(
    `SELECT ${CATEGORY_COLUMNS}
     FROM vendor_categories
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  return rowToVendorCategory(result.rows[0]);
}

export async function createVendorCategory(body) {
  const input = categoryInputFromBody(body);
  if (!input.name) {
    throw new HttpError(400, 'Enter a category name.');
  }

  const maxSort = await query('SELECT COALESCE(MAX(sort_order), 0)::int AS max FROM vendor_categories');
  const sortOrder = (maxSort.rows[0]?.max || 0) + 1;

  try {
    const result = await query(
      `INSERT INTO vendor_categories (name, status, required, sort_order)
       VALUES ($1, $2, FALSE, $3)
       RETURNING ${CATEGORY_COLUMNS}`,
      [input.name, input.status, sortOrder],
    );

    return rowToVendorCategory(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      throw new HttpError(409, 'A category with this name already exists.');
    }
    throw err;
  }
}

export async function updateVendorCategory(id, body) {
  const existing = await getVendorCategoryById(id);
  if (!existing) {
    throw new HttpError(404, 'Category not found');
  }

  const input = categoryInputFromBody(body);
  if (!input.name) {
    throw new HttpError(400, 'Enter a category name.');
  }

  const nextName = existing.required ? existing.name : input.name;
  const nextStatus = existing.required ? 'Active' : input.status;

  try {
    return await withTransaction(async (client) => {
      const result = await client.query(
        `UPDATE vendor_categories
         SET name = $2,
             status = $3
         WHERE id = $1
         RETURNING ${CATEGORY_COLUMNS}`,
        [id, nextName, nextStatus],
      );
      const updated = rowToVendorCategory(result.rows[0]);

      if (existing.name !== updated.name) {
        await client.query('UPDATE vendors SET category = $2 WHERE category = $1', [
          existing.name,
          updated.name,
        ]);
        await client.query(
          'UPDATE booking_vendor_selections SET category = $2 WHERE category = $1',
          [existing.name, updated.name],
        );
      }

      return updated;
    });
  } catch (err) {
    if (err.code === '23505') {
      throw new HttpError(409, 'A category with this name already exists.');
    }
    throw err;
  }
}

export async function getVendorSelectionOverview() {
  const { rows } = await query(
    `SELECT s.category,
            COUNT(*) FILTER (
              WHERE s.selection_status = 'Confirmed'
                AND s.vendor_name IS NOT NULL
                AND length(trim(s.vendor_name)) > 0
            )::int AS selected,
            COUNT(*) FILTER (
              WHERE s.selection_status = 'Pending'
                AND s.vendor_name IS NOT NULL
                AND length(trim(s.vendor_name)) > 0
            )::int AS pending,
            COUNT(*) FILTER (
              WHERE s.selection_status = 'Unavailable'
            )::int AS unavailable
     FROM booking_vendor_selections s
     GROUP BY s.category`,
  );

  const byName = new Map(rows.map((row) => [row.category, rowToSelectionOverview(row)]));
  const categories = REQUIRED_VENDOR_CATEGORIES.map((category) => {
    const current = byName.get(category);
    return {
      category,
      selected: current?.selected || 0,
      pending: current?.pending || 0,
      unavailable: current?.unavailable || 0,
    };
  });

  for (const row of rows) {
    if (REQUIRED_VENDOR_CATEGORIES.includes(row.category)) {
      continue;
    }
    const current = rowToSelectionOverview(row);
    if (current.selected + current.pending + current.unavailable === 0) {
      continue;
    }
    categories.push(current);
  }

  return categories;
}
