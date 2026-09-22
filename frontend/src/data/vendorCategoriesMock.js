import { vendorCategories as requiredVendorCategoryNames } from './bookingsMock.js';
import { vendorCategories as seedCategoryNames } from './vendorsMock.js';

export { requiredVendorCategoryNames };

export function categoryIdFromName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const seedVendorCategoryRecords = seedCategoryNames.map((name) => ({
  id: categoryIdFromName(name),
  name,
  status: 'Active',
  required: requiredVendorCategoryNames.includes(name),
}));

export function withVendorCounts(categories, vendors) {
  return categories.map((category) => ({
    ...category,
    vendorCount: vendors.filter((vendor) => vendor.category === category.name).length,
  }));
}
