import { bookingStatusOptions, venueOptions } from '../../../data/bookingsMock.js';
import { isFarmISODate } from '../../../data/farmTime.js';

export const emptyBookingForm = {
  name: '',
  eventDate: '',
  eventStartTime: '',
  eventEndTime: '',
  venue: '',
  guests: '',
  bookingStatus: 'Pending',
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
    name: booking.name || '',
    eventDate: booking.eventDate || '',
    eventStartTime: normalizeTime(booking.eventStartTime),
    eventEndTime: normalizeTime(booking.eventEndTime),
    venue: booking.venue || '',
    guests: booking.guests == null ? '' : String(booking.guests),
    bookingStatus: booking.bookingStatus || 'Pending',
  };
}

export function validateBookingForm(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = 'Enter a name.';
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

  if (!values.venue) {
    errors.venue = 'Select a venue.';
  } else if (!venueOptions.includes(values.venue)) {
    errors.venue = 'Select a venue.';
  }

  const guestsRaw = String(values.guests || '').trim();
  if (!guestsRaw) {
    errors.guests = 'Enter the guest count.';
  } else if (!/^\d+$/.test(guestsRaw) || Number(guestsRaw) < 1) {
    errors.guests = 'Enter a guest count of at least 1.';
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
    name: values.name.trim(),
    eventDate: values.eventDate,
    eventStartTime: normalizeTime(values.eventStartTime),
    eventEndTime: normalizeTime(values.eventEndTime),
    venue: values.venue,
    guests: Number(String(values.guests).trim()),
    bookingStatus: values.bookingStatus,
  };
}
