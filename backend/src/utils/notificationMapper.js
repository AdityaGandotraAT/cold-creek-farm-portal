export function rowToNotification(row) {
  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    audience: row.audience || 'ADMIN',
    type: row.type,
    title: row.title,
    detail: row.detail || '',
    relatedName: row.related_name || '',
    bookingId: row.booking_id ? String(row.booking_id) : null,
    clientId: row.client_id ? String(row.client_id) : null,
    status: row.status === 'Read' ? 'Read' : 'Unread',
    occurredAt: row.created_at,
  };
}
