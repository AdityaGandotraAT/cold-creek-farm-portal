export function rowToVendorCategory(row) {
  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    name: row.name,
    status: row.status === 'Inactive' ? 'Inactive' : 'Active',
    required: Boolean(row.required),
    sortOrder: Number(row.sort_order) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function categoryInputFromBody(body) {
  return {
    name: String(body.name || '').trim(),
    status: body.status === 'Inactive' ? 'Inactive' : 'Active',
  };
}

export function rowToSelectionOverview(row) {
  return {
    category: row.category,
    selected: Number(row.selected) || 0,
    pending: Number(row.pending) || 0,
    unavailable: Number(row.unavailable) || 0,
  };
}
