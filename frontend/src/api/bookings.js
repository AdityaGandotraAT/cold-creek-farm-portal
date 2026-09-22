import { getSession } from '../auth/session.js';

function authHeaders() {
  const session = getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: session?.token ? `Bearer ${session.token}` : '',
  };
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export async function fetchBookings() {
  const response = await fetch('/api/bookings', {
    headers: authHeaders(),
  });
  const data = await parseResponse(response);
  return data.bookings;
}

export async function fetchBooking(bookingId) {
  const response = await fetch(`/api/bookings/${bookingId}`, {
    headers: authHeaders(),
  });
  const data = await parseResponse(response);
  return data.booking;
}

export async function fetchBookingVendorSelections(bookingId) {
  const response = await fetch(`/api/bookings/${bookingId}/vendor-selections`, {
    headers: authHeaders(),
  });
  const data = await parseResponse(response);
  return data.selections;
}

export async function createBooking(payload) {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function updateBooking(bookingId, payload) {
  const response = await fetch(`/api/bookings/${bookingId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function deleteBooking(bookingId) {
  const response = await fetch(`/api/bookings/${bookingId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await parseResponse(response);
  return data.booking;
}
