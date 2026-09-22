import { REQUIRED_VENDOR_CATEGORIES } from './bookingsMock.js';
import { daysBetweenFarmISO, farmTodayISO } from './farmTime.js';

function bookingLabel(booking) {
  return booking.clientName || booking.name || booking.eventName || 'Untitled booking';
}

export function dashboardFromRecords({ bookings = [], clients = [] } = {}) {
  const today = farmTodayISO();
  const upcomingBookings = bookings
    .filter((booking) => booking.eventDate && daysBetweenFarmISO(booking.eventDate, today) >= 0)
    .sort((a, b) => String(a.eventDate).localeCompare(String(b.eventDate)));

  const upcomingEvents = upcomingBookings.slice(0, 8).map((booking) => ({
    id: booking.id,
    bookingId: booking.id,
    clientName: bookingLabel(booking),
    eventDate: booking.eventDate,
    venue: booking.venue,
    bookingStatus: booking.bookingStatus,
    selectedCount: Number(booking.selectedCount) || 0,
    requiredCount: REQUIRED_VENDOR_CATEGORIES,
  }));

  const incomplete = bookings.filter(
    (booking) => (Number(booking.selectedCount) || 0) < REQUIRED_VENDOR_CATEGORIES,
  );
  const unassigned = bookings.filter((booking) => !booking.clientId);

  const dashboardSummary = [
    {
      id: 'clients',
      label: 'Total Clients',
      value: clients.length,
      icon: 'clients',
      hint: 'Portal client records',
      to: '/admin/clients',
      tone: 'default',
    },
    {
      id: 'bookings',
      label: 'Total Bookings',
      value: bookings.length,
      icon: 'bookings',
      hint: 'Confirmed and pending',
      to: '/admin/bookings',
      tone: 'default',
    },
    {
      id: 'upcoming',
      label: 'Upcoming Events',
      value: upcomingBookings.length,
      icon: 'clock',
      hint: 'Today and later',
      to: '/admin/bookings',
      tone: 'default',
    },
    {
      id: 'selections',
      label: 'Vendor Selections Pending',
      value: incomplete.length,
      icon: 'selections',
      hint: 'Bookings still missing vendors',
      to: '/admin/bookings',
      tone: incomplete.length ? 'pending' : 'default',
    },
    {
      id: 'unassigned',
      label: 'Unassigned Bookings',
      value: unassigned.length,
      icon: 'notifications',
      hint: 'No client linked yet',
      to: '/admin/bookings',
      tone: unassigned.length ? 'alert' : 'default',
    },
  ];

  const attentionItems = [
    ...unassigned.map((booking) => ({
      id: `unassigned-${booking.id}`,
      title: 'Booking is not assigned to a client',
      detail: `${bookingLabel(booking)} (${booking.referenceNumber}) will not appear in a client portal until a client is selected.`,
      severity: 'high',
    })),
    ...incomplete
      .filter((booking) => booking.clientId)
      .map((booking) => ({
        id: `incomplete-${booking.id}`,
        title: 'Vendor selections are incomplete',
        detail: `${bookingLabel(booking)} has ${Number(booking.selectedCount) || 0} of ${REQUIRED_VENDOR_CATEGORIES} required vendors selected.`,
        severity: 'medium',
      })),
  ];

  const recentActivity = [...bookings]
    .filter((booking) => booking.updatedAt || booking.createdAt)
    .sort((a, b) =>
      String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)),
    )
    .slice(0, 8)
    .map((booking) => ({
      id: `act-${booking.id}`,
      type: 'booking_updated',
      text: `${booking.eventName || booking.name} · ${booking.referenceNumber}`,
      occurredAt: booking.updatedAt || booking.createdAt,
    }));

  return {
    dashboardSummary,
    upcomingEvents,
    vendorCategoryOverview: [],
    attentionItems,
    recentActivity,
  };
}
