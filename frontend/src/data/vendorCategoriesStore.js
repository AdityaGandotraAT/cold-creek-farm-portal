import {
  categoryIdFromName,
  requiredVendorCategoryNames,
  seedVendorCategoryRecords,
} from './vendorCategoriesMock.js';
import { renameVendorCategory } from './vendorsStore.js';

let categories = seedVendorCategoryRecords.map((category) => ({ ...category }));
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

export function getVendorCategoryById(id) {
  const target = String(id || '');
  return categories.find((category) => String(category.id) === target) || null;
}

export function getVendorCategoryNames({ includeInactive = false } = {}) {
  return categories
    .filter((category) => includeInactive || category.status === 'Active')
    .map((category) => category.name);
}

export function addVendorCategory(payload) {
  const name = String(payload.name || '').trim();
  if (!name) {
    throw new Error('Enter a category name.');
  }

  const id = categoryIdFromName(name);
  if (categories.some((category) => category.id === id || category.name.toLowerCase() === name.toLowerCase())) {
    throw new Error('A category with this name already exists.');
  }

  const category = {
    id,
    name,
    status: payload.status === 'Inactive' ? 'Inactive' : 'Active',
    required: false,
  };

  categories = [category, ...categories];
  emit();
  return category;
}

export function updateVendorCategory(id, payload) {
  const current = getVendorCategoryById(id);
  if (!current) {
    throw new Error('Category not found.');
  }

  const name = String(payload.name || '').trim();
  if (!name) {
    throw new Error('Enter a category name.');
  }

  const nextId = categoryIdFromName(name);
  const duplicate = categories.find(
    (category) =>
      category.id !== current.id &&
      (category.id === nextId || category.name.toLowerCase() === name.toLowerCase()),
  );
  if (duplicate) {
    throw new Error('A category with this name already exists.');
  }

  let status = payload.status === 'Inactive' ? 'Inactive' : 'Active';
  if (current.required || requiredVendorCategoryNames.includes(current.name)) {
    status = 'Active';
  }

  const nextName = current.required ? current.name : name;
  const category = {
    ...current,
    id: current.required ? current.id : nextId,
    name: nextName,
    status,
    required: current.required,
  };

  categories = categories.map((item) => (item.id === current.id ? category : item));
  if (nextName !== current.name) {
    renameVendorCategory(current.name, nextName);
  }
  emit();
  return category;
}
