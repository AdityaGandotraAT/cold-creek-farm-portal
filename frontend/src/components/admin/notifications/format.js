export function notificationTone(type) {
  if (type === 'Vendor unavailable' || type === 'Incomplete selection') {
    return 'pending';
  }

  if (type === 'Vendor confirmed') {
    return 'confirmed';
  }

  return 'neutral';
}

export function notificationIcon(type) {
  if (type === 'Vendor pending reply' || type === 'Incomplete selection') {
    return 'alert';
  }

  if (type === 'Vendor confirmed') {
    return 'selections';
  }

  if (type === 'Vendor unavailable') {
    return 'alert';
  }

  if (type === 'Client created') {
    return 'clients';
  }

  if (type === 'Booking updated') {
    return 'bookings';
  }

  return 'notifications';
}
