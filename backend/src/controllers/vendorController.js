import {
  createVendor,
  deleteVendor,
  getVendorById,
  listVendors,
  updateVendor,
} from '../services/vendorService.js';
import { HttpError } from '../utils/httpError.js';

export async function getVendors(_req, res, next) {
  try {
    const vendors = await listVendors();
    res.status(200).json({ status: 'ok', vendors });
  } catch (err) {
    next(err);
  }
}

export async function getVendor(req, res, next) {
  try {
    const vendor = await getVendorById(req.params.vendorId);
    if (!vendor) {
      throw new HttpError(404, 'Vendor not found');
    }

    res.status(200).json({ status: 'ok', vendor });
  } catch (err) {
    next(err);
  }
}

export async function postVendor(req, res, next) {
  try {
    const vendor = await createVendor(req.body || {});
    res.status(201).json({ status: 'ok', vendor });
  } catch (err) {
    next(err);
  }
}

export async function putVendor(req, res, next) {
  try {
    const vendor = await updateVendor(req.params.vendorId, req.body || {});
    res.status(200).json({ status: 'ok', vendor });
  } catch (err) {
    next(err);
  }
}

export async function removeVendor(req, res, next) {
  try {
    const vendor = await deleteVendor(req.params.vendorId);
    res.status(200).json({
      status: 'ok',
      message: 'Vendor deleted',
      vendor,
    });
  } catch (err) {
    next(err);
  }
}
