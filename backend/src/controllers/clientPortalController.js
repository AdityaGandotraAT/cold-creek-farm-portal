import {
  getBookingForUser,
  getClientVendorWorkspace,
  saveClientVendorSelection,
} from '../services/bookingService.js';

export async function getMyBooking(req, res, next) {
  try {
    const booking = await getBookingForUser(req.user.id);
    res.status(200).json({ status: 'ok', booking });
  } catch (err) {
    next(err);
  }
}

export async function getMyVendorSelections(req, res, next) {
  try {
    const result = await getClientVendorWorkspace(req.user.id);
    res.status(200).json({ status: 'ok', ...result });
  } catch (err) {
    next(err);
  }
}

export async function putMyVendorSelection(req, res, next) {
  try {
    const result = await saveClientVendorSelection(req.user.id, req.body || {});
    res.status(200).json({
      status: 'ok',
      message: result.emailSent ? 'Vendor selected and notification sent' : 'Vendor selection saved',
      ...result,
    });
  } catch (err) {
    next(err);
  }
}
