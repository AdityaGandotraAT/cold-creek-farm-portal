import {
  createBooking as createBookingRequest,
  deleteBooking as deleteBookingRequest,
  fetchBooking,
  fetchBookingVendorSelections,
  fetchBookings,
  updateBooking as updateBookingRequest,
} from '../api/bookings.js';

let bookings = [];
let loading = false;
let error = '';
let snapshot = { bookings, loading, error };
const selectionsByBookingId = new Map();
const listeners = new Set();

function refreshSnapshot() {
  snapshot = { bookings, loading, error };
}

function emit() {
  refreshSnapshot();
  listeners.forEach((listener) => listener());
}

export function getBookingsState() {
  return snapshot;
}

export function getBookings() {
  return bookings;
}

export function subscribeBookings(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function loadBookings() {
  loading = true;
  error = '';
  emit();

  try {
    bookings = await fetchBookings();
  } catch (err) {
    error = err.message || 'Unable to load bookings';
    bookings = [];
  } finally {
    loading = false;
    emit();
  }

  return snapshot;
}

export function getBookingById(id) {
  const target = String(id || '');
  return bookings.find((booking) => String(booking.id) === target) || null;
}

export async function ensureBooking(bookingId) {
  if (!bookingId) {
    throw new Error('Invalid booking');
  }

  const booking = await fetchBooking(bookingId);
  bookings = [booking, ...bookings.filter((item) => item.id !== booking.id)];
  emit();
  return booking;
}

export async function addBooking(payload) {
  const result = await createBookingRequest(payload);
  const booking = result.booking;
  bookings = [booking, ...bookings.filter((item) => item.id !== booking.id)];
  emit();
  return result;
}

export async function updateBooking(id, payload) {
  const result = await updateBookingRequest(id, payload);
  const booking = result.booking;
  bookings = bookings.map((item) => (item.id === id ? booking : item));
  emit();
  return result;
}

export async function deleteBooking(id) {
  const booking = await deleteBookingRequest(id);
  bookings = bookings.filter((item) => item.id !== id);
  selectionsByBookingId.delete(id);
  emit();
  return booking;
}

export async function ensureBookingVendorSelections(bookingId) {
  const selections = await fetchBookingVendorSelections(bookingId);
  selectionsByBookingId.set(bookingId, selections);
  return selections;
}
