import { vendorCategories as requiredVendorCategoryNames } from './bookingsMock.js';
import { vendorCategories } from './vendorsMock.js';

export { requiredVendorCategoryNames };

export function categoryIdFromName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const vendorCategoryRecords = vendorCategories.map((name) => ({
  id: categoryIdFromName(name),
  name,
  status: 'Active',
  required: requiredVendorCategoryNames.includes(name),
}));

export function getVendorCategoryById(id) {
  return vendorCategoryRecords.find((category) => category.id === id) || null;
}

export function withVendorCounts(categories, vendors) {
  return categories.map((category) => ({
    ...category,
    vendorCount: vendors.filter((vendor) => vendor.category === category.name).length,
  }));
}
