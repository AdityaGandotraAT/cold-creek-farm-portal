export const REQUIRED_VENDOR_CATEGORIES = [
  'Florist',
  'Photographers',
  'Catering',
  'DJs',
  'Rentals',
  'Wedding Officiants',
];

export const mockVendorOptionsByCategory = {};
export const mockVendorSelections = [];
export const mockClientNotifications = [];

export function countSelectedVendors(selections = mockVendorSelections) {
  return selections.filter((item) => item.vendor && item.status !== 'Not Selected').length;
}
