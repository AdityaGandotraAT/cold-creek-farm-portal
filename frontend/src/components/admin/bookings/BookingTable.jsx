import { Icon } from '../AdminIcons.jsx';
import StatusBadge from '../clients/StatusBadge.jsx';
import BookingRow from './BookingRow.jsx';
import {
  bookingStatusTone,
  formatEventDate,
  formatTimeRange,
} from '../dashboard/format.js';
import { REQUIRED_VENDOR_CATEGORIES } from '../../../data/bookingsMock.js';
import { getVendorSelectionLock } from '../../../data/vendorSelectionLock.js';

function BookingTable({ bookings, onView, onEdit }) {
  if (bookings.length === 0) {
    return (
      <div className="clients-empty bookings-empty">
        <Icon name="bookings" />
        <p>No bookings found.</p>
        <span>Try a different name, booking number, venue, or filter.</span>
      </div>
    );
  }

  return (
    <>
      <div className="clients-table-wrap bookings-table-wrap">
        <table className="clients-table bookings-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Booking/Reference Number</th>
              <th>Event Date</th>
              <th>Event Time</th>
              <th>Venue</th>
              <th>Guests</th>
              <th>Booking Status</th>
              <th>Vendor Selection</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                onView={onView}
                onEdit={onEdit}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ul className="clients-cards">
        {bookings.map((booking) => (
          <li key={booking.id} className="clients-card">
            <div className="clients-card__top">
              <div>
                <strong>{booking.name}</strong>
                <div className="clients-table__ref">{booking.referenceNumber}</div>
              </div>
              <StatusBadge tone={bookingStatusTone(booking.bookingStatus)}>
                {booking.bookingStatus}
              </StatusBadge>
            </div>
            <p>
              {formatEventDate(booking.eventDate)} ·{' '}
              {formatTimeRange(booking.eventStartTime, booking.eventEndTime)}
            </p>
            <p>{booking.venue}</p>
            <p>{booking.guests} guests</p>
            <p>
              Vendor selection {booking.selectedCount} / {REQUIRED_VENDOR_CATEGORIES}
              {' · '}
              {getVendorSelectionLock(booking.eventDate).status}
            </p>
            <div className="clients-table__actions">
              <button className="clients-action" type="button" onClick={() => onView(booking)}>
                <Icon name="eye" />
                View
              </button>
              <button className="clients-action" type="button" onClick={() => onEdit(booking)}>
                <Icon name="edit" />
                Edit
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default BookingTable;
