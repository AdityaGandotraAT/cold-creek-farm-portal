import { vendorCategories } from './bookingsMock.js';

const selectionsByBookingId = {
  'bkg-1001': {
    Florist: { vendor: 'Posh Petals of Gainesville', status: 'Confirmed' },
    Photographers: { vendor: 'Cait Carr Photo', status: 'Pending' },
    Catering: { vendor: 'Sabrosa Catering', status: 'Confirmed' },
    Rentals: { vendor: 'Southern Vintage', status: 'Confirmed' },
  },
  'bkg-1008': {
    Florist: { vendor: 'La Petite Fleur', status: 'Confirmed' },
    Photographers: { vendor: 'Grizzle Photography & Video', status: 'Confirmed' },
    Catering: { vendor: "Tam's Backstage", status: 'Pending' },
    DJs: { vendor: 'BackwoodzBoyz Entertainment', status: 'Confirmed' },
    Rentals: { vendor: 'Southern Vintage', status: 'Confirmed' },
  },
  'bkg-1012': {
    Florist: { vendor: 'Stowers Flowers', status: 'Confirmed' },
    Photographers: { vendor: 'Taylor Haff', status: 'Confirmed' },
    Catering: { vendor: 'A Perfect Gathering Catering', status: 'Confirmed' },
    DJs: { vendor: 'Silver Star Productions', status: 'Confirmed' },
    Rentals: { vendor: 'Southern Vintage', status: 'Confirmed' },
    'Wedding Officiants': { vendor: 'Terry Pisell', status: 'Confirmed' },
  },
  'bkg-1015': {
    Florist: { vendor: 'Lacey Creative Design', status: 'Confirmed' },
    Photographers: { vendor: 'Mike Moon Studio', status: 'Pending' },
    Catering: { vendor: 'Quillians Grill & Catering Co.', status: 'Confirmed' },
    'Wedding Officiants': { vendor: 'Rick Sefzik', status: 'Confirmed' },
  },
  'bkg-1019': {
    Photographers: { vendor: 'Christina Kelley Photography & Video', status: 'Pending' },
    Rentals: { vendor: 'Southern Vintage', status: 'Confirmed' },
  },
  'bkg-1024': {
    Florist: { vendor: 'Posh Petals of Gainesville', status: 'Confirmed' },
    Photographers: { vendor: 'Momo Lux Photo & Video', status: 'Pending' },
    Catering: { vendor: 'The SIP', status: 'Confirmed' },
  },
  'bkg-1028': {
    Photographers: { vendor: 'Cait Carr Photo', status: 'Pending' },
  },
  'bkg-1031': {
    Florist: { vendor: 'La Petite Fleur', status: 'Confirmed' },
    Photographers: { vendor: 'Grizzle Photography & Video', status: 'Confirmed' },
    Catering: { vendor: 'Sabrosa Catering', status: 'Confirmed' },
    DJs: { vendor: 'Weddings Only DJ Entertainment', status: 'Confirmed' },
    Rentals: { vendor: 'Southern Vintage', status: 'Confirmed' },
    'Wedding Officiants': { vendor: 'Terry Pisell', status: 'Confirmed' },
  },
};

export function getBookingVendorSelections(bookingId) {
  const selected = selectionsByBookingId[bookingId] || {};

  return vendorCategories.map((category) => {
    const item = selected[category];

    if (!item) {
      return {
        category,
        vendor: null,
        status: 'Not Selected',
      };
    }

    return {
      category,
      vendor: item.vendor,
      status: item.status,
    };
  });
}
