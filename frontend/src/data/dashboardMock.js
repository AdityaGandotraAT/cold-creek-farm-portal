export const dashboardSummary = [
  {
    id: 'clients',
    label: 'Total Clients',
    value: 48,
    icon: 'clients',
    hint: 'Active portal accounts',
    to: '/admin/clients',
    tone: 'default',
  },
  {
    id: 'bookings',
    label: 'Total Bookings',
    value: 36,
    icon: 'bookings',
    hint: 'Confirmed and pending',
    to: '/admin/bookings',
    tone: 'default',
  },
  {
    id: 'upcoming',
    label: 'Upcoming Events',
    value: 9,
    icon: 'clock',
    hint: 'Next 90 days',
    to: '/admin/bookings',
    tone: 'default',
  },
  {
    id: 'selections',
    label: 'Vendor Selections Pending',
    value: 14,
    icon: 'selections',
    hint: 'Across open bookings',
    to: '/admin/bookings',
    tone: 'pending',
  },
  {
    id: 'confirmations',
    label: 'Vendor Confirmations Pending',
    value: 7,
    icon: 'notifications',
    hint: 'Awaiting vendor reply',
    to: '/admin/bookings',
    tone: 'alert',
  },
];

export const upcomingEvents = [
  {
    id: 'evt-1008',
    bookingId: 'bkg-1008',
    clientName: 'Harper Bennett',
    eventDate: '2026-10-11',
    venue: 'The Barn',
    bookingStatus: 'Confirmed',
    selectedCount: 5,
    requiredCount: 6,
  },
  {
    id: 'evt-1012',
    bookingId: 'bkg-1012',
    clientName: 'Amelia Whitaker',
    eventDate: '2026-10-24',
    venue: 'Farmhouse Lawn',
    bookingStatus: 'Confirmed',
    selectedCount: 6,
    requiredCount: 6,
  },
  {
    id: 'evt-1015',
    bookingId: 'bkg-1015',
    clientName: 'Elena Ruiz',
    eventDate: '2026-11-07',
    venue: 'The Barn',
    bookingStatus: 'Confirmed',
    selectedCount: 4,
    requiredCount: 6,
  },
  {
    id: 'evt-1019',
    bookingId: 'bkg-1019',
    clientName: 'Claire Ellison',
    eventDate: '2026-11-21',
    venue: 'Creek Pavilion',
    bookingStatus: 'Pending',
    selectedCount: 2,
    requiredCount: 6,
  },
  {
    id: 'evt-1024',
    bookingId: 'bkg-1024',
    clientName: 'Sophia Grant',
    eventDate: '2026-12-05',
    venue: 'The Barn',
    bookingStatus: 'Confirmed',
    selectedCount: 3,
    requiredCount: 6,
  },
];

export const vendorCategoryOverview = [
  { category: 'Florist', selected: 28, pending: 6, unavailable: 2 },
  { category: 'Photographers', selected: 31, pending: 4, unavailable: 1 },
  { category: 'Catering', selected: 24, pending: 8, unavailable: 3 },
  { category: 'DJs', selected: 26, pending: 7, unavailable: 2 },
  { category: 'Rentals', selected: 30, pending: 5, unavailable: 1 },
  { category: 'Wedding Officiants', selected: 22, pending: 9, unavailable: 4 },
];

export const attentionItems = [
  {
    id: 'att-1',
    title: 'Vendor availability response pending',
    detail: 'Lacey Creative Design has not replied for Harper Bennett (Oct 11).',
    severity: 'high',
  },
  {
    id: 'att-2',
    title: 'Vendor unavailable for a booking',
    detail: 'BackwoodzBoyz Entertainment marked unavailable for Elena Ruiz (Nov 7).',
    severity: 'high',
  },
  {
    id: 'att-3',
    title: 'Client has not completed a vendor selection',
    detail: 'Claire Ellison still needs Florist, Catering, DJs, and Wedding Officiants.',
    severity: 'medium',
  },
  {
    id: 'att-4',
    title: 'Upcoming event with incomplete selections',
    detail: 'Sophia Grant (Dec 5) has 3 of 6 required vendors selected.',
    severity: 'medium',
  },
];

export const recentActivity = [
  {
    id: 'act-1',
    type: 'client_created',
    text: 'Client account created for Claire Ellison.',
    occurredAt: '2026-09-03T16:42:00',
  },
  {
    id: 'act-2',
    type: 'vendor_selected',
    text: 'Photographers selected for Amelia Whitaker.',
    occurredAt: '2026-09-03T14:18:00',
  },
  {
    id: 'act-3',
    type: 'vendor_confirmed',
    text: "Tam's Backstage confirmed for Harper Bennett.",
    occurredAt: '2026-09-02T11:05:00',
  },
  {
    id: 'act-4',
    type: 'vendor_unavailable',
    text: 'BackwoodzBoyz Entertainment marked unavailable for Elena Ruiz.',
    occurredAt: '2026-09-02T09:27:00',
  },
  {
    id: 'act-5',
    type: 'booking_updated',
    text: 'Booking updated for Sophia Grant — guest count set to 148.',
    occurredAt: '2026-09-01T17:10:00',
  },
];
