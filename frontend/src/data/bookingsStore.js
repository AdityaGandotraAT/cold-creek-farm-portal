import { seedBookings } from './bookingsMock.js';

let bookings = seedBookings.map((booking) => ({ ...booking }));
let nextId = 1032;
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

function referenceNumberFor(eventDate, id) {
  const year = String(eventDate || '').slice(0, 4) || '2026';
  return `CCF-${year}-${id}`;
}

export function getBookings() {
  return bookings;
}

export function getBookingById(id) {
  return bookings.find((booking) => booking.id === id) || null;
}

export function subscribeBookings(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addBooking(payload) {
  const booking = {
    ...payload,
    id: `bkg-${nextId}`,
    referenceNumber: referenceNumberFor(payload.eventDate, nextId),
    selectedCount: 0,
  };
  nextId += 1;
  bookings = [booking, ...bookings];
  emit();
  return booking;
}

export function updateBooking(id, payload) {
  const current = getBookingById(id);
  if (!current) {
    return null;
  }

  const booking = {
    ...current,
    ...payload,
    id,
    referenceNumber: current.referenceNumber,
    selectedCount: current.selectedCount,
  };
  bookings = bookings.map((item) => (item.id === id ? booking : item));
  emit();
  return booking;
}
