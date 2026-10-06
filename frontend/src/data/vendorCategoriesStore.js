import {
  createVendorCategory as createVendorCategoryRequest,
  fetchVendorCategory,
  fetchVendorCategories,
  updateVendorCategoryRequest,
} from '../api/vendorCategories.js';
import { loadVendors } from './vendorsStore.js';

let categories = [];
let loading = false;
let error = '';
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getVendorCategories() {
  return categories;
}

export function subscribeVendorCategories(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function loadVendorCategories() {
  loading = true;
  error = '';
  emit();

  try {
    categories = await fetchVendorCategories();
  } catch (err) {
    error = err.message || 'Unable to load categories';
    categories = [];
  } finally {
    loading = false;
    emit();
  }

  return categories;
}

export function getVendorCategoryById(id) {
  const target = String(id || '');
  return categories.find((category) => String(category.id) === target) || null;
}

export function getVendorCategoryNames({ includeInactive = false } = {}) {
  return categories
    .filter((category) => includeInactive || category.status === 'Active')
    .map((category) => category.name);
}

export async function ensureVendorCategory(categoryId) {
  if (!categoryId) {
    throw new Error('Invalid category');
  }

  const cached = getVendorCategoryById(categoryId);
  if (cached) {
    return cached;
  }

  const category = await fetchVendorCategory(categoryId);
  categories = [category, ...categories.filter((item) => item.id !== category.id)];
  emit();
  return category;
}

export async function addVendorCategory(payload) {
  const category = await createVendorCategoryRequest(payload);
  categories = [category, ...categories.filter((item) => item.id !== category.id)];
  emit();
  return category;
}

export async function updateVendorCategory(id, payload) {
  const category = await updateVendorCategoryRequest(id, payload);
  categories = categories.map((item) => (item.id === id ? category : item));
  emit();
  await loadVendors();
  return category;
}

export function getVendorCategoriesLoading() {
  return loading;
}

export function getVendorCategoriesError() {
  return error;
}
