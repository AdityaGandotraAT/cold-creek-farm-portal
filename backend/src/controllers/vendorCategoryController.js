import {
  createVendorCategory,
  getVendorCategoryById,
  getVendorSelectionOverview,
  listVendorCategories,
  updateVendorCategory,
} from '../services/vendorCategoryService.js';
import { HttpError } from '../utils/httpError.js';

export async function getVendorCategories(_req, res, next) {
  try {
    const categories = await listVendorCategories();
    res.status(200).json({ status: 'ok', categories });
  } catch (err) {
    next(err);
  }
}

export async function getVendorCategoryOverview(_req, res, next) {
  try {
    const categories = await getVendorSelectionOverview();
    res.status(200).json({ status: 'ok', categories });
  } catch (err) {
    next(err);
  }
}

export async function getVendorCategory(req, res, next) {
  try {
    const category = await getVendorCategoryById(req.params.categoryId);
    if (!category) {
      throw new HttpError(404, 'Category not found');
    }

    res.status(200).json({ status: 'ok', category });
  } catch (err) {
    next(err);
  }
}

export async function postVendorCategory(req, res, next) {
  try {
    const category = await createVendorCategory(req.body || {});
    res.status(201).json({ status: 'ok', category });
  } catch (err) {
    next(err);
  }
}

export async function putVendorCategory(req, res, next) {
  try {
    const category = await updateVendorCategory(req.params.categoryId, req.body || {});
    res.status(200).json({ status: 'ok', category });
  } catch (err) {
    next(err);
  }
}
