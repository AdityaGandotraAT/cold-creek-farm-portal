import StatusBadge from '../clients/StatusBadge.jsx';
import { bookingStatusTone, formatEventDate } from '../dashboard/format.js';

function VendorBookingLines({ bookings = [] }) {
  if (bookings.length === 0) {
    return <span className="vendors-bookings__empty">No bookings</span>;
  }

  const label = bookings.length === 1 ? '1 booking' : `${bookings.length} bookings`;

  return (
    <div className="vendors-bookings">
      <p className="vendors-bookings__count">{label}</p>
      <ul>
        {bookings.map((booking) => (
          <li key={`${booking.id}-${booking.category}`}>
            <div className="vendors-bookings__top">
              <span className="vendors-bookings__event">{booking.eventName}</span>
              <StatusBadge tone={bookingStatusTone(booking.selectionStatus)}>
                {booking.selectionStatus}
              </StatusBadge>
            </div>
            <span className="vendors-bookings__meta">
              {booking.clientName} · {formatEventDate(booking.eventDate)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VendorBookingLines;
