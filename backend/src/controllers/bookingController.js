import {
  createBooking,
  deleteBooking,
  getBookingById,
  getBookingVendorSelections,
  listBookings,
  updateBooking,
} from '../services/bookingService.js';
import { HttpError } from '../utils/httpError.js';

export async function getBookings(_req, res, next) {
  try {
    const bookings = await listBookings();
    res.status(200).json({ status: 'ok', bookings });
  } catch (err) {
    next(err);
  }
}

export async function getBooking(req, res, next) {
  try {
    const booking = await getBookingById(req.params.bookingId);
    if (!booking) {
      throw new HttpError(404, 'Booking not found');
    }
    res.status(200).json({ status: 'ok', booking });
  } catch (err) {
    next(err);
  }
}

export async function getBookingSelections(req, res, next) {
  try {
    const selections = await getBookingVendorSelections(req.params.bookingId);
    res.status(200).json({ status: 'ok', selections });
  } catch (err) {
    next(err);
  }
}

export async function postBooking(req, res, next) {
  try {
    const result = await createBooking(req.body || {});
    res.status(201).json({ status: 'ok', ...result });
  } catch (err) {
    next(err);
  }
}

export async function putBooking(req, res, next) {
  try {
    const result = await updateBooking(req.params.bookingId, req.body || {});
    res.status(200).json({ status: 'ok', ...result });
  } catch (err) {
    next(err);
  }
}

export async function removeBooking(req, res, next) {
  try {
    const booking = await deleteBooking(req.params.bookingId);
    res.status(200).json({
      status: 'ok',
      message: 'Booking deleted',
      booking,
    });
  } catch (err) {
    next(err);
  }
}
