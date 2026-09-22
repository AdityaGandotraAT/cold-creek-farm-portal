const DEFAULT_VENUE = 'Cold Creek Farm';

const EVENT_TYPE_OPTIONS = [
  'Wedding',
  'Rehearsal Dinner',
  'Reception',
  'Private Event',
  'Other',
];

const REQUIRED_VENDOR_CATEGORIES = [
  'Florist',
  'Photographers',
  'Catering',
  'DJs',
  'Rentals',
  'Wedding Officiants',
];

function toISODate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }
    return value.toISOString().slice(0, 10);
  }

  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function toTimeString(value) {
  if (!value) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString().slice(11, 16);
  }

  const text = String(value);
  const match = text.match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    return '';
  }

  return `${String(Number(match[1])).padStart(2, '0')}:${match[2]}`;
}

export function rowToBooking(row, selectedCount = 0) {
  if (!row) {
    return null;
  }

  const clientFirst = row.client_first_name || '';
  const clientLast = row.client_last_name || '';
  const clientName = `${clientFirst} ${clientLast}`.trim();

  return {
    id: String(row.id),
    referenceNumber: row.reference_number,
    clientId: row.client_id ? String(row.client_id) : null,
    clientName: clientName || null,
    name: row.name,
    eventName: row.event_name || row.name,
    eventType: row.event_type || '',
    eventDate: toISODate(row.event_date),
    eventStartTime: toTimeString(row.event_start_time),
    eventEndTime: toTimeString(row.event_end_time),
    venue: row.venue || DEFAULT_VENUE,
    guests: Number(row.guests),
    bookingStatus: row.booking_status,
    notes: row.notes || '',
    selectedCount: Number(selectedCount) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToVendorSelection(row) {
  return {
    category: row.category,
    vendor: row.vendor_name || null,
    status: row.selection_status || 'Not Selected',
  };
}

export function emptyVendorSelections() {
  return REQUIRED_VENDOR_CATEGORIES.map((category) => ({
    category,
    vendor: null,
    status: 'Not Selected',
  }));
}

export function bookingInputFromBody(body) {
  return {
    clientId: body.clientId || null,
    name: body.name,
    eventName: body.eventName,
    eventType: body.eventType,
    eventDate: body.eventDate,
    eventStartTime: body.eventStartTime,
    eventEndTime: body.eventEndTime,
    venue: DEFAULT_VENUE,
    guests: body.guests,
    bookingStatus: body.bookingStatus,
    notes: body.notes,
  };
}

export { DEFAULT_VENUE, EVENT_TYPE_OPTIONS, REQUIRED_VENDOR_CATEGORIES };
