export function rowToVendor(row) {
  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    name: row.name,
    category: row.category,
    phone: row.phone || '',
    email: row.email || '',
    website: row.website || '',
    status: row.status === 'Inactive' ? 'Inactive' : 'Active',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function vendorInputFromBody(body) {
  return {
    name: String(body.name || '').trim(),
    category: String(body.category || '').trim(),
    phone: String(body.phone || '').trim(),
    email: String(body.email || '').trim(),
    website: String(body.website || '').trim(),
    status: body.status === 'Inactive' ? 'Inactive' : 'Active',
  };
}
