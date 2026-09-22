import { bookingStatusOptions, DEFAULT_VENUE, eventTypeOptions } from '../../../data/bookingsMock.js';
import { isFarmISODate } from '../../../data/farmTime.js';

export { DEFAULT_VENUE };

export const emptyBookingForm = {
  clientId: '',
  name: '',
  eventName: '',
  eventType: 'Wedding',
  eventDate: '',
  eventStartTime: '',
  eventEndTime: '',
  venue: DEFAULT_VENUE,
  guests: '',
  bookingStatus: 'Pending',
  notes: '',
};

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

export function bookingToForm(booking) {
  return {
    clientId: booking.clientId || '',
    name: booking.name || '',
    eventName: booking.eventName || '',
    eventType: booking.eventType || '',
    eventDate: booking.eventDate || '',
    eventStartTime: normalizeTime(booking.eventStartTime),
    eventEndTime: normalizeTime(booking.eventEndTime),
    venue: DEFAULT_VENUE,
    guests: booking.guests == null ? '' : String(booking.guests),
    bookingStatus: booking.bookingStatus || 'Pending',
    notes: booking.notes || '',
  };
}

export function validateBookingForm(values) {
  const errors = {};

  if (!values.clientId) {
    errors.clientId = 'Select a client so they can see this booking.';
  }

  if (!values.name.trim()) {
    errors.name = 'Enter a name.';
  }

  if (!String(values.eventName || '').trim()) {
    errors.eventName = 'Enter the event name.';
  }

  if (!values.eventDate) {
    errors.eventDate = 'Enter an event date.';
  } else if (!isFarmISODate(values.eventDate)) {
    errors.eventDate = 'Enter a valid event date.';
  }

  const start = normalizeTime(values.eventStartTime);
  const end = normalizeTime(values.eventEndTime);

  if (!start) {
    errors.eventStartTime = 'Enter a start time.';
  }

  if (!end) {
    errors.eventEndTime = 'Enter an end time.';
  }

  if (start && end && timeToMinutes(end) <= timeToMinutes(start)) {
    errors.eventEndTime = 'End time must be after start time.';
  }

  const guestsRaw = String(values.guests || '').trim();
  if (!guestsRaw) {
    errors.guests = 'Enter the guest count.';
  } else if (!/^\d+$/.test(guestsRaw) || Number(guestsRaw) < 1) {
    errors.guests = 'Enter a guest count of at least 1.';
  }

  if (values.eventType && !eventTypeOptions.includes(values.eventType)) {
    errors.eventType = 'Select an event type.';
  }

  if (!values.bookingStatus) {
    errors.bookingStatus = 'Select a booking status.';
  } else if (!bookingStatusOptions.includes(values.bookingStatus)) {
    errors.bookingStatus = 'Select Confirmed or Pending.';
  }

  return errors;
}

export function toBookingPayload(values) {
  return {
    clientId: String(values.clientId || '').trim() || null,
    name: values.name.trim(),
    eventName: String(values.eventName || '').trim(),
    eventType: String(values.eventType || '').trim() || null,
    eventDate: values.eventDate,
    eventStartTime: normalizeTime(values.eventStartTime),
    eventEndTime: normalizeTime(values.eventEndTime),
    venue: DEFAULT_VENUE,
    guests: Number(String(values.guests).trim()),
    bookingStatus: values.bookingStatus,
    notes: String(values.notes || '').trim() || null,
  };
}
